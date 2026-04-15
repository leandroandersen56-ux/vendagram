const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const token = Deno.env.get("UAZAPI_TOKEN");
    if (!token) return new Response(JSON.stringify({ error: "UAZAPI_TOKEN not set" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Try with new instance token as both ID and Bearer
    const INSTANCE_TOKEN = "aac8a7b8-acbd-4941-ae19-965a8e66278f";
    const phone = "5517997091070";
    const text = "🔔 *Teste Froiv*\n\nAPI WhatsApp conectada com sucesso! ✅";

    // Test 1: instance token in URL, UAZAPI_TOKEN as bearer
    const res1 = await fetch(`https://ipazua.uazapi.com/sendText/${INSTANCE_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ number: phone, text }),
    });
    const data1 = await res1.text();

    return new Response(JSON.stringify({
      test1: { status: res1.status, ok: res1.ok, response: data1 },
      token_used: token?.substring(0, 8) + "...",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
