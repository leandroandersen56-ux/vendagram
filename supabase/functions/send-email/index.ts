import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Froiv <noreply@froiv.com>";

const LOGO_URL = "https://vendagram.lovable.app/logo-froiv-white.svg";
const SITE_URL = "https://vendagram.lovable.app";

function wrapTemplate(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
  <tr><td style="background:#2D6FF0;padding:28px 32px;border-radius:16px 16px 0 0;text-align:center">
    <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0">Froiv</h1>
    <p style="color:rgba(255,255,255,0.85);font-size:12px;margin:4px 0 0">Marketplace de Contas Digitais</p>
  </td></tr>
  <tr><td style="background:#fff;padding:32px;border-radius:0 0 16px 16px">
    ${bodyContent}
  </td></tr>
  <tr><td style="padding:24px 32px;text-align:center">
    <p style="color:#999;font-size:11px;margin:0">© ${new Date().getFullYear()} Froiv — Todos os direitos reservados</p>
    <p style="color:#999;font-size:11px;margin:6px 0 0">
      <a href="${SITE_URL}/termos" style="color:#999">Termos</a> · 
      <a href="${SITE_URL}/privacidade" style="color:#999">Privacidade</a> · 
      <a href="${SITE_URL}/ajuda" style="color:#999">Ajuda</a>
    </p>
    <p style="color:#BBB;font-size:10px;margin:8px 0 0">Você recebeu este email porque tem uma conta na Froiv.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function btn(text: string, url: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td align="center">
    <a href="${url}" style="display:inline-block;background:#2D6FF0;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none">${text}</a>
  </td></tr></table>`;
}

function getEmailBody(type: string, data: Record<string, any>): { subject: string; html: string } {
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  switch (type) {
    case "purchase_confirmed":
      return {
        subject: "✅ Compra confirmada — suas credenciais estão prontas!",
        html: wrapTemplate(`
          <h2 style="color:#111;font-size:20px;margin:0 0 16px">Compra confirmada! 🎉</h2>
          <p style="color:#555;font-size:14px;line-height:1.6">Seu pagamento de <strong>${fmt(data.amount)}</strong> foi aprovado para o anúncio <strong>${data.title}</strong>.</p>
          <p style="color:#555;font-size:14px;line-height:1.6">As credenciais já estão disponíveis no seu painel de compras.</p>
          ${btn("📦 Ver credenciais", `${SITE_URL}/compras/${data.transaction_id}`)}
          <div style="background:#FFF8E0;border:1px solid #FFD700;border-radius:8px;padding:12px;margin-top:16px">
            <p style="color:#666;font-size:12px;margin:0">⚠️ Troque a senha imediatamente após o primeiro acesso. Você tem <strong>24h</strong> para verificar a conta.</p>
          </div>
        `),
      };

    case "sale_completed":
      return {
        subject: `💰 Você vendeu! ${fmt(data.net)} em caminho para sua carteira`,
        html: wrapTemplate(`
          <h2 style="color:#111;font-size:20px;margin:0 0 16px">Venda realizada! 💰</h2>
          <p style="color:#555;font-size:14px;line-height:1.6">O anúncio <strong>${data.title}</strong> foi vendido.</p>
          <table style="width:100%;margin:16px 0;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Valor da venda</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#111;font-size:14px">${fmt(data.amount)}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Taxa Froiv (7%)</td><td style="padding:8px 0;text-align:right;color:#888;font-size:14px">-${fmt(data.fee)}</td></tr>
            <tr style="border-top:1px solid #E8E8E8"><td style="padding:12px 0;font-weight:700;color:#111;font-size:14px">Você recebe</td><td style="padding:12px 0;text-align:right;font-weight:700;color:#2D6FF0;font-size:16px">${fmt(data.net)}</td></tr>
          </table>
          <p style="color:#555;font-size:13px">O valor ficará em custódia até o comprador confirmar o recebimento (até 24h).</p>
          ${btn("Ver transação", `${SITE_URL}/compras/${data.transaction_id}`)}
        `),
      };

    case "new_offer":
      return {
        subject: `🤝 Nova oferta de ${fmt(data.offered_price)} recebida`,
        html: wrapTemplate(`
          <h2 style="color:#111;font-size:20px;margin:0 0 16px">Nova oferta recebida! 🤝</h2>
          <p style="color:#555;font-size:14px;line-height:1.6">Um comprador fez uma oferta para <strong>${data.title}</strong>.</p>
          <table style="width:100%;margin:16px 0;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Preço original</td><td style="padding:8px 0;text-align:right;color:#111;font-size:14px">${fmt(data.original_price)}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Oferta</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#2D6FF0;font-size:16px">${fmt(data.offered_price)}</td></tr>
          </table>
          ${data.buyer_message ? `<div style="background:#F5F5F5;border-radius:8px;padding:12px;margin:12px 0"><p style="color:#555;font-size:13px;margin:0;font-style:italic">"${data.buyer_message}"</p></div>` : ""}
          <p style="color:#FF6900;font-size:12px;font-weight:600">⏱ Expira em 24 horas</p>
          ${btn("Responder oferta", `${SITE_URL}/vendedor`)}
        `),
      };

    case "offer_accepted":
      return {
        subject: `✅ Oferta aceita! Finalize o pagamento de ${fmt(data.final_price)}`,
        html: wrapTemplate(`
          <h2 style="color:#111;font-size:20px;margin:0 0 16px">Sua oferta foi aceita! ✅</h2>
          <p style="color:#555;font-size:14px;line-height:1.6">O vendedor aceitou sua oferta para <strong>${data.title}</strong>.</p>
          <div style="background:#E8F8EF;border-radius:10px;padding:16px;text-align:center;margin:16px 0">
            <p style="color:#888;font-size:12px;margin:0">Valor negociado</p>
            <p style="color:#05964D;font-size:24px;font-weight:700;margin:4px 0 0">${fmt(data.final_price)}</p>
          </div>
          <p style="color:#FF6900;font-size:12px;font-weight:600">⏱ Finalize o pagamento em até 24h</p>
          ${btn("💳 Pagar agora", `${SITE_URL}/checkout/${data.listing_id}`)}
        `),
      };

    case "offer_rejected":
      return {
        subject: "❌ Sua oferta não foi aceita",
        html: wrapTemplate(`
          <h2 style="color:#111;font-size:20px;margin:0 0 16px">Oferta não aceita ❌</h2>
          <p style="color:#555;font-size:14px;line-height:1.6">Infelizmente o vendedor recusou sua oferta para <strong>${data.title}</strong>.</p>
          <p style="color:#555;font-size:14px;line-height:1.6">Você pode tentar um valor mais alto ou comprar pelo preço original.</p>
          ${btn("Ver anúncio", `${SITE_URL}/listing/${data.listing_id}`)}
        `),
      };

    case "counter_offer":
      return {
        subject: `↩️ Contraproposta de ${fmt(data.counter_price)} recebida`,
        html: wrapTemplate(`
          <h2 style="color:#111;font-size:20px;margin:0 0 16px">Contraproposta recebida ↩️</h2>
          <p style="color:#555;font-size:14px;line-height:1.6">O vendedor fez uma contraproposta para <strong>${data.title}</strong>.</p>
          <table style="width:100%;margin:16px 0;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Sua oferta</td><td style="padding:8px 0;text-align:right;color:#111;font-size:14px">${fmt(data.offered_price)}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Contraproposta</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#2D6FF0;font-size:16px">${fmt(data.counter_price)}</td></tr>
          </table>
          ${data.seller_message ? `<div style="background:#F5F5F5;border-radius:8px;padding:12px;margin:12px 0"><p style="color:#555;font-size:13px;margin:0;font-style:italic">"${data.seller_message}"</p></div>` : ""}
          <p style="color:#FF6900;font-size:12px;font-weight:600">⏱ Responda em até 24 horas</p>
          ${btn("Responder", `${SITE_URL}/listing/${data.listing_id}`)}
        `),
      };

    case "escrow_released":
      return {
        subject: `💰 ${fmt(data.net)} liberados na sua carteira Froiv!`,
        html: wrapTemplate(`
          <h2 style="color:#111;font-size:20px;margin:0 0 16px">Pagamento liberado! 💰</h2>
          <p style="color:#555;font-size:14px;line-height:1.6">O escrow da transação foi liberado. <strong>${fmt(data.net)}</strong> já está disponível na sua carteira.</p>
          ${btn("💳 Ver carteira", `${SITE_URL}/carteira`)}
        `),
      };

    case "dispute_opened":
      return {
        subject: "⚠️ Disputa aberta — prazo de 48h para resolução",
        html: wrapTemplate(`
          <h2 style="color:#111;font-size:20px;margin:0 0 16px">Disputa aberta ⚠️</h2>
          <p style="color:#555;font-size:14px;line-height:1.6">Uma disputa foi aberta para a transação <strong>#${data.transaction_id?.slice(0, 8)}</strong>.</p>
          <div style="background:#FFF0F0;border:1px solid #FF4444;border-radius:8px;padding:12px;margin:16px 0">
            <p style="color:#333;font-size:13px;margin:0"><strong>Motivo:</strong> ${data.description}</p>
          </div>
          <p style="color:#555;font-size:13px">A equipe Froiv tem 48h para mediar. Acompanhe pelo chat da transação.</p>
          ${btn("Ver transação", `${SITE_URL}/compras/${data.transaction_id}`)}
        `),
      };

    case "withdrawal_processed":
      return {
        subject: `✅ Saque de ${fmt(data.amount)} processado`,
        html: wrapTemplate(`
          <h2 style="color:#111;font-size:20px;margin:0 0 16px">Saque processado! ✅</h2>
          <p style="color:#555;font-size:14px;line-height:1.6">Seu saque de <strong>${fmt(data.amount)}</strong> foi processado com sucesso.</p>
          <table style="width:100%;margin:16px 0;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Valor</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#111">${fmt(data.amount)}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Chave Pix</td><td style="padding:8px 0;text-align:right;color:#111">${data.pix_key}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Prazo</td><td style="padding:8px 0;text-align:right;color:#111">Até 1 dia útil</td></tr>
          </table>
          ${btn("Ver carteira", `${SITE_URL}/carteira`)}
        `),
      };

    case "credentials_needed":
      return {
        subject: `🔑 Envie as credenciais! ${data.buyer_name} comprou "${data.title}"`,
        html: wrapTemplate(`
          <h2 style="color:#111;font-size:20px;margin:0 0 16px">Envie as credenciais agora! 🔑</h2>
          <p style="color:#555;font-size:14px;line-height:1.6"><strong>${data.buyer_name}</strong> comprou <strong>${data.title}</strong>.</p>
          <table style="width:100%;margin:16px 0;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Valor da venda</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#111;font-size:14px">${fmt(data.amount)}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px">Taxa Froiv (10%)</td><td style="padding:8px 0;text-align:right;color:#888;font-size:14px">-${fmt(data.fee)}</td></tr>
            <tr style="border-top:1px solid #E8E8E8"><td style="padding:12px 0;font-weight:700;color:#111;font-size:14px">Você recebe</td><td style="padding:12px 0;text-align:right;font-weight:700;color:#2D6FF0;font-size:16px">${fmt(data.net)}</td></tr>
          </table>
          <p style="color:#FF6900;font-size:13px;font-weight:600">⚠️ Envie os dados de acesso pelo chat o mais rápido possível!</p>
          ${btn("💬 Abrir chat", `${SITE_URL}/compras/${data.transaction_id}`)}
        `),
      };

    case "credentials_delivered":
      return {
        subject: `🔑 Suas credenciais de acesso — ${data.title}`,
        html: wrapTemplate(`
          <h2 style="color:#111;font-size:20px;margin:0 0 16px">Credenciais recebidas! 🔑</h2>
          <p style="color:#555;font-size:14px;line-height:1.6">Sua compra de <strong>${data.title}</strong> foi confirmada. Seus dados de acesso estão disponíveis abaixo.</p>
          ${data.credentials_text ? `
            <div style="background:#F5F7FF;border:1px solid #D9E4FF;border-radius:10px;padding:16px;margin:16px 0">
              <p style="color:#111;font-size:13px;font-weight:700;margin:0 0 8px">Dados de acesso</p>
              <p style="color:#333;font-size:13px;line-height:1.7;white-space:pre-line;margin:0">${data.credentials_text}</p>
            </div>
          ` : ""}
          ${btn("📦 Ver transação", `${SITE_URL}/compras/${data.transaction_id}`)}
          <div style="background:#FFF8E0;border:1px solid #FFD700;border-radius:8px;padding:12px;margin-top:16px">
            <p style="color:#666;font-size:12px;margin:0">⚠️ Troque a senha imediatamente após o primeiro acesso. Você tem <strong>24h</strong> para verificar a conta antes do pagamento ser liberado ao vendedor.</p>
          </div>
        `),
      };

    case "welcome":
      return {
        subject: "🎉 Email confirmado! Bem-vindo à Froiv",
        html: wrapTemplate(`
          <h2 style="color:#111;font-size:20px;margin:0 0 16px">Bem-vindo à Froiv! 🎉</h2>
          <p style="color:#555;font-size:14px;line-height:1.6">Seu email foi confirmado. Agora você tem acesso completo ao marketplace.</p>
          <div style="margin:20px 0">
            <p style="color:#555;font-size:13px;line-height:1.8">🔒 <strong>Compre com segurança</strong> — Escrow protege seu pagamento</p>
            <p style="color:#555;font-size:13px;line-height:1.8">⚡ <strong>Receba na hora</strong> — Credenciais entregues após pagamento</p>
            <p style="color:#555;font-size:13px;line-height:1.8">💰 <strong>Venda suas contas</strong> — Taxa fixa de 7%</p>
          </div>
          ${btn("🚀 Explorar contas", `${SITE_URL}/marketplace`)}
        `),
      };

    default:
      return { subject: "Notificação Froiv", html: wrapTemplate(`<p>${data.message || ""}</p>`) };
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not set, skipping email to:", to);
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Resend error:", JSON.stringify(data));
    return { success: false, error: data };
  }
  return { success: true, data };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, to, data } = await req.json();

    if (!type || !to) {
      return new Response(JSON.stringify({ error: "Missing type or to" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = getEmailBody(type, data || {});
    const result = await sendEmail(to, email.subject, email.html);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-email error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
