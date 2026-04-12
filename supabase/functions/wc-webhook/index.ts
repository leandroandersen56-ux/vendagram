import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-wc-webhook-topic, x-wc-webhook-source, x-wc-webhook-signature, x-wc-webhook-id, x-wc-webhook-delivery-id",
};

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const computed = createHmac("sha256", secret).update(payload).digest("base64");
  return computed === signature;
}

async function upsertOrder(supabase: any, o: any) {
  const extId = String(o.id);
  const { data: existing } = await supabase
    .from("external_orders")
    .select("id")
    .eq("external_id", extId)
    .maybeSingle();

  const totalAmount = parseFloat(o.total) || 0;
  const status = o.status || "pending";
  const paymentMethod = o.payment_method_title || o.payment_method || null;

  if (existing) {
    await supabase
      .from("external_orders")
      .update({ status, total_amount: totalAmount, payment_method: paymentMethod, updated_at: new Date().toISOString() })
      .eq("external_id", extId);
    return "updated";
  }

  // Customer
  let customerId: string | null = null;
  const name = `${o.billing?.first_name || ""} ${o.billing?.last_name || ""}`.trim() || null;
  const email = o.billing?.email || null;

  if (email) {
    const { data: ec } = await supabase.from("external_customers").select("id").eq("email", email).maybeSingle();
    if (ec) customerId = ec.id;
  }
  if (!customerId && (name || email)) {
    const { data: nc } = await supabase
      .from("external_customers")
      .insert({ name, email, country: o.billing?.country || null })
      .select("id")
      .single();
    customerId = nc?.id ?? null;
  }

  const commission = Math.round(totalAmount * 0.07 * 100) / 100;
  const netAmount = Math.round((totalAmount - commission) * 100) / 100;

  const { data: newOrder, error } = await supabase
    .from("external_orders")
    .insert({
      external_id: extId,
      customer_id: customerId,
      status,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      commission,
      net_amount: netAmount,
      currency: o.currency || "BRL",
      raw_data: o,
      ordered_at: o.date_created || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error(`Insert order ${extId}:`, error.message);
    return "error";
  }

  if (newOrder && o.line_items?.length) {
    await supabase.from("external_order_items").insert(
      o.line_items.map((i: any) => ({
        order_id: newOrder.id,
        product_name: i.name || "Produto",
        category: null,
        price: parseFloat(i.total) || 0,
        quantity: i.quantity || 1,
        external_product_id: String(i.product_id || ""),
      }))
    );
  }

  return "inserted";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // WooCommerce sends a ping on webhook creation — respond 200
  const topic = req.headers.get("x-wc-webhook-topic");
  if (!topic) {
    return new Response(JSON.stringify({ ok: true, message: "pong" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log(`📦 WC Webhook received — topic: ${topic}`);

  // Only process order events
  if (!topic.startsWith("order.")) {
    console.log(`⏭️ Ignoring non-order topic: ${topic}`);
    return new Response(JSON.stringify({ ok: true, skipped: true, topic }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text();

  // Verify signature if webhook secret is set
  const wcWebhookSecret = Deno.env.get("WC_WEBHOOK_SECRET");
  if (wcWebhookSecret) {
    const sig = req.headers.get("x-wc-webhook-signature");
    if (!verifySignature(rawBody, sig, wcWebhookSecret)) {
      console.error("❌ Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("✅ Webhook signature verified");
  } else {
    console.log("⚠️ WC_WEBHOOK_SECRET not set — skipping signature verification");
  }

  try {
    const order = JSON.parse(rawBody);

    if (!order.id) {
      return new Response(JSON.stringify({ error: "No order ID in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getSupabase();
    const result = await upsertOrder(supabase, order);

    console.log(`✅ Order #${order.id} → ${result}`);

    return new Response(
      JSON.stringify({ ok: true, order_id: order.id, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Webhook processing error:", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
