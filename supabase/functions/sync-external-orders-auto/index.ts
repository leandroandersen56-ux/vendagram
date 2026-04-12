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
  Accept: "application/json, text/html, */*",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache",
};

const PER_PAGE = 100; // max items per page for WC Store API
const MAX_PAGES = 200; // safety limit

// ── helpers ──────────────────────────────────────────────────────────
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

// ── Paginated fetch via WC Store API (public, no auth) ──────────────
async function fetchAllProducts(): Promise<any[]> {
  const allProducts: any[] = [];
  const seenIds = new Set<string>();

  // Try multiple public endpoints with pagination
  const baseEndpoints = [
    `${TARGET_URL}/wp-json/wc/store/v1/products`,
    `${TARGET_URL}/?rest_route=/wc/store/v1/products`,
  ];

  for (const baseUrl of baseEndpoints) {
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= MAX_PAGES) {
      const separator = baseUrl.includes("?") ? "&" : "?";
      const url = `${baseUrl}${separator}per_page=${PER_PAGE}&page=${page}&order=asc&orderby=date`;

      console.log(`📄 Fetching page ${page}: ${url}`);

      try {
        const res = await fetch(url, {
          headers: { ...BROWSER_HEADERS, Accept: "application/json" },
        });

        if (!res.ok) {
          console.log(`⛔ Page ${page} returned ${res.status}, stopping.`);
          hasMore = false;
          break;
        }

        const totalPages = parseInt(res.headers.get("x-wp-totalpages") || "0");
        const totalItems = parseInt(res.headers.get("x-wp-total") || "0");
        if (page === 1 && totalItems > 0) {
          console.log(`📊 Total items reported: ${totalItems}, total pages: ${totalPages}`);
        }

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          console.log(`✅ Page ${page} empty, backfill complete.`);
          hasMore = false;
          break;
        }

        for (const item of data) {
          const id = String(item.id);
          if (seenIds.has(id)) continue;
          seenIds.add(id);

          // WC Store API returns prices in cents (minor units)
          const rawPrice = item.prices?.price || item.prices?.regular_price || item.price || "0";
          const price = parseInt(rawPrice) / 100 || parseFloat(rawPrice) || 0;

          allProducts.push({
            id,
            title: item.name || item.title?.rendered || stripTags(item.title || ""),
            price: price > 1000000 ? price / 100 : price, // safety for double-cent conversion
            status: item.status || item.catalog_visibility || "publish",
            url: item.permalink || "",
            description: stripTags(item.short_description || item.description || ""),
            categories: (item.categories || []).map((c: any) => c.name || c).filter(Boolean),
            images: (item.images || []).map((img: any) => img.src || img).filter(Boolean),
            sku: item.sku || "",
            source: "store-api-paginated",
          });
        }

        console.log(`   → Page ${page}: ${data.length} items (total acumulado: ${allProducts.length})`);

        // Determine if there are more pages
        if (totalPages > 0) {
          hasMore = page < totalPages;
        } else {
          hasMore = data.length >= PER_PAGE;
        }

        page++;
      } catch (err) {
        console.error(`❌ Error on page ${page}:`, err.message);
        hasMore = false;
      }
    }

    if (allProducts.length > 0) break; // found products with this endpoint
  }

  // Fallback: also try HTML scraping with pagination if API returned nothing
  if (allProducts.length === 0) {
    console.log("🔄 Fallback: HTML scraping with pagination...");
    const shopPaths = ["/loja/", "/shop/", "/produtos/"];

    for (const shopPath of shopPaths) {
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= MAX_PAGES) {
        const url = page === 1
          ? `${TARGET_URL}${shopPath}`
          : `${TARGET_URL}${shopPath}page/${page}/`;

        try {
          const res = await fetch(url, { headers: BROWSER_HEADERS });
          if (!res.ok) { hasMore = false; break; }
          const html = await res.text();

          const productMatches = html.match(/<li[^>]*class="[^"]*product[^"]*"[^>]*>[\s\S]*?<\/li>/g) || [];
          if (productMatches.length === 0) { hasMore = false; break; }

          console.log(`   → HTML page ${page}: ${productMatches.length} products`);

          for (const block of productMatches) {
            const titleMatch = block.match(/woocommerce-loop-product__title[^>]*>([^<]+)/);
            const priceMatch = block.match(/woocommerce-Price-amount[^"]*"[^>]*>[^<]*<[^>]*>([^<]+)/);
            const idMatch = block.match(/post-(\d+)/);
            const linkMatch = block.match(/href="([^"]+)"/);

            if (titleMatch) {
              const id = idMatch?.[1] || `html-${allProducts.length}`;
              if (!seenIds.has(id)) {
                seenIds.add(id);
                const priceText = priceMatch?.[1] || "0";
                const price = parseFloat(priceText.replace(/\./g, "").replace(",", ".")) || 0;
                allProducts.push({
                  id,
                  title: stripTags(titleMatch[1]),
                  price,
                  url: linkMatch?.[1] || "",
                  source: "html-paginated",
                });
              }
            }
          }

          // Check for next page link
          hasMore = html.includes(`page/${page + 1}/`) || html.includes(`paged=${page + 1}`);
          page++;
        } catch {
          hasMore = false;
        }
      }

      if (allProducts.length > 0) break;
    }
  }

  return allProducts;
}

// ── Upsert products into DB ─────────────────────────────────────────
async function upsertProducts(supabase: any, products: any[]) {
  let inserted = 0;
  let updated = 0;

  for (const product of products) {
    const externalId = `product-${product.id}`;
    const totalAmount = product.price || 0;
    const commission = totalAmount * 0.07;
    const netAmount = totalAmount - commission;

    const { data: existing } = await supabase
      .from("external_orders")
      .select("id")
      .eq("external_id", externalId)
      .maybeSingle();

    const rawData = {
      source: product.source,
      url: product.url,
      title: product.title,
      description: product.description,
      categories: product.categories,
      images: product.images,
      sku: product.sku,
    };

    if (existing) {
      await supabase
        .from("external_orders")
        .update({
          status: product.status || "active",
          total_amount: totalAmount,
          commission,
          net_amount: netAmount,
          updated_at: new Date().toISOString(),
          raw_data: rawData,
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
          raw_data: rawData,
          ordered_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        console.error(`Error inserting ${externalId}:`, error.message);
        continue;
      }

      if (newOrder) {
        await supabase.from("external_order_items").insert({
          order_id: newOrder.id,
          product_name: product.title || "Produto",
          price: totalAmount,
          quantity: 1,
          external_product_id: String(product.id),
          category: product.categories?.[0] || null,
        });
      }
      inserted++;
    }
  }

  return { inserted, updated };
}

// ── Main ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Determine mode from body or query
    let mode = "incremental";
    try {
      if (req.method === "POST") {
        const body = await req.json();
        mode = body.mode || "incremental";
      }
    } catch { /* no body */ }
    const url = new URL(req.url);
    if (url.searchParams.get("mode")) {
      mode = url.searchParams.get("mode")!;
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`🔄 Sync mode: ${mode}`);

    const products = await fetchAllProducts();
    console.log(`📦 Total products fetched: ${products.length}`);

    if (products.length === 0) {
      return new Response(
        JSON.stringify({ success: true, mode, inserted: 0, updated: 0, total: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { inserted, updated } = await upsertProducts(supabase, products);
    console.log(`✅ ${mode} complete: ${inserted} inserted, ${updated} updated, ${products.length} total`);

    return new Response(
      JSON.stringify({ success: true, mode, inserted, updated, total: products.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
