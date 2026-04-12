import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TARGET_URL = "https://alphapropriedadesdigitais.com.br";
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

// ── HTML parsing helpers ──────────────────────────────────────────────
function extractBetween(html: string, startTag: string, endTag: string): string[] {
  const results: string[] = [];
  let idx = 0;
  while (true) {
    const s = html.indexOf(startTag, idx);
    if (s === -1) break;
    const e = html.indexOf(endTag, s + startTag.length);
    if (e === -1) break;
    results.push(html.substring(s + startTag.length, e));
    idx = e + endTag.length;
  }
  return results;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function extractPrice(text: string): number {
  // R$ 1.234,56 → 1234.56
  const match = text.match(/[\d.,]+/);
  if (!match) return 0;
  return parseFloat(match[0].replace(/\./g, "").replace(",", ".")) || 0;
}

// ── Strategy 1: Scrape shop/product listing pages for product catalog ──
async function scrapeProductPages(): Promise<any[]> {
  const products: any[] = [];
  const pagesToTry = [
    `${TARGET_URL}/loja/`,
    `${TARGET_URL}/shop/`,
    `${TARGET_URL}/produtos/`,
    `${TARGET_URL}/`,
  ];

  for (const pageUrl of pagesToTry) {
    try {
      const res = await fetch(pageUrl, { headers: BROWSER_HEADERS });
      if (!res.ok) continue;
      const html = await res.text();

      // WooCommerce product pattern: <li class="product ...">
      const productBlocks = extractBetween(html, '<li class="product', "</li>");
      for (const block of productBlocks) {
        const titleMatch = block.match(/class="woocommerce-loop-product__title"[^>]*>([^<]+)/);
        const priceMatch = block.match(/class="woocommerce-Price-amount[^"]*"[^>]*>([^<]*<[^>]*>[^<]*)/);
        const linkMatch = block.match(/href="([^"]+)"/);
        const idMatch = block.match(/post-(\d+)/);

        if (titleMatch) {
          products.push({
            id: idMatch?.[1] || `prod-${products.length}`,
            title: stripTags(titleMatch[1]),
            price: priceMatch ? extractPrice(stripTags(priceMatch[1])) : 0,
            url: linkMatch?.[1] || "",
            source: "product-listing",
          });
        }
      }

      // Also try JSON-LD structured data
      const jsonLdBlocks = extractBetween(html, '<script type="application/ld+json">', "</script>");
      for (const jsonStr of jsonLdBlocks) {
        try {
          const data = JSON.parse(jsonStr);
          if (data["@type"] === "Product" || data["@type"] === "ItemList") {
            const items = data.itemListElement || [data];
            for (const item of items) {
              const product = item.item || item;
              if (product.name) {
                products.push({
                  id: product.sku || product.productID || `ld-${products.length}`,
                  title: product.name,
                  price: product.offers?.price
                    ? parseFloat(product.offers.price)
                    : 0,
                  url: product.url || "",
                  source: "json-ld",
                });
              }
            }
          }
        } catch {
          // not valid JSON-LD
        }
      }

      if (products.length > 0) break; // found products, stop trying other URLs
    } catch {
      continue;
    }
  }

  return products;
}

// ── Strategy 2: Try WooCommerce REST API (public, no auth) ──
async function tryPublicApi(): Promise<any[]> {
  const orders: any[] = [];
  const endpoints = [
    `${TARGET_URL}/wp-json/wc/store/v1/products`,
    `${TARGET_URL}/wp-json/wp/v2/product`,
    `${TARGET_URL}/?rest_route=/wc/store/v1/products`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: { ...BROWSER_HEADERS, Accept: "application/json" },
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          orders.push({
            id: String(item.id),
            title: item.name || item.title?.rendered || "",
            price: parseFloat(item.prices?.price || item.price || "0") / 100 || 0,
            status: item.status || "publish",
            url: item.permalink || "",
            source: "public-api",
          });
        }
      }
      if (orders.length > 0) break;
    } catch {
      continue;
    }
  }

  return orders;
}

// ── Strategy 3: Scrape via AJAX/search endpoints ──
async function scrapeViaAjax(): Promise<any[]> {
  const results: any[] = [];

  try {
    // WooCommerce AJAX search
    const res = await fetch(`${TARGET_URL}/?s=&post_type=product&wc-ajax=get_refreshed_fragments`, {
      headers: BROWSER_HEADERS,
    });
    if (res.ok) {
      const html = await res.text();
      // Parse any product data from fragments
      const priceMatches = html.match(/woocommerce-Price-amount[^>]*>([^<]+)/g);
      if (priceMatches) {
        console.log(`Found ${priceMatches.length} price fragments via AJAX`);
      }
    }
  } catch {
    // ignore
  }

  // Try search page
  try {
    const res = await fetch(`${TARGET_URL}/?s=canal&post_type=product`, {
      headers: BROWSER_HEADERS,
    });
    if (res.ok) {
      const html = await res.text();
      const productBlocks = extractBetween(html, '<li class="product', "</li>");
      for (const block of productBlocks) {
        const titleMatch = block.match(/woocommerce-loop-product__title[^>]*>([^<]+)/);
        const priceMatch = block.match(/woocommerce-Price-amount[^"]*"[^>]*>[^<]*<[^>]*>([^<]+)/);
        const idMatch = block.match(/post-(\d+)/);

        if (titleMatch) {
          results.push({
            id: idMatch?.[1] || `search-${results.length}`,
            title: stripTags(titleMatch[1]),
            price: priceMatch ? extractPrice(priceMatch[1]) : 0,
            source: "search-scrape",
          });
        }
      }
    }
  } catch {
    // ignore
  }

  return results;
}

// ── Main sync logic ──────────────────────────────────────────────────
async function syncOrders() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("🔄 Starting auto-sync cycle...");

  // Try all strategies
  let products: any[] = [];

  // Strategy 1: HTML scraping
  products = await scrapeProductPages();
  console.log(`Strategy 1 (HTML): ${products.length} products`);

  // Strategy 2: Public API
  if (products.length === 0) {
    products = await tryPublicApi();
    console.log(`Strategy 2 (Public API): ${products.length} products`);
  }

  // Strategy 3: AJAX/Search
  if (products.length === 0) {
    products = await scrapeViaAjax();
    console.log(`Strategy 3 (AJAX): ${products.length} products`);
  }

  if (products.length === 0) {
    console.log("⚠️ No products found from any strategy");
    return { inserted: 0, updated: 0, total: 0, strategies_tried: 3 };
  }

  // Upsert into external_orders as product listings
  let inserted = 0;
  let updated = 0;

  for (const product of products) {
    const externalId = `product-${product.id}`;

    const { data: existing } = await supabase
      .from("external_orders")
      .select("id")
      .eq("external_id", externalId)
      .maybeSingle();

    const totalAmount = product.price || 0;
    const commission = totalAmount * 0.07;
    const netAmount = totalAmount - commission;

    if (existing) {
      await supabase
        .from("external_orders")
        .update({
          status: product.status || "active",
          total_amount: totalAmount,
          commission,
          net_amount: netAmount,
          updated_at: new Date().toISOString(),
          raw_data: { source: product.source, url: product.url, title: product.title },
        })
        .eq("id", existing.id);
      updated++;
    } else {
      const { data: newOrder, error } = await supabase
        .from("external_orders")
        .insert({
          external_id: externalId,
          status: product.status || "active",
          total_amount: totalAmount,
          commission,
          net_amount: netAmount,
          currency: "BRL",
          raw_data: { source: product.source, url: product.url, title: product.title },
          ordered_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        console.error(`Error inserting ${externalId}:`, error.message);
        continue;
      }

      // Insert product item
      if (newOrder) {
        await supabase.from("external_order_items").insert({
          order_id: newOrder.id,
          product_name: product.title || "Produto",
          price: totalAmount,
          quantity: 1,
          external_product_id: String(product.id),
        });
      }

      inserted++;
    }
  }

  console.log(`✅ Sync complete: ${inserted} inserted, ${updated} updated`);
  return { inserted, updated, total: products.length };
}

// ── HTTP handler ─────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const result = await syncOrders();

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
