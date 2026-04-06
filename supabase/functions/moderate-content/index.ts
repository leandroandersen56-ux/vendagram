import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";

const PHONE_PATTERNS = [
  /(?:\+?\d{1,3}[\s.\-]?)?\(?\d{2}\)?[\s.\-]?\d{4,5}[\s.\-]?\d{4}/g,
  /\d[\d\s.\-()]{7,}\d/g,
  /(?:whats|wpp|zap|zapzap|whatsapp|whatts|wats)\s*[:.]?\s*[\d\s.\-()]{5,}/gi,
];

const EMAIL_PATTERNS = [
  /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/gi,
  /[a-zA-Z0-9._%+\-]+\s*(?:\[?\s*(?:at|arroba|@)\s*\]?)\s*[a-zA-Z0-9.\-]+\s*(?:\[?\s*(?:dot|ponto|\.)\s*\]?)\s*[a-zA-Z]{2,}/gi,
];

const URL_PATTERNS = [
  /https?:\/\/[^\s<>"']+/gi,
  /www\.[^\s<>"']+/gi,
  /[a-zA-Z0-9\-]+\.(?:com|com\.br|net|org|io|me|app|dev|xyz|info|biz|cc|co)(?:\/[^\s]*)?/gi,
];

const SOCIAL_PATTERNS = [
  /@[a-zA-Z0-9_.]{3,30}/g,
  /(?:me\s+(?:chama|add|adiciona|segue|manda\s+msg)|chama\s+(?:no|na)|segue\s+(?:no|na)|add\s+(?:no|na))\s*(?:insta|instagram|face|facebook|twitter|telegram|discord|snap|snapchat|tiktok|whats|whatsapp|wpp|zap)/gi,
  /(?:meu|minha)\s+(?:insta|instagram|face|facebook|twitter|telegram|discord|snap|snapchat|tiktok|whats|whatsapp|wpp|zap|email|e-mail|numero|número|tel|telefone|cel|celular)\s*(?:é|eh|:)\s*\S+/gi,
  /t\.me\/[a-zA-Z0-9_]+/gi,
  /[a-zA-Z0-9_]{2,32}#\d{4}/g,
];

const INTENT_KEYWORDS = [
  /(?:vamos?\s+)?(?:negociar?|conversar?|combinar?|fechar?)\s+(?:por\s+)?(?:fora|privado|pv|dm|direct|inbox|particular)/gi,
  /(?:paga|pagamento|pago|pix)\s+(?:por\s+)?(?:fora|direto|particular)/gi,
];

function moderateText(text: string): { blocked: boolean; reasons: string[] } {
  if (!text?.trim()) return { blocked: false, reasons: [] };

  const reasons: string[] = [];

  for (const p of PHONE_PATTERNS) {
    p.lastIndex = 0;
    const matches = text.match(p);
    if (matches) {
      for (const m of matches) {
        if (m.replace(/\D/g, "").length >= 8) {
          reasons.push("phone");
          break;
        }
      }
    }
  }

  for (const p of EMAIL_PATTERNS) {
    p.lastIndex = 0;
    if (p.test(text)) { reasons.push("email"); break; }
  }

  for (const p of URL_PATTERNS) {
    p.lastIndex = 0;
    const matches = text.match(p);
    if (matches?.some((m) => !m.toLowerCase().includes("froiv"))) {
      reasons.push("url");
      break;
    }
  }

  for (const p of SOCIAL_PATTERNS) {
    p.lastIndex = 0;
    if (p.test(text)) { reasons.push("social"); break; }
  }

  for (const p of INTENT_KEYWORDS) {
    p.lastIndex = 0;
    if (p.test(text)) { reasons.push("intent"); break; }
  }

  return { blocked: reasons.length > 0, reasons: [...new Set(reasons)] };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, imageUrl, context } = await req.json();

    // Text moderation
    if (text) {
      const result = moderateText(text);
      if (result.blocked) {
        // Log the attempt
        const authHeader = req.headers.get("Authorization");
        if (authHeader) {
          const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
          );
          const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
          if (user) {
            await supabase.from("audit_logs").insert({
              user_id: user.id,
              action: "contact_blocked",
              details: { reasons: result.reasons, context: context || "unknown", text_preview: text.substring(0, 100) },
            });
          }
        }

        return new Response(
          JSON.stringify({ blocked: true, reasons: result.reasons, message: "Conteúdo com informações de contato bloqueado." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // Image moderation via AI (if imageUrl provided)
    if (imageUrl) {
      const apiKey = Deno.env.get("LOVABLE_API_KEY");
      if (apiKey) {
        const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: "You are a content moderator. Analyze the image and determine if it contains any contact information such as phone numbers, email addresses, social media handles, URLs, QR codes, or any other way to contact someone outside the platform. Respond with JSON: {\"has_contact\": true/false, \"details\": \"description of what was found\"}"
              },
              {
                role: "user",
                content: [
                  { type: "text", text: "Does this image contain any contact information?" },
                  { type: "image_url", image_url: { url: imageUrl } }
                ]
              }
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            try {
              const parsed = JSON.parse(content);
              if (parsed.has_contact) {
                return new Response(
                  JSON.stringify({ blocked: true, reasons: ["image_contact"], message: `Imagem com informações de contato detectada: ${parsed.details}` }),
                  { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
                );
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ blocked: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
