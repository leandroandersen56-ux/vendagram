import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DB_URL = "https://yzwncktlibdfycqhvlqg.supabase.co";

function getSupabase() {
  const key = Deno.env.get("PERSONAL_SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!key) throw new Error("PERSONAL_SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(DB_URL, key);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { transaction_id, payment_id } = await req.json();
    if (!transaction_id) {
      return new Response(JSON.stringify({ error: "transaction_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getSupabase();

    // Check current status in DB
    const { data: tx } = await supabase
      .from("transactions")
      .select("id, status")
      .eq("id", transaction_id)
      .maybeSingle();

    if (!tx) {
      return new Response(JSON.stringify({ error: "Transaction not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Already processed
    const doneStatuses = ["paid", "transfer_in_progress", "credentials_sent", "completed", "cancelled"];
    if (doneStatuses.includes(tx.status)) {
      return new Response(JSON.stringify({
        transaction_status: tx.status,
        payment_status: null,
        synced: false,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check Mercado Pago directly
    const MP_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")?.trim();
    if (!MP_TOKEN) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

    const endpoint = payment_id
      ? `https://api.mercadopago.com/v1/payments/${payment_id}`
      : `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(transaction_id)}&sort=date_created&criteria=desc&limit=1`;

    const mpRes = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${MP_TOKEN}` },
    });
    const mpData = await mpRes.json();
    const payment = payment_id ? mpData : mpData?.results?.[0];

    if (!payment) {
      return new Response(JSON.stringify({
        transaction_status: tx.status,
        payment_status: "pending",
        synced: false,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If approved/cancelled/rejected on MP but still pending in DB, trigger webhook
    if (["approved", "cancelled", "rejected"].includes(payment.status)) {
      const cloudUrl = Deno.env.get("SUPABASE_URL")?.trim();
      const cloudKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
      if (cloudUrl && cloudKey) {
        await fetch(`${cloudUrl}/functions/v1/mercadopago-webhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${cloudKey}` },
          body: JSON.stringify({ type: "payment", action: "payment.updated", data: { id: payment.id } }),
        });
      }
    }

    // Re-check DB after sync
    const { data: refreshed } = await supabase
      .from("transactions")
      .select("status")
      .eq("id", transaction_id)
      .maybeSingle();

    return new Response(JSON.stringify({
      transaction_status: refreshed?.status || tx.status,
      payment_status: payment.status,
      payment_id: payment.id,
      synced: ["approved", "cancelled", "rejected"].includes(payment.status),
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[check-payment-status]", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
