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
    const text = "🔔 *Teste Froiv* - API WhatsApp conectada!";

    const results: Record<string, any> = {};

    // 1) Check connection status
    const r1 = await fetch(`${BASE}/instance/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "token": TOKEN },
    });
    results.connect = { status: r1.status, body: await r1.text() };

    // 2) Try /message/send-text with token header
    const r2 = await fetch(`${BASE}/message/send-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "token": TOKEN },
      body: JSON.stringify({ number: phone, text }),
    });
    results.send_text_token_header = { status: r2.status, body: await r2.text() };

    // 3) Try /sendText/{token} with token header  
    const r3 = await fetch(`${BASE}/sendText/${TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "token": TOKEN },
      body: JSON.stringify({ number: phone, text }),
    });
    results.sendText_path_and_header = { status: r3.status, body: await r3.text() };

    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
