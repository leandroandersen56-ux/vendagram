const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const INSTANCE_TOKEN = "aac8a7b8-acbd-4941-ae19-965a8e66278f";
    const SERVER_URL = "https://ipazua.uazapi.com";
    const phone = "5517997091070";
    const text = "🔔 *Teste Froiv* - API WhatsApp conectada com sucesso!";

    const res = await fetch(`${SERVER_URL}/send/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": INSTANCE_TOKEN,
      },
      body: JSON.stringify({ number: phone, text }),
    });
    const data = await res.text();

    return new Response(JSON.stringify({ status: res.status, ok: res.ok, body: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
