const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const TOKEN = "aac8a7b8-acbd-4941-ae19-965a8e66278f";
    const BASE = "https://ipazua.uazapi.com";
    const phone = "5517997091070";
    const text = "🔔 Teste Froiv";
    const results: Record<string, any> = {};

    // Try GET /sendText with query params and token header
    const url1 = `${BASE}/sendText?number=${phone}&text=${encodeURIComponent(text)}`;
    const r1 = await fetch(url1, { headers: { "token": TOKEN } });
    results["GET_sendText_query"] = { status: r1.status, body: await r1.text() };

    // Try GET /message/send-text with query params
    const url2 = `${BASE}/message/send-text?number=${phone}&text=${encodeURIComponent(text)}`;
    const r2 = await fetch(url2, { headers: { "token": TOKEN } });
    results["GET_message_send_text"] = { status: r2.status, body: await r2.text() };

    // Try POST /instance/sendText (maybe instance prefix)
    const r3 = await fetch(`${BASE}/instance/sendText`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "token": TOKEN },
      body: JSON.stringify({ number: phone, text }),
    });
    results["POST_instance_sendText"] = { status: r3.status, body: await r3.text() };

    // Try POST /api/sendText
    const r4 = await fetch(`${BASE}/api/sendText`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "token": TOKEN },
      body: JSON.stringify({ number: phone, text }),
    });
    results["POST_api_sendText"] = { status: r4.status, body: await r4.text() };

    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
