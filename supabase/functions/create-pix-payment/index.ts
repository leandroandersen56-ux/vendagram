const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")?.trim();
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");
    }

    const body = await req.json();
    const { transaction_id, amount, payer_email, payer_cpf, payer_first_name, payer_last_name } = body;

    if (!transaction_id || !amount || !payer_email || !payer_cpf || !payer_first_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanCpf = payer_cpf.replace(/\D/g, "");

    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": transaction_id,
      },
      body: JSON.stringify({
        transaction_amount: Number(amount),
        description: `Froiv - Compra #${transaction_id.slice(0, 8)}`,
        payment_method_id: "pix",
        payer: {
          email: payer_email,
          first_name: payer_first_name,
          last_name: payer_last_name || "",
          identification: { type: "CPF", number: cleanCpf },
        },
        external_reference: transaction_id,
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Mercado Pago error:", JSON.stringify(mpData));
      return new Response(JSON.stringify({
        error: "Failed to create payment",
        details: mpData.message || mpData.cause?.[0]?.description || "Unknown error",
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pixData = mpData.point_of_interaction?.transaction_data;

    return new Response(JSON.stringify({
      payment_id: mpData.id,
      status: mpData.status,
      qr_code: pixData?.qr_code || null,
      qr_code_base64: pixData?.qr_code_base64 || null,
      ticket_url: pixData?.ticket_url || null,
      expiration_date: mpData.date_of_expiration || null,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
