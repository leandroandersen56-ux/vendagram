import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const listingId = url.searchParams.get("id");

    if (!listingId) {
      return new Response("Missing id", { status: 400 });
    }

    const personalUrl = 'https://yzwncktlibdfycqhvlqg.supabase.co';
    const serviceKey = Deno.env.get('PERSONAL_SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(personalUrl, serviceKey);

    const { data: listing, error } = await supabase
      .from("listings")
      .select("id, title, description, price, screenshots, category, platform_username, followers_count, seller_id")
      .eq("id", listingId)
      .maybeSingle();

    if (error || !listing) {
      return new Response("Listing not found", { status: 404 });
    }

    const price = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(listing.price || 0);
    const title = `${listing.title} - ${price} | Froiv`;
    const description = listing.description
      ? listing.description.substring(0, 160)
      : `Compre ${listing.title} por ${price} com proteção Escrow no Froiv.`;
    
    const image = listing.screenshots && listing.screenshots.length > 0
      ? listing.screenshots[0]
      : "https://froiv.com/og-image.jpg";

    const listingUrl = `https://froiv.com/listing/${listing.id}`;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:type" content="product">
  <meta property="og:url" content="${listingUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Froiv">
  <meta property="og:locale" content="pt_BR">
  <meta property="product:price:amount" content="${listing.price}">
  <meta property="product:price:currency" content="BRL">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <meta http-equiv="refresh" content="0;url=${listingUrl}">
</head>
<body>
  <p>Redirecionando para <a href="${listingUrl}">${escapeHtml(listing.title)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error("OG listing error:", err);
    return new Response("Internal error", { status: 500 });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
