import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://alphapropriedadesdigitais.com.br";
const UA = "FroivSync/1.0";

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

interface OrderRecord {
  external_id: string;
  status: string;
  total_amount: number;
  currency: string;
  payment_method: string | null;
  ordered_at: string | null;
  customer_name: string | null;
  customer_email: string | null;
  country: string | null;
  items: { name: string; price: number; quantity: number; product_id: string; category: string | null }[];
  raw: Record<string, unknown>;
}

interface StrategyResult {
  name: string;
  success: boolean;
  orders: OrderRecord[];
  totalPages: number;
  message: string;
}

// ─── Strategy 1: WooCommerce REST API v3 (Authenticated) ───
async function strategyWcRestApi(page: number, perPage = 50): Promise<StrategyResult> {
  const name = "wc_rest_api_v3";
  const ck = Deno.env.get("WC_CONSUMER_KEY");
  const cs = Deno.env.get("WC_CONSUMER_SECRET");

  if (!ck || !cs) {
    console.log("⏭️ [Strategy 1] WC REST API — credentials not found, skipping");
    return { name, success: false, orders: [], totalPages: 0, message: "WC_CONSUMER_KEY/SECRET not configured" };
  }

  console.log("🔑 [Strategy 1] Trying WC REST API v3 with consumer key/secret...");
  try {
    const url = `${BASE_URL}/wp-json/wc/v3/orders?page=${page}&per_page=${perPage}&orderby=date&order=desc&consumer_key=${ck}&consumer_secret=${cs}`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });

    if (!res.ok) {
      console.log(`❌ [Strategy 1] WC REST API returned ${res.status}`);
      return { name, success: false, orders: [], totalPages: 0, message: `API returned ${res.status}` };
    }

    const totalPages = parseInt(res.headers.get("x-wp-totalpages") || "1");
    const data = await res.json();
    const orders = mapWcOrders(data);
    console.log(`✅ [Strategy 1] WC REST API: ${orders.length} orders, ${totalPages} pages`);
    return { name, success: true, orders, totalPages, message: "OK" };
  } catch (e) {
    console.error(`❌ [Strategy 1] WC REST API error:`, e.message);
    return { name, success: false, orders: [], totalPages: 0, message: e.message };
  }
}

// ─── Strategy 2: Unauthenticated WC REST API probe ───
async function strategyUnauthProbe(): Promise<StrategyResult> {
  const name = "wc_unauth_probe";
  console.log("🔍 [Strategy 2] Probing unauthenticated WC REST API...");
  try {
    const url = `${BASE_URL}/wp-json/wc/v3/orders?per_page=10`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });

    if (res.status === 401 || res.status === 403) {
      console.log(`⏭️ [Strategy 2] Orders endpoint requires auth (${res.status}) — expected`);
      return { name, success: false, orders: [], totalPages: 0, message: `Auth required (${res.status})` };
    }

    if (!res.ok) {
      console.log(`⏭️ [Strategy 2] Endpoint returned ${res.status}`);
      return { name, success: false, orders: [], totalPages: 0, message: `HTTP ${res.status}` };
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      console.log("⏭️ [Strategy 2] No order data in unauthenticated response");
      return { name, success: false, orders: [], totalPages: 0, message: "Empty response" };
    }

    const totalPages = parseInt(res.headers.get("x-wp-totalpages") || "1");
    const orders = mapWcOrders(data);
    console.log(`✅ [Strategy 2] Unauthenticated probe found ${orders.length} orders!`);
    return { name, success: true, orders, totalPages, message: "OK — orders exposed without auth" };
  } catch (e) {
    console.error(`❌ [Strategy 2] Probe error:`, e.message);
    return { name, success: false, orders: [], totalPages: 0, message: e.message };
  }
}

// ─── Strategy 3: WP REST API alternate order endpoints ───
async function strategyAlternateEndpoints(): Promise<StrategyResult> {
  const name = "alternate_endpoints";
  console.log("🔍 [Strategy 3] Scanning alternate WP/WC order endpoints...");

  const endpoints = [
    "/wp-json/wc/v2/orders",
    "/wp-json/wc/v1/orders",
    "/wp-json/wc/store/v1/checkout",
    "/wp-json/wp/v2/shop_order",
    "/?rest_route=/wc/v3/orders",
    "/?rest_route=/wc/store/v1/order",
    "/wp-json/wc/store/v1/order",
  ];

  for (const ep of endpoints) {
    try {
      const url = `${BASE_URL}${ep}`;
      console.log(`  → Trying ${ep}`);
      const res = await fetch(url, {
        headers: { "User-Agent": UA, "Accept": "application/json" },
        redirect: "follow",
      });

      if (!res.ok) continue;

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("json")) continue;

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && (data[0].id || data[0].order_id)) {
        const orders = mapWcOrders(data);
        console.log(`✅ [Strategy 3] Found ${orders.length} orders at ${ep}`);
        return { name, success: true, orders, totalPages: 1, message: `Found at ${ep}` };
      }
    } catch {
      // continue to next endpoint
    }
  }

  console.log("⏭️ [Strategy 3] No alternate endpoints exposed order data");
  return { name, success: false, orders: [], totalPages: 0, message: "No accessible alternate endpoints" };
}

// ─── Strategy 4: Frontend state extraction ───
async function strategyFrontendScan(): Promise<StrategyResult> {
  const name = "frontend_scan";
  console.log("🔍 [Strategy 4] Scanning frontend pages for embedded order data...");

  const pages = [
    "/minha-conta/orders/",
    "/my-account/orders/",
    "/checkout/order-received/",
    "/wp-json/",
  ];

  for (const page of pages) {
    try {
      const url = `${BASE_URL}${page}`;
      console.log(`  → Scanning ${page}`);
      const res = await fetch(url, {
        headers: { "User-Agent": UA, "Accept": "text/html,application/json" },
        redirect: "follow",
      });

      if (!res.ok) continue;

      const body = await res.text();

      // Look for embedded JSON data in script tags
      const patterns = [
        /var\s+wc_orders?\s*=\s*(\[[\s\S]*?\]);/i,
        /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/i,
        /"orders"\s*:\s*(\[[\s\S]*?\])/i,
        /woocommerce_params\s*=\s*(\{[\s\S]*?\});/i,
      ];

      for (const pattern of patterns) {
        const match = body.match(pattern);
        if (match && match[1]) {
          try {
            const parsed = JSON.parse(match[1]);
            const arr = Array.isArray(parsed) ? parsed : [parsed];
            if (arr.length > 0 && (arr[0].id || arr[0].order_id)) {
              const orders = mapWcOrders(arr);
              console.log(`✅ [Strategy 4] Extracted ${orders.length} orders from ${page}`);
              return { name, success: true, orders, totalPages: 1, message: `Extracted from ${page}` };
            }
          } catch {
            // JSON parse failed, continue
          }
        }
      }
    } catch {
      // continue
    }
  }

  console.log("⏭️ [Strategy 4] No embedded order data found in frontend pages");
  return { name, success: false, orders: [], totalPages: 0, message: "No embedded order data found" };
}

// ─── Shared: Map WC order data to normalized records ───
function mapWcOrders(data: any[]): OrderRecord[] {
  return data.filter(o => o && (o.id || o.order_id)).map((o: any) => ({
    external_id: String(o.id || o.order_id),
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
}

// ─── Upsert orders into DB ───
async function upsertOrders(supabase: any, records: OrderRecord[]): Promise<{ inserted: number; updated: number }> {
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
        order.items.map((i) => ({
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

// ─── Fetch additional pages for a winning strategy ───
async function fetchWcPage(page: number, perPage = 50): Promise<{ orders: OrderRecord[]; totalPages: number } | null> {
  const ck = Deno.env.get("WC_CONSUMER_KEY");
  const cs = Deno.env.get("WC_CONSUMER_SECRET");
  if (!ck || !cs) return null;

  const url = `${BASE_URL}/wp-json/wc/v3/orders?page=${page}&per_page=${perPage}&orderby=date&order=desc&consumer_key=${ck}&consumer_secret=${cs}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;

  const totalPages = parseInt(res.headers.get("x-wp-totalpages") || "1");
  const data = await res.json();
  return { orders: mapWcOrders(data), totalPages };
}

// ─── Main ───
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let mode = "incremental";
    try { const b = await req.json(); mode = b?.mode || "incremental"; } catch { /* */ }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🚀 Order sync started — mode: ${mode}`);
    console.log(`${"=".repeat(60)}`);

    const strategiesAttempted: string[] = [];
    let winningStrategy: StrategyResult | null = null;

    // ─── Execute strategies in priority order ───

    // Strategy 1: Authenticated WC REST API
    const s1 = await strategyWcRestApi(1);
    strategiesAttempted.push(s1.name);
    if (s1.success && s1.orders.length > 0) {
      winningStrategy = s1;
    }

    // Strategy 2: Unauthenticated probe
    if (!winningStrategy) {
      const s2 = await strategyUnauthProbe();
      strategiesAttempted.push(s2.name);
      if (s2.success && s2.orders.length > 0) {
        winningStrategy = s2;
      }
    }

    // Strategy 3: Alternate endpoints
    if (!winningStrategy) {
      const s3 = await strategyAlternateEndpoints();
      strategiesAttempted.push(s3.name);
      if (s3.success && s3.orders.length > 0) {
        winningStrategy = s3;
      }
    }

    // Strategy 4: Frontend scan
    if (!winningStrategy) {
      const s4 = await strategyFrontendScan();
      strategiesAttempted.push(s4.name);
      if (s4.success && s4.orders.length > 0) {
        winningStrategy = s4;
      }
    }

    // ─── No strategy found orders ───
    if (!winningStrategy) {
      console.log(`\n⚠️ All ${strategiesAttempted.length} strategies exhausted — no orders found`);
      return new Response(JSON.stringify({
        success: true,
        status: "no_orders_found_after_full_scan",
        strategies_attempted: strategiesAttempted,
        mode,
        inserted: 0,
        updated: 0,
        message: "All extraction strategies attempted. Orders require authenticated WooCommerce API access. Configure WC_CONSUMER_KEY and WC_CONSUMER_SECRET to enable.",
        timestamp: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ─── Process winning strategy ───
    console.log(`\n🏆 Winning strategy: ${winningStrategy.name}`);
    const supabase = getSupabase();
    let totalInserted = 0, totalUpdated = 0;

    // Upsert first page
    let r = await upsertOrders(supabase, winningStrategy.orders);
    totalInserted += r.inserted;
    totalUpdated += r.updated;

    // Fetch additional pages if strategy supports pagination (WC REST API)
    if (winningStrategy.name === "wc_rest_api_v3" && winningStrategy.totalPages > 1) {
      const maxPages = mode === "backfill" ? 500 : 3;
      const pagesToFetch = Math.min(winningStrategy.totalPages, maxPages);
      for (let p = 2; p <= pagesToFetch; p++) {
        const page = await fetchWcPage(p);
        if (!page || !page.orders.length) break;
        console.log(`  Page ${p}/${pagesToFetch}: ${page.orders.length} orders`);
        r = await upsertOrders(supabase, page.orders);
        totalInserted += r.inserted;
        totalUpdated += r.updated;
      }
    }

    const summary = {
      success: true,
      strategy: winningStrategy.name,
      strategies_attempted: strategiesAttempted,
      mode,
      inserted: totalInserted,
      updated: totalUpdated,
      total_pages: winningStrategy.totalPages,
      timestamp: new Date().toISOString(),
    };
    console.log(`\n✅ Sync complete: ${JSON.stringify(summary)}`);
    return new Response(JSON.stringify(summary), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
