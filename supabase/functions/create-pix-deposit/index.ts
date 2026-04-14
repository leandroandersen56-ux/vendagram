const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")?.trim();
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");
    }

    const body = await req.json();
    const { amount, payer_email, payer_cpf, payer_first_name, payer_last_name, deposit_id } = body;

    if (!amount || !payer_email || !payer_cpf || !payer_first_name || !deposit_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (Number(amount) < 5) {
      return new Response(JSON.stringify({ error: "Valor mínimo: R$ 5,00" }), {
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
        "X-Idempotency-Key": deposit_id,
      },
      body: JSON.stringify({
        transaction_amount: Number(amount),
        description: `Froiv - Depósito na carteira`,
        payment_method_id: "pix",
        payer: {
          email: payer_email,
          first_name: payer_first_name,
          last_name: payer_last_name || "",
          identification: { type: "CPF", number: cleanCpf },
        },
        external_reference: `deposit_${deposit_id}`,
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Mercado Pago error:", JSON.stringify(mpData));
      return new Response(JSON.stringify({
        error: "Failed to create deposit payment",
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
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
