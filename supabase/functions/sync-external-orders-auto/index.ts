import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://alphapropriedadesdigitais.com.br";

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

// ─── WooCommerce REST API v3 — Orders only ───
async function fetchOrders(page: number, perPage = 50): Promise<{ orders: any[]; totalPages: number } | null> {
  const ck = Deno.env.get("WC_CONSUMER_KEY");
  const cs = Deno.env.get("WC_CONSUMER_SECRET");
  if (!ck || !cs) return null;

  const url = `${BASE_URL}/wp-json/wc/v3/orders?page=${page}&per_page=${perPage}&orderby=date&order=desc&consumer_key=${ck}&consumer_secret=${cs}`;
  const res = await fetch(url, { headers: { "User-Agent": "FroivSync/1.0" } });

  if (!res.ok) {
    console.error(`WC Orders API returned ${res.status}`);
    return null;
  }

  const totalPages = parseInt(res.headers.get("x-wp-totalpages") || "1");
  const data = await res.json();

  const orders = data.map((o: any) => ({
    external_id: String(o.id),
    status: o.status || "pending",
    total_amount: parseFloat(o.total) || 0,
    currency: o.currency || "BRL",
    payment_method: o.payment_method_title || o.payment_method || null,
    ordered_at: o.date_created || null,
    customer_name: `${o.billing?.first_name || ""} ${o.billing?.last_name || ""}`.trim() || null,
    customer_email: o.billing?.email || null,
    country: o.billing?.country || null,
    items: (o.line_items || []).map((i: any) => ({
      name: i.name || "Produto",
      price: parseFloat(i.total) || 0,
      quantity: i.quantity || 1,
      product_id: String(i.product_id || ""),
      category: null,
    })),
    raw: o,
  }));

  return { orders, totalPages };
}

// ─── Upsert orders into DB ───
async function upsertOrders(supabase: any, records: any[]): Promise<{ inserted: number; updated: number }> {
  let inserted = 0, updated = 0;

  for (const order of records) {
    const extId = order.external_id;
    const { data: existing } = await supabase.from("external_orders").select("id").eq("external_id", extId).maybeSingle();

    if (existing) {
      await supabase.from("external_orders").update({
        status: order.status,
        total_amount: order.total_amount,
        payment_method: order.payment_method,
        updated_at: new Date().toISOString(),
      }).eq("external_id", extId);
      updated++;
      continue;
    }

    let customerId: string | null = null;
    if (order.customer_name || order.customer_email) {
      if (order.customer_email) {
        const { data: ec } = await supabase.from("external_customers").select("id").eq("email", order.customer_email).maybeSingle();
        if (ec) customerId = ec.id;
      }
      if (!customerId) {
        const { data: nc } = await supabase.from("external_customers").insert({
          name: order.customer_name,
          email: order.customer_email,
          country: order.country,
        }).select("id").single();
        customerId = nc?.id ?? null;
      }
    }

    const total = order.total_amount;
    const commission = Math.round(total * 0.07 * 100) / 100;
    const net = Math.round((total - commission) * 100) / 100;

    const { data: newOrder, error } = await supabase.from("external_orders").insert({
      external_id: extId,
      customer_id: customerId,
      status: order.status,
      total_amount: total,
      payment_method: order.payment_method,
      commission,
      net_amount: net,
      currency: order.currency,
      raw_data: order.raw || {},
      ordered_at: order.ordered_at,
    }).select("id").single();

    if (error) { console.error(`Insert order ${extId}:`, error.message); continue; }

    if (newOrder && order.items?.length) {
      await supabase.from("external_order_items").insert(
        order.items.map((i: any) => ({
          order_id: newOrder.id,
          product_name: i.name || "Produto",
          category: i.category,
          price: i.price || 0,
          quantity: i.quantity || 1,
          external_product_id: i.product_id || null,
        }))
      );
    }
    inserted++;
  }
  return { inserted, updated };
}

// ─── Main ───
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let mode = "incremental";
    try { const b = await req.json(); mode = b?.mode || "incremental"; } catch { /* */ }

    const ck = Deno.env.get("WC_CONSUMER_KEY");
    const cs = Deno.env.get("WC_CONSUMER_SECRET");

    if (!ck || !cs) {
      console.log("⚠️ WooCommerce credentials not found — polling disabled");
      console.log("📡 Real-time capture active via wc-webhook endpoint");
      return new Response(JSON.stringify({
        success: true,
        strategy: "realtime_only",
        mode,
        inserted: 0,
        updated: 0,
        message: "Polling disabled (no WC credentials). Real-time capture active via wc-webhook endpoint. Configure WC_CONSUMER_KEY/SECRET for historical sync.",
        timestamp: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log("🔑 Using WooCommerce Orders API (/wp-json/wc/v3/orders)");

    const supabase = getSupabase();
    const maxPages = mode === "backfill" ? 500 : 3;
    let totalInserted = 0, totalUpdated = 0;

    const firstPage = await fetchOrders(1);
    if (!firstPage) {
      return new Response(JSON.stringify({
        success: false,
        error: "WC Orders API request failed. Verify consumer key/secret.",
      }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`✅ WC Orders: ${firstPage.orders.length} orders, ${firstPage.totalPages} pages`);
    let r = await upsertOrders(supabase, firstPage.orders);
    totalInserted += r.inserted;
    totalUpdated += r.updated;

    const pagesToFetch = Math.min(firstPage.totalPages, maxPages);
    for (let p = 2; p <= pagesToFetch; p++) {
      const page = await fetchOrders(p);
      if (!page || !page.orders.length) break;
      console.log(`  Page ${p}/${pagesToFetch}: ${page.orders.length} orders`);
      r = await upsertOrders(supabase, page.orders);
      totalInserted += r.inserted;
      totalUpdated += r.updated;
    }

    const summary = {
      success: true,
      strategy: "wc_rest_api_v3",
      mode,
      inserted: totalInserted,
      updated: totalUpdated,
      total_pages: firstPage.totalPages,
      timestamp: new Date().toISOString(),
    };
    console.log(`✅ Sync complete: ${JSON.stringify(summary)}`);
    return new Response(JSON.stringify(summary), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
