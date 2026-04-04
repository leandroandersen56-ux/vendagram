import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase
    .from("offers")
    .update({ status: "expired" })
    .in("status", ["pending", "countered"])
    .lt("expires_at", new Date().toISOString())
    .select("id, buyer_id, listing_id");

  if (!error && data) {
    for (const offer of data) {
      await supabase.from("notifications").insert({
        user_id: offer.buyer_id,
        title: "⏰ Sua oferta expirou",
        body: "O vendedor não respondeu em 24h. Faça uma nova oferta ou compre pelo preço original.",
        link: `/listing/${offer.listing_id}`,
      });
    }
  }

  return new Response(JSON.stringify({ expired: data?.length ?? 0 }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
