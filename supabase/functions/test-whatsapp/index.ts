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
    const text = "🔔 *Teste Froiv*";
    const results: Record<string, any> = {};

    // Try various endpoint patterns
    const endpoints = [
      { name: "send-text-chatId", path: "/message/send-text", body: { chatId: `${phone}@s.whatsapp.net`, text } },
      { name: "send-message", path: "/message/send-message", body: { number: phone, text } },
      { name: "send", path: "/send", body: { number: phone, text } },
      { name: "sendText-no-path", path: "/sendText", body: { number: phone, text } },
      { name: "chat-send-text", path: "/chat/send/text", body: { number: phone, message: text } },
    ];

    for (const ep of endpoints) {
      try {
        const r = await fetch(`${BASE}${ep.path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "token": TOKEN },
          body: JSON.stringify(ep.body),
        });
        results[ep.name] = { status: r.status, body: await r.text() };
      } catch (e) {
        results[ep.name] = { error: e.message };
      }
    }

    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
