import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TARGET_URL = "https://alphapropriedadesdigitais.com.br";
const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache",
};

const MAX_PAGES = 500;

// ── helpers ──────────────────────────────────────────────────────────
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function extractPrice(text: string): number {
  const cleaned = stripTags(text);
  const match = cleaned.match(/[\d.,]+/);
  if (!match) return 0;
  return parseFloat(match[0].replace(/\./g, "").replace(",", ".")) || 0;
}

function parseCookies(headers: Headers): string {
  const cookies: string[] = [];
  headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      const name = value.split("=")[0];
      const val = value.split(";")[0];
      cookies.push(val);
    }
  });
  return cookies.join("; ");
}

// ── Step 1: Authenticate via wp-login.php ───────────────────────────
async function wpLogin(username: string, password: string): Promise<string> {
  console.log("🔐 Logging in to WordPress...");

  // First GET the login page to get any nonces/cookies
  const loginPageRes = await fetch(`${TARGET_URL}/wp-login.php`, {
    headers: BROWSER_HEADERS,
    redirect: "manual",
  });
  let cookies = parseCookies(loginPageRes.headers);

  // Also try raw set-cookie from response
  const rawSetCookies: string[] = [];
  loginPageRes.headers.forEach((v, k) => {
    if (k.toLowerCase() === "set-cookie") rawSetCookies.push(v.split(";")[0]);
  });
  if (rawSetCookies.length) cookies = rawSetCookies.join("; ");

  // POST login credentials
  const formData = new URLSearchParams({
    log: username,
    pwd: password,
    "wp-submit": "Log In",
    redirect_to: `${TARGET_URL}/wp-admin/`,
    testcookie: "1",
  });

  const loginRes = await fetch(`${TARGET_URL}/wp-login.php`, {
    method: "POST",
    headers: {
      ...BROWSER_HEADERS,
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookies,
    },
    body: formData.toString(),
    redirect: "manual",
  });

  // Collect all set-cookie headers
  const allCookies: string[] = [];
  loginRes.headers.forEach((v, k) => {
    if (k.toLowerCase() === "set-cookie") {
      allCookies.push(v.split(";")[0]);
    }
  });

  const sessionCookies = allCookies.join("; ");
  const status = loginRes.status;

  if (status === 302 || status === 303) {
    console.log(`✅ Login successful (redirect ${status}), got ${allCookies.length} cookies`);
  } else {
    console.log(`⚠️ Login returned status ${status}, attempting with cookies anyway...`);
  }

  return sessionCookies || cookies;
}

// ── Step 2: Fetch orders from WP-Admin ──────────────────────────────
async function fetchOrdersFromWpAdmin(cookies: string, page: number): Promise<any[]> {
  const url = `${TARGET_URL}/wp-admin/edit.php?post_type=shop_order&paged=${page}`;
  console.log(`📄 WP-Admin orders page ${page}`);

  const res = await fetch(url, {
    headers: { ...BROWSER_HEADERS, Cookie: cookies },
    redirect: "follow",
  });

  if (!res.ok) {
    console.log(`⛔ WP-Admin page ${page} returned ${res.status}`);
    return [];
  }

  const html = await res.text();

  // Check if redirected to login
  if (html.includes("wp-login.php") && html.includes('name="log"')) {
    console.log("⛔ Redirected to login - session expired");
    return [];
  }

  const orders: any[] = [];

  // Parse WP-Admin orders table rows
  // Pattern: <tr id="post-XXXXX" ...> ... </tr>
  const rowPattern = /<tr[^>]*id="post-(\d+)"[^>]*>([\s\S]*?)<\/tr>/g;
  let match;

  while ((match = rowPattern.exec(html)) !== null) {
    const orderId = match[1];
    const rowHtml = match[2];

    // Order number
    const orderNumMatch = rowHtml.match(/order_number[^>]*>[\s\S]*?<a[^>]*>#?(\d+)/);
    const displayId = orderNumMatch?.[1] || orderId;

    // Status
    const statusMatch = rowHtml.match(/<mark[^>]*class="[^"]*order-status[^"]*"[^>]*>[\s\S]*?<span>([^<]+)/);
    const status = statusMatch?.[1]?.trim().toLowerCase() || "";

    // Date
    const dateMatch = rowHtml.match(/<time[^>]*datetime="([^"]+)"/);
    const date = dateMatch?.[1] || null;

    // Total amount
    const totalMatch = rowHtml.match(/column-order_total[\s\S]*?woocommerce-Price-amount[^>]*>[\s\S]*?<bdi>([^<]+)/);
    const totalText = totalMatch?.[1] || "";
    const total = extractPrice(totalText);

    // Customer/billing
    const billingMatch = rowHtml.match(/column-billing_address[^>]*>([\s\S]*?)<\/td>/);
    const customer = billingMatch ? stripTags(billingMatch[1]) : null;

    // Order items (from order_items column if present)
    const itemsMatch = rowHtml.match(/column-order_items[^>]*>([\s\S]*?)<\/td>/);
    const itemsText = itemsMatch ? stripTags(itemsMatch[1]) : null;

    orders.push({
      id: displayId,
      status: normalizeStatus(status),
      date,
      total,
      customer_name: customer,
      items_text: itemsText,
      source: "wp-admin",
    });
  }

  // Also try HPOS (High-Performance Order Storage) format
  if (orders.length === 0) {
    const hposPattern = /<tr[^>]*class="[^"]*type-shop_order[^"]*"[^>]*data-id="(\d+)"[^>]*>([\s\S]*?)<\/tr>/g;
    while ((match = hposPattern.exec(html)) !== null) {
      const orderId = match[1];
      const rowHtml = match[2];

      const statusMatch = rowHtml.match(/status-([a-z-]+)/);
      const dateMatch = rowHtml.match(/<time[^>]*>([^<]+)/);
      const totalMatch = rowHtml.match(/woocommerce-Price-amount[^>]*>[^<]*<bdi>([^<]+)/);
      const customerMatch = rowHtml.match(/column-billing_address[^>]*>([\s\S]*?)<\/td>/);

      orders.push({
        id: orderId,
        status: normalizeStatus(statusMatch?.[1] || ""),
        date: dateMatch?.[1]?.trim() || null,
        total: totalMatch ? extractPrice(totalMatch[1]) : 0,
        customer_name: customerMatch ? stripTags(customerMatch[1]) : null,
        source: "wp-admin-hpos",
      });
    }
  }

  // Check for HPOS (WooCommerce > Orders page)
  if (orders.length === 0) {
    // Try WC HPOS admin page
    const hposUrl = `${TARGET_URL}/wp-admin/admin.php?page=wc-orders&paged=${page}`;
    const hposRes = await fetch(hposUrl, {
      headers: { ...BROWSER_HEADERS, Cookie: cookies },
      redirect: "follow",
    });

    if (hposRes.ok) {
      const hposHtml = await hposRes.text();
      if (!hposHtml.includes('name="log"')) {
        // Parse HPOS table
        const trPattern = /<tr[^>]*class="[^"]*order[^"]*"[^>]*>([\s\S]*?)<\/tr>/g;
        while ((match = trPattern.exec(hposHtml)) !== null) {
          const row = match[1];
          const idMatch = row.match(/data-id="(\d+)"|#(\d+)/);
          const statusMatch = row.match(/status-([a-z-]+)|class="[^"]*wc-([a-z-]+)/);
          const totalMatch = row.match(/woocommerce-Price-amount[^>]*>[^<]*<bdi>([^<]+)/);
          const dateMatch = row.match(/<time[^>]*datetime="([^"]+)"/);

          if (idMatch) {
            orders.push({
              id: idMatch[1] || idMatch[2],
              status: normalizeStatus(statusMatch?.[1] || statusMatch?.[2] || ""),
              date: dateMatch?.[1] || null,
              total: totalMatch ? extractPrice(totalMatch[1]) : 0,
              source: "wp-admin-hpos-page",
            });
          }
        }
        console.log(`   HPOS page: ${orders.length} orders`);
      }
    }
  }

  return orders;
}

// ── Step 3: Fetch orders from Dokan vendor dashboard ────────────────
async function fetchOrdersFromDokan(cookies: string, page: number): Promise<any[]> {
  const url = `${TARGET_URL}/painel/orders/?pagenum=${page}`;
  console.log(`📄 Dokan orders page ${page}`);

  const res = await fetch(url, {
    headers: { ...BROWSER_HEADERS, Cookie: cookies },
    redirect: "follow",
  });

  if (!res.ok) return [];
  const html = await res.text();

  if (html.includes("wp-login.php") && html.includes('name="log"')) {
    return [];
  }

  const orders: any[] = [];
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  let match;

  while ((match = rowPattern.exec(html)) !== null) {
    const row = match[1];
    // Skip header rows
    if (row.includes("<th")) continue;

    const orderMatch = row.match(/#(\d+)|order[_-]?(\d+)/i);
    const statusMatch = row.match(/label-([a-z-]+)|status-([a-z-]+)/);
    const totalMatch = row.match(/woocommerce-Price-amount[^>]*>[^<]*(?:<bdi>)?([^<]+)/);
    const dateMatch = row.match(/<time[^>]*datetime="([^"]+)"|(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/);

    if (orderMatch) {
      orders.push({
        id: orderMatch[1] || orderMatch[2],
        status: normalizeStatus(statusMatch?.[1] || statusMatch?.[2] || ""),
        date: dateMatch?.[1] || dateMatch?.[2] || null,
        total: totalMatch ? extractPrice(totalMatch[1]) : 0,
        source: "dokan-dashboard",
      });
    }
  }

  return orders;
}

// ── Step 4: Fetch orders from My Account ────────────────────────────
async function fetchOrdersFromMyAccount(cookies: string, page: number): Promise<any[]> {
  const url = `${TARGET_URL}/minha-conta/orders/${page > 1 ? page + "/" : ""}`;
  console.log(`📄 My Account orders page ${page}`);

  const res = await fetch(url, {
    headers: { ...BROWSER_HEADERS, Cookie: cookies },
    redirect: "follow",
  });

  if (!res.ok) return [];
  const html = await res.text();

  const orders: any[] = [];
  const rowPattern = /<tr[^>]*class="[^"]*order[^"]*"[^>]*>([\s\S]*?)<\/tr>/g;
  let match;

  while ((match = rowPattern.exec(html)) !== null) {
    const row = match[1];
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];

    const orderNumMatch = row.match(/#(\d+)/);
    const statusMatch = row.match(/status-([a-z-]+)/);
    const totalMatch = row.match(/woocommerce-Price-amount[^>]*>[^<]*(?:<bdi>)?([^<]+)/);
    const dateMatch = row.match(/<time[^>]*datetime="([^"]+)"/);

    if (orderNumMatch) {
      orders.push({
        id: orderNumMatch[1],
        status: normalizeStatus(statusMatch?.[1] || ""),
        date: dateMatch?.[1] || (cells[0] ? stripTags(cells[0]) : null),
        total: totalMatch ? extractPrice(totalMatch[1]) : 0,
        source: "my-account",
      });
    }
  }

  // Check for "next page" link
  const hasNext = html.includes(`/orders/${page + 1}/`) || html.includes(`pagenum=${page + 1}`);

  return orders;
}

// ── Step 5: Try Dokan REST API (authenticated) ──────────────────────
async function fetchOrdersFromDokanApi(cookies: string, page: number): Promise<any[]> {
  // Get nonce first
  const dashRes = await fetch(`${TARGET_URL}/painel/`, {
    headers: { ...BROWSER_HEADERS, Cookie: cookies },
  });
  const dashHtml = await dashRes.text();
  const nonceMatch = dashHtml.match(/dokan_nonce['"]\s*:\s*['"]([^'"]+)/);
  const wpNonceMatch = dashHtml.match(/wp_rest['"]\s*:\s*['"]([^'"]+)/) ||
                        dashHtml.match(/_wpnonce['"]\s*:\s*['"]([^'"]+)/);

  const nonce = wpNonceMatch?.[1] || nonceMatch?.[1] || "";

  const url = `${TARGET_URL}/wp-json/dokan/v1/orders?per_page=100&page=${page}`;
  console.log(`📄 Dokan API orders page ${page}`);

  const res = await fetch(url, {
    headers: {
      ...BROWSER_HEADERS,
      Accept: "application/json",
      Cookie: cookies,
      "X-WP-Nonce": nonce,
    },
  });

  if (!res.ok) {
    console.log(`⛔ Dokan API page ${page}: ${res.status}`);
    return [];
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data.map((order: any) => ({
    id: String(order.id),
    status: normalizeStatus(order.status || ""),
    date: order.date_created || order.date || null,
    total: parseFloat(order.total) || 0,
    customer_name: order.billing?.first_name
      ? `${order.billing.first_name} ${order.billing.last_name || ""}`.trim()
      : null,
    customer_email: order.billing?.email || null,
    payment_method: order.payment_method_title || order.payment_method || null,
    items: (order.line_items || []).map((li: any) => ({
      name: li.name || li.product_name || "Produto",
      price: parseFloat(li.total) || parseFloat(li.price) || 0,
      quantity: li.quantity || 1,
      product_id: String(li.product_id || ""),
    })),
    source: "dokan-api",
  }));
}

function normalizeStatus(raw: string): string {
  const s = raw.replace(/^wc-/, "").replace(/-/g, "_").toLowerCase();
  const map: Record<string, string> = {
    processing: "processing",
    completed: "completed",
    on_hold: "on-hold",
    pending: "pending",
    cancelled: "cancelled",
    refunded: "refunded",
    failed: "failed",
  };
  return map[s] || s || "pending";
}

// ── Main: paginate through all orders ────────────────────────────────
async function syncOrders(mode: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const wpUsername = Deno.env.get("WP_USERNAME");
  const wpPassword = Deno.env.get("WP_PASSWORD");
  // Allow manual cookie override
  const manualCookies = Deno.env.get("WP_SESSION_COOKIES");

  if (!wpUsername && !wpPassword && !manualCookies) {
    return { success: false, error: "Missing WP_USERNAME/WP_PASSWORD or WP_SESSION_COOKIES secret" };
  }

  // Authenticate
  let cookies = manualCookies || "";
  if (!cookies && wpUsername && wpPassword) {
    cookies = await wpLogin(wpUsername, wpPassword);
  }

  if (!cookies) {
    return { success: false, error: "Failed to obtain session cookies" };
  }

  console.log(`🔄 Sync mode: ${mode}, cookies length: ${cookies.length}`);

  const allOrders: any[] = [];
  const seenIds = new Set<string>();
  let totalPages = 0;

  // Try strategies in order: Dokan API → WP-Admin → Dokan Dashboard → My Account
  const strategies = [
    { name: "Dokan API", fn: (p: number) => fetchOrdersFromDokanApi(cookies, p) },
    { name: "WP-Admin", fn: (p: number) => fetchOrdersFromWpAdmin(cookies, p) },
    { name: "Dokan Dashboard", fn: (p: number) => fetchOrdersFromDokan(cookies, p) },
    { name: "My Account", fn: (p: number) => fetchOrdersFromMyAccount(cookies, p) },
  ];

  for (const strategy of strategies) {
    console.log(`\n🎯 Trying strategy: ${strategy.name}`);

    let page = 1;
    let consecutiveEmpty = 0;
    const maxEmpty = 2; // Stop after 2 consecutive empty pages

    while (page <= MAX_PAGES && consecutiveEmpty < maxEmpty) {
      const orders = await strategy.fn(page);

      if (orders.length === 0) {
        consecutiveEmpty++;
        console.log(`   Page ${page}: empty (${consecutiveEmpty}/${maxEmpty})`);
        page++;
        continue;
      }

      consecutiveEmpty = 0;
      let newCount = 0;

      for (const order of orders) {
        if (!seenIds.has(order.id)) {
          seenIds.add(order.id);
          allOrders.push(order);
          newCount++;
        }
      }

      console.log(`   Page ${page}: ${orders.length} orders, ${newCount} new (total: ${allOrders.length})`);
      totalPages = page;

      // For incremental mode, stop after first page
      if (mode === "incremental" && page >= 1) break;

      page++;
    }

    if (allOrders.length > 0) {
      console.log(`✅ Strategy "${strategy.name}" found ${allOrders.length} orders across ${totalPages} pages`);
      break; // Found orders, stop trying other strategies
    }
  }

  if (allOrders.length === 0) {
    console.log("⚠️ No orders found from any strategy");
    return { success: true, inserted: 0, updated: 0, total: 0, pages: 0 };
  }

  // Upsert into database
  let inserted = 0;
  let updated = 0;

  for (const order of allOrders) {
    const externalId = `order-${order.id}`;
    const totalAmount = order.total || 0;
    const commission = totalAmount * 0.07;
    const netAmount = totalAmount - commission;

    const { data: existing } = await supabase
      .from("external_orders")
      .select("id")
      .eq("external_id", externalId)
      .maybeSingle();

    // Upsert customer
    let customerId: string | null = null;
    if (order.customer_name || order.customer_email) {
      if (order.customer_email) {
        const { data: existingCust } = await supabase
          .from("external_customers")
          .select("id")
          .eq("email", order.customer_email)
          .maybeSingle();
        if (existingCust) customerId = existingCust.id;
      }
      if (!customerId) {
        const { data: newCust } = await supabase
          .from("external_customers")
          .insert({
            name: order.customer_name || null,
            email: order.customer_email || null,
          })
          .select("id")
          .single();
        customerId = newCust?.id ?? null;
      }
    }

    if (existing) {
      await supabase
        .from("external_orders")
        .update({
          status: order.status,
          total_amount: totalAmount,
          commission,
          net_amount: netAmount,
          customer_id: customerId,
          payment_method: order.payment_method || null,
          updated_at: new Date().toISOString(),
          raw_data: { source: order.source, items_text: order.items_text },
        })
        .eq("id", existing.id);
      updated++;
    } else {
      const { data: newOrder, error } = await supabase
        .from("external_orders")
        .insert({
          external_id: externalId,
          status: order.status,
          total_amount: totalAmount,
          commission,
          net_amount: netAmount,
          customer_id: customerId,
          payment_method: order.payment_method || null,
          currency: "BRL",
          raw_data: { source: order.source, items_text: order.items_text },
          ordered_at: order.date || new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        console.error(`Error inserting order-${order.id}:`, error.message);
        continue;
      }

      // Insert order items
      if (newOrder && order.items?.length) {
        const items = order.items.map((item: any) => ({
          order_id: newOrder.id,
          product_name: item.name || "Produto",
          price: item.price || 0,
          quantity: item.quantity || 1,
          external_product_id: item.product_id || null,
        }));
        await supabase.from("external_order_items").insert(items);
      } else if (newOrder && order.items_text) {
        await supabase.from("external_order_items").insert({
          order_id: newOrder.id,
          product_name: order.items_text,
          price: totalAmount,
          quantity: 1,
        });
      }

      inserted++;
    }
  }

  console.log(`\n✅ ${mode} complete: ${inserted} inserted, ${updated} updated, ${allOrders.length} total, ${totalPages} pages`);
  return { inserted, updated, total: allOrders.length, pages: totalPages };
}

// ── HTTP handler ─────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let mode = "incremental";
    try {
      if (req.method === "POST") {
        const body = await req.json();
        mode = body.mode || "incremental";
      }
    } catch { /* no body */ }
    const url = new URL(req.url);
    if (url.searchParams.get("mode")) mode = url.searchParams.get("mode")!;

    const result = await syncOrders(mode);

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
