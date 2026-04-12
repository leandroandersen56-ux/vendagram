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

// ─── Strategy 1: WooCommerce REST API v3 (consumer key auth) ───
async function fetchOrdersFromWcApi(page: number, perPage = 50): Promise<{ orders: any[]; totalPages: number } | null> {
  const ck = Deno.env.get("WC_CONSUMER_KEY");
  const cs = Deno.env.get("WC_CONSUMER_SECRET");
  if (!ck || !cs) return null;

  try {
    const url = `${BASE_URL}/wp-json/wc/v3/orders?page=${page}&per_page=${perPage}&orderby=date&order=desc&consumer_key=${ck}&consumer_secret=${cs}`;
    const res = await fetch(url, { headers: { "User-Agent": "FroivSync/1.0" } });
    if (!res.ok) {
      console.log(`WC API ${res.status}`);
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
  } catch (e) {
    console.error("WC API error:", e.message);
    return null;
  }
}

// ─── Strategy 2: Public Store API (product catalog fallback) ───
async function fetchProductsFromStoreApi(page: number, perPage = 100): Promise<{ items: any[]; totalPages: number } | null> {
  try {
    const url = `${BASE_URL}/wp-json/wc/store/v1/products?page=${page}&per_page=${perPage}&orderby=date&order=desc`;
    const res = await fetch(url, { headers: { "User-Agent": "FroivSync/1.0" } });
    if (!res.ok) return null;
    const totalPages = parseInt(res.headers.get("x-wp-totalpages") || "1");
    const data = await res.json();
    const items = data.map((p: any) => ({
      external_id: `PROD-${p.id}`,
      status: p.is_purchasable ? "active" : "inactive",
      total_amount: parseInt(p.prices?.price || "0") / 100,
      currency: p.prices?.currency_code || "BRL",
      payment_method: "catalog",
      ordered_at: null,
      customer_name: null,
      customer_email: null,
      country: null,
      items: [{
        name: decodeHtml(p.name || "Produto"),
        price: parseInt(p.prices?.price || "0") / 100,
        quantity: 1,
        product_id: String(p.id),
        category: p.categories?.[0]?.name ? decodeHtml(p.categories[0].name).trim() : null,
      }],
      raw: { type: "product_catalog", id: p.id, slug: p.slug, permalink: p.permalink },
    }));
    return { items, totalPages };
  } catch (e) {
    console.error("Store API error:", e.message);
    return null;
  }
}

function decodeHtml(t: string): string {
  return t.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/\n/g, " ").trim();
}

// ─── Upsert ───
async function upsertOrders(supabase: any, records: any[]): Promise<{ inserted: number; updated: number }> {
  let inserted = 0, updated = 0;

  for (const order of records) {
    const extId = order.external_id;
    const { data: existing } = await supabase.from("external_orders").select("id").eq("external_id", extId).maybeSingle();

    if (existing) {
      await supabase.from("external_orders").update({
        status: order.status,
        total_amount: order.total_amount,
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

    if (error) { console.error(`Insert ${extId}:`, error.message); continue; }

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

    const supabase = getSupabase();
    const maxPages = mode === "backfill" ? 500 : 3;
    let totalInserted = 0, totalUpdated = 0;
    let strategy = "none";

    // Strategy 1: WC REST API
    console.log("Trying WC REST API v3...");
    const wcTest = await fetchOrdersFromWcApi(1);

    if (wcTest) {
      strategy = "wc_rest_api";
      console.log(`✅ WC API: ${wcTest.orders.length} orders, ${wcTest.totalPages} pages`);
      let r = await upsertOrders(supabase, wcTest.orders);
      totalInserted += r.inserted; totalUpdated += r.updated;

      for (let p = 2; p <= Math.min(wcTest.totalPages, maxPages); p++) {
        const pr = await fetchOrdersFromWcApi(p);
        if (!pr || !pr.orders.length) break;
        console.log(`  Page ${p}: ${pr.orders.length} orders`);
        r = await upsertOrders(supabase, pr.orders);
        totalInserted += r.inserted; totalUpdated += r.updated;
      }
    }

    // Fallback: Store API
    if (!wcTest) {
      console.log("⚠️ WC API unavailable → Store API fallback (product catalog)");
      strategy = "store_api_catalog";

      for (let p = 1; p <= maxPages; p++) {
        const result = await fetchProductsFromStoreApi(p);
        if (!result || !result.items.length) break;
        console.log(`  Store API page ${p}/${Math.min(result.totalPages, maxPages)}: ${result.items.length} items`);
        const r = await upsertOrders(supabase, result.items);
        totalInserted += r.inserted; totalUpdated += r.updated;
        if (p >= result.totalPages) break;
      }
    }

    const summary = { success: true, strategy, mode, inserted: totalInserted, updated: totalUpdated, timestamp: new Date().toISOString() };
    console.log(`✅ Done: ${JSON.stringify(summary)}`);
    return new Response(JSON.stringify(summary), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
