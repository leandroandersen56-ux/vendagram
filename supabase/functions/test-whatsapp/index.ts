const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const token = Deno.env.get("UAZAPI_TOKEN");
    if (!token) return new Response(JSON.stringify({ error: "UAZAPI_TOKEN not set" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const INSTANCE_ID = "c433e432-781e-4f03-a8fc-d9e3cb1c6f4a";
    const phone = "5517997091070";
    const text = "🔔 *Teste Froiv*\n\nAPI WhatsApp conectada com sucesso! ✅";

    const res = await fetch(`https://ipazua.uazapi.com/sendText/${INSTANCE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ number: phone, text }),
    });

    const data = await res.text();
    return new Response(JSON.stringify({ status: res.status, ok: res.ok, response: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
