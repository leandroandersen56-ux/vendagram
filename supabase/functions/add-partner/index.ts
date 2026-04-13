import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const serviceKey = Deno.env.get("PERSONAL_SUPABASE_SERVICE_ROLE_KEY");
  const db = createClient("https://yzwncktlibdfycqhvlqg.supabase.co", serviceKey!);

  const { data, error } = await db.from("partners").upsert({
    name: "Admin Principal",
    email: "sparckonmeta@gmail.com",
    profit_percent: 5.00,
    is_active: true,
  }, { onConflict: "email" }).select();

  return new Response(JSON.stringify({ data, error: error?.message }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
