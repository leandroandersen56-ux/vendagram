import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UAZAPI_BASE_URL = "https://ipazua.uazapi.com";
const UAZAPI_INSTANCE_ID = "c3bf5e66-6076-4ed0-b17c-21b47c776bce";

async function sendWhatsApp(token: string, phone: string, text: string) {
  const res = await fetch(`${UAZAPI_BASE_URL}/sendText/${UAZAPI_INSTANCE_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ number: phone, text }),
  });
  const result = await res.json();
  console.log(`WhatsApp to ${phone}:`, res.status, JSON.stringify(result));
  return { ok: res.ok, result };
}

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json();

    // ── Mode 1: notification_id (triggered by DB) ──
    if (body.notification_id) {
      const { data: notif, error: nErr } = await admin
        .from("notifications")
        .select("*")
        .eq("id", body.notification_id)
        .single();

      if (nErr || !notif) {
        console.error("Notification not found:", nErr);
        return new Response(
          JSON.stringify({ error: "Notification not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get user's whatsapp number
      const { data: profile } = await admin
        .from("profiles")
        .select("whatsapp, phone, name")
        .eq("user_id", notif.user_id)
        .single();

      const phone = profile?.whatsapp || profile?.phone;
      if (!phone) {
        console.log(`User ${notif.user_id} has no WhatsApp/phone registered, skipping`);
        return new Response(
          JSON.stringify({ skipped: true, reason: "no_phone" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Clean phone number (only digits)
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        console.log(`Invalid phone for user ${notif.user_id}: ${cleanPhone}`);
        return new Response(
          JSON.stringify({ skipped: true, reason: "invalid_phone" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const message = `📢 *Froiv*\n\n*${notif.title}*\n${notif.body}\n\n🔗 https://froiv.com${notif.link || ""}`;
      const { ok } = await sendWhatsApp(token, cleanPhone, message);

      return new Response(
        JSON.stringify({ success: ok }),
        { status: ok ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Mode 2: user_id + message (direct call) ──
    if (body.user_id && body.message) {
      const { data: profile } = await admin
        .from("profiles")
        .select("whatsapp, phone")
        .eq("user_id", body.user_id)
        .single();

      const phone = profile?.whatsapp || profile?.phone;
      if (!phone) {
        return new Response(
          JSON.stringify({ skipped: true, reason: "no_phone" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cleanPhone = phone.replace(/\D/g, "");
      const { ok } = await sendWhatsApp(token, cleanPhone, body.message);

      return new Response(
        JSON.stringify({ success: ok }),
        { status: ok ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Mode 3: transaction_id + type (legacy/sale notifications) ──
    if (body.transaction_id) {
      const { data: tx, error: txErr } = await admin
        .from("transactions")
        .select("*, listings(title, category, price)")
        .eq("id", body.transaction_id)
        .single();

      if (txErr || !tx) {
        return new Response(
          JSON.stringify({ error: "Transaction not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: buyerProfile } = await admin
        .from("profiles")
        .select("name, username")
        .eq("user_id", tx.buyer_id)
        .single();

      const { data: sellerProfile } = await admin
        .from("profiles")
        .select("whatsapp, phone")
        .eq("user_id", tx.seller_id)
        .single();

      const sellerPhone = sellerProfile?.whatsapp || sellerProfile?.phone;
      if (!sellerPhone) {
        return new Response(
          JSON.stringify({ skipped: true, reason: "seller_no_phone" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const buyerName = buyerProfile?.name || buyerProfile?.username || "Comprador";
      const listing = tx.listings as any;
      const amount = Number(tx.amount);
      const amountStr = `R$ ${amount.toFixed(2).replace(".", ",")}`;

      let message = "";
      if (body.type === "payment_confirmed") {
        message = `✅ *Pagamento confirmado!*\n\n📦 *Produto:* ${listing?.title || "Conta"}\n💰 *Valor:* ${amountStr}\n👤 *Comprador:* ${buyerName}\n\n📩 Acesse o chat da transação para enviar os dados de acesso.\n🔗 https://froiv.com/compras/${body.transaction_id}`;
      } else {
        message = `🎉 *Nova venda na Froiv!*\n\n📦 *Produto:* ${listing?.title || "Conta"}\n💰 *Valor:* ${amountStr}\n👤 *Comprador:* ${buyerName}\n\n⚡ Envie as credenciais pelo chat.\n🔗 https://froiv.com/compras/${body.transaction_id}`;
      }

      const cleanPhone = sellerPhone.replace(/\D/g, "");
      const { ok } = await sendWhatsApp(token, cleanPhone, message);

      return new Response(
        JSON.stringify({ success: ok }),
        { status: ok ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Provide notification_id, user_id+message, or transaction_id" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("notify-whatsapp error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
