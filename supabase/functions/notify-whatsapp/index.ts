import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UAZAPI_BASE_URL = "https://ipazua.uazapi.com";
const UAZAPI_INSTANCE_ID = "c3bf5e66-6076-4ed0-b17c-21b47c776bce";
const RESEND_API_KEY_NAME = "RESEND_API_KEY";
const FROM_EMAIL = "Froiv <onboarding@resend.dev>";
const SITE_URL = "https://froiv.com";

async function sendWhatsApp(token: string, phone: string, text: string) {
  try {
    const res = await fetch(`${UAZAPI_BASE_URL}/sendText/${UAZAPI_INSTANCE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ number: phone, text }),
    });
    const result = await res.json();
    console.log(`WhatsApp to ${phone}: ${res.status}`);
    return res.ok;
  } catch (e) {
    console.error("WhatsApp send error:", e);
    return false;
  }
}

async function sendEmail(to: string, subject: string, body: string) {
  const resendKey = Deno.env.get(RESEND_API_KEY_NAME);
  if (!resendKey) {
    console.log("RESEND_API_KEY not set, skipping email");
    return false;
  }
  try {
    const html = `<!DOCTYPE html>
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
    <h2 style="color:#111;font-size:18px;margin:0 0 12px">${subject}</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;white-space:pre-line">${body}</p>
  </td></tr>
  <tr><td style="padding:24px 32px;text-align:center">
    <p style="color:#999;font-size:11px;margin:0">© ${new Date().getFullYear()} Froiv — Todos os direitos reservados</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendKey}`,
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    });
    const data = await res.json();
    if (!res.ok) console.error("Resend error:", JSON.stringify(data));
    return res.ok;
  } catch (e) {
    console.error("Email send error:", e);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const uazapiToken = Deno.env.get("UAZAPI_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const results = { whatsapp: false, email: false };

    // ── Mode 1: notification_id (triggered by DB on every notification insert) ──
    if (body.notification_id) {
      const { data: notif, error: nErr } = await admin
        .from("notifications")
        .select("*")
        .eq("id", body.notification_id)
        .single();

      if (nErr || !notif) {
        console.error("Notification not found:", nErr);
        return new Response(
          JSON.stringify({ error: "Notification not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: profile } = await admin
        .from("profiles")
        .select("whatsapp, phone, email, name")
        .eq("user_id", notif.user_id)
        .single();

      const phone = profile?.whatsapp || profile?.phone;
      const email = profile?.email;
      const link = notif.link ? `${SITE_URL}${notif.link}` : SITE_URL;

      // Clean title (remove emojis for plain text comparison but keep for messages)
      const whatsappMsg = `📢 *Froiv*\n\n*${notif.title}*\n${notif.body}\n\n🔗 ${link}`;
      const emailSubject = notif.title.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "").trim();

      // Send WhatsApp
      if (phone && uazapiToken) {
        const cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length >= 10) {
          results.whatsapp = await sendWhatsApp(uazapiToken, cleanPhone, whatsappMsg);
        }
      }

      // Send Email
      if (email) {
        results.email = await sendEmail(email, emailSubject || "Notificação Froiv", `${notif.title}\n\n${notif.body}\n\nAcesse: ${link}`);
      }

      if (!phone && !email) {
        console.log(`User ${notif.user_id} has no WhatsApp/phone/email, skipping`);
      }

      return new Response(
        JSON.stringify({ success: true, ...results }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Mode 2: user_id + message (direct call) ──
    if (body.user_id && body.message) {
      const { data: profile } = await admin
        .from("profiles")
        .select("whatsapp, phone, email")
        .eq("user_id", body.user_id)
        .single();

      const phone = profile?.whatsapp || profile?.phone;
      const email = profile?.email;

      if (phone && uazapiToken) {
        const cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length >= 10) {
          results.whatsapp = await sendWhatsApp(uazapiToken, cleanPhone, body.message);
        }
      }

      if (email) {
        results.email = await sendEmail(email, body.subject || "Notificação Froiv", body.message);
      }

      return new Response(
        JSON.stringify({ success: true, ...results }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Mode 3: transaction_id + type (sale notifications) ──
    if (body.transaction_id) {
      const { data: tx, error: txErr } = await admin
        .from("transactions")
        .select("*, listings(title, category, price)")
        .eq("id", body.transaction_id)
        .single();

      if (txErr || !tx) {
        return new Response(
          JSON.stringify({ error: "Transaction not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: buyerProfile } = await admin
        .from("profiles")
        .select("name, username")
        .eq("user_id", tx.buyer_id)
        .single();

      const { data: sellerProfile } = await admin
        .from("profiles")
        .select("whatsapp, phone, email")
        .eq("user_id", tx.seller_id)
        .single();

      const buyerName = buyerProfile?.name || buyerProfile?.username || "Comprador";
      const listing = tx.listings as any;
      const amount = Number(tx.amount);
      const amountStr = `R$ ${amount.toFixed(2).replace(".", ",")}`;
      const txLink = `${SITE_URL}/compras/${body.transaction_id}`;

      let whatsappMsg = "";
      let emailSubject = "";
      let emailBody = "";

      if (body.type === "payment_confirmed") {
        whatsappMsg = `✅ *Pagamento confirmado!*\n\n📦 *Produto:* ${listing?.title || "Conta"}\n💰 *Valor:* ${amountStr}\n👤 *Comprador:* ${buyerName}\n\n📩 Acesse o chat da transação para enviar os dados de acesso.\n🔗 ${txLink}`;
        emailSubject = `✅ Pagamento confirmado — ${listing?.title || "Conta"}`;
        emailBody = `Pagamento de ${amountStr} confirmado!\n\nProduto: ${listing?.title || "Conta"}\nComprador: ${buyerName}\n\nAcesse o chat da transação para enviar os dados de acesso.\n${txLink}`;
      } else {
        whatsappMsg = `🎉 *Nova venda na Froiv!*\n\n📦 *Produto:* ${listing?.title || "Conta"}\n💰 *Valor:* ${amountStr}\n👤 *Comprador:* ${buyerName}\n\n⚡ Envie as credenciais pelo chat.\n🔗 ${txLink}`;
        emailSubject = `🎉 Nova venda — ${listing?.title || "Conta"}`;
        emailBody = `Você vendeu ${listing?.title || "Conta"} por ${amountStr}!\n\nComprador: ${buyerName}\n\nEnvie as credenciais pelo chat da transação.\n${txLink}`;
      }

      const sellerPhone = sellerProfile?.whatsapp || sellerProfile?.phone;
      if (sellerPhone && uazapiToken) {
        const cleanPhone = sellerPhone.replace(/\D/g, "");
        if (cleanPhone.length >= 10) {
          results.whatsapp = await sendWhatsApp(uazapiToken, cleanPhone, whatsappMsg);
        }
      }

      if (sellerProfile?.email) {
        results.email = await sendEmail(sellerProfile.email, emailSubject, emailBody);
      }

      return new Response(
        JSON.stringify({ success: true, ...results }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Provide notification_id, user_id+message, or transaction_id" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("notify-whatsapp error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
