import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PRODUCTION_SUPABASE_URL = Deno.env.get("PERSONAL_SUPABASE_URL")?.trim() || "https://yzwncktlibdfycqhvlqg.supabase.co";

type SupabaseClientEntry = {
  label: string;
  client: ReturnType<typeof createClient>;
};

function createSupabaseClients() {
  const productionKey = Deno.env.get("PERSONAL_SUPABASE_SERVICE_ROLE_KEY")?.trim();
  const cloudUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const cloudKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

  const clients: SupabaseClientEntry[] = [];

  if (productionKey) {
    clients.push({
      label: "production",
      client: createClient(PRODUCTION_SUPABASE_URL, productionKey),
    });
  }

  if (cloudUrl && cloudKey) {
    clients.push({
      label: "cloud",
      client: createClient(cloudUrl, cloudKey),
    });
  }

  if (!clients.length || !cloudUrl || !cloudKey) {
    throw new Error("Supabase service credentials are not configured correctly");
  }

  return { clients, cloudUrl, cloudKey };
}

async function findTransaction(clients: SupabaseClientEntry[], transactionId: string) {
  for (const { label, client } of clients) {
    const { data, error } = await client
      .from("transactions")
      .select("id, status")
      .eq("id", transactionId)
      .maybeSingle();

    if (!error && data) {
      return { label, client, transaction: data };
    }

    if (error) {
      console.error(`[check-payment-status] ${label} query error:`, error.message);
    }
  }

  return null;
}

async function fetchPaymentStatus(transactionId: string, paymentId?: string | number | null) {
  const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")?.trim();
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");
  }

  const endpoint = paymentId
    ? `https://api.mercadopago.com/v1/payments/${paymentId}`
    : `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(transactionId)}&sort=date_created&criteria=desc&limit=1`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Failed to fetch Mercado Pago payment status");
  }

  if (paymentId) {
    return payload;
  }

  return payload?.results?.[0] || null;
}

async function triggerWebhookSync(cloudUrl: string, cloudKey: string, paymentId: string | number) {
  const response = await fetch(`${cloudUrl}/functions/v1/mercadopago-webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cloudKey}`,
    },
    body: JSON.stringify({
      type: "payment",
      action: "payment.updated",
      data: { id: paymentId },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Webhook sync failed with status ${response.status}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { transaction_id, payment_id } = await req.json();

    if (!transaction_id) {
      return new Response(JSON.stringify({ error: "transaction_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { clients, cloudUrl, cloudKey } = createSupabaseClients();
    const transactionResult = await findTransaction(clients, transaction_id);

    if (!transactionResult) {
      return new Response(JSON.stringify({ error: "Transaction not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (["paid", "transfer_in_progress", "credentials_sent", "completed", "cancelled"].includes(transactionResult.transaction.status)) {
      return new Response(JSON.stringify({
        transaction_status: transactionResult.transaction.status,
        payment_status: null,
        synced: false,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payment = await fetchPaymentStatus(transaction_id, payment_id);

    if (!payment) {
      return new Response(JSON.stringify({
        transaction_status: transactionResult.transaction.status,
        payment_status: "pending",
        synced: false,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (["approved", "cancelled", "rejected"].includes(payment.status)) {
      await triggerWebhookSync(cloudUrl, cloudKey, payment.id);
    }

    const refreshedTransaction = await findTransaction(clients, transaction_id);

    return new Response(JSON.stringify({
      transaction_status: refreshedTransaction?.transaction.status || transactionResult.transaction.status,
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