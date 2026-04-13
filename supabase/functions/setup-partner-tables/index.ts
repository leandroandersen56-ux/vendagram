import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const serviceKey = Deno.env.get("PERSONAL_SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) return new Response("Missing key", { status: 500 });

  const db = createClient(
    "https://yzwncktlibdfycqhvlqg.supabase.co",
    serviceKey
  );

  // Check if tables exist
  const { data: testPartners, error: testErr } = await db
    .from("partners")
    .select("id")
    .limit(1);

  return new Response(JSON.stringify({
    tables_exist: !testErr,
    error: testErr?.message || null,
    partners_found: testPartners?.length || 0
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
