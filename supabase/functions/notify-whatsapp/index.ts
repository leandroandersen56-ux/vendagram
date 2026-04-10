import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UAZAPI_BASE_URL = "https://ipazua.uazapi.com";
const UAZAPI_INSTANCE_ID = "c3bf5e66-6076-4ed0-b17c-21b47c776bce";
const SELLER_WHATSAPP = "554796300314";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get("UAZAPI_TOKEN");
    if (!token) {
      console.error("UAZAPI_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "WhatsApp not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { transaction_id, type } = await req.json();

    if (!transaction_id) {
      return new Response(
        JSON.stringify({ error: "transaction_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Fetch transaction with listing info
    const { data: tx, error: txErr } = await admin
      .from("transactions")
      .select("*, listings(title, category, price)")
      .eq("id", transaction_id)
      .single();

    if (txErr || !tx) {
      console.error("Transaction not found:", txErr);
      return new Response(
        JSON.stringify({ error: "Transaction not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch buyer profile
    const { data: buyerProfile } = await admin
      .from("profiles")
      .select("name, username, email")
      .eq("user_id", tx.buyer_id)
      .single();

    const buyerName = buyerProfile?.name || buyerProfile?.username || "Comprador";
    const listing = tx.listings as any;
    const amount = Number(tx.amount);

    let message = "";

    if (type === "sale") {
      message = `🎉 *Nova venda na Froiv!*\n\n` +
        `📦 *Produto:* ${listing?.title || "Sem título"}\n` +
        `💰 *Valor:* R$ ${amount.toFixed(2).replace(".", ",")}\n` +
        `👤 *Comprador:* ${buyerName}\n` +
        `🔗 *Transação:* ${transaction_id.slice(0, 8)}...\n\n` +
        `⚡ Envie as credenciais pelo chat da transação.`;
    } else if (type === "payment_confirmed") {
      message = `✅ *Pagamento confirmado!*\n\n` +
        `📦 *Produto:* ${listing?.title || "Sem título"}\n` +
        `💰 *Valor:* R$ ${amount.toFixed(2).replace(".", ",")}\n` +
        `👤 *Comprador:* ${buyerName}\n\n` +
        `📩 Acesse o chat da transação para enviar os dados de acesso.`;
    } else {
      message = `📢 *Atualização de transação*\n\n` +
        `📦 ${listing?.title || "Sem título"}\n` +
        `💰 R$ ${amount.toFixed(2).replace(".", ",")}\n` +
        `Status: ${type || "atualização"}`;
    }

    // Send WhatsApp message via UAZAPI
    const whatsappResponse = await fetch(
      `${UAZAPI_BASE_URL}/sendText/${UAZAPI_INSTANCE_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          number: SELLER_WHATSAPP,
          text: message,
        }),
      }
    );

    const whatsappResult = await whatsappResponse.json();
    console.log("WhatsApp response:", JSON.stringify(whatsappResult));

    if (!whatsappResponse.ok) {
      console.error("WhatsApp send failed:", whatsappResult);
      return new Response(
        JSON.stringify({ error: "Failed to send WhatsApp", details: whatsappResult }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("notify-whatsapp error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
