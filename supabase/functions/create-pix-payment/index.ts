import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.100.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate JWT from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!
    ).auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { transaction_id, payer_email, payer_cpf, payer_first_name, payer_last_name } = body;

    if (!transaction_id || !payer_email || !payer_cpf || !payer_first_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transaction_id)
      .eq("buyer_id", user.id)
      .eq("status", "pending_payment")
      .single();

    if (txError || !transaction) {
      return new Response(JSON.stringify({ error: "Transaction not found or not pending" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean CPF (remove dots and dashes)
    const cleanCpf = payer_cpf.replace(/\D/g, "");

    // Create Mercado Pago Pix payment
    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": transaction_id,
      },
      body: JSON.stringify({
        transaction_amount: Number(transaction.amount),
        description: `Froiv - Compra #${transaction_id.slice(0, 8)}`,
        payment_method_id: "pix",
        payer: {
          email: payer_email,
          first_name: payer_first_name,
          last_name: payer_last_name || "",
          identification: {
            type: "CPF",
            number: cleanCpf,
          },
        },
        notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
        external_reference: transaction_id,
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Mercado Pago error:", JSON.stringify(mpData));
      return new Response(JSON.stringify({ 
        error: "Failed to create payment",
        details: mpData.message || mpData.cause?.[0]?.description || "Unknown error"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return Pix data
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
