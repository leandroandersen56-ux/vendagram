import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DB_URL = "https://yzwncktlibdfycqhvlqg.supabase.co";
const UAZAPI_BASE_URL = "https://ipazua.uazapi.com";
const RESEND_API_KEY_NAME = "RESEND_API_KEY";
const FROM_EMAIL = "Froiv <noreply@froiv.com>";
const SITE_URL = "https://froiv.com";

function getAdmin() {
  const key = Deno.env.get("PERSONAL_SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!key) throw new Error("PERSONAL_SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(DB_URL, key);
}

function normalizeEmail(value?: string | null) {
  const email = value?.trim().toLowerCase();
  return email || null;
}

function normalizeBrazilianPhone(value?: string | null) {
  if (!value) return null;

  const digits = value.replace(/\D/g, "").replace(/^0+/, "");
  if (!digits) return null;

  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  if (digits.length >= 12) {
    return digits;
  }

  return null;
}

async function sendWhatsApp(token: string, phone: string, text: string) {
  try {
    console.log(`[WA] Sending to ${phone}, token length: ${token?.length}, url: ${UAZAPI_BASE_URL}/send/text`);
    const res = await fetch(`${UAZAPI_BASE_URL}/send/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token,
      },
      body: JSON.stringify({ number: phone, text }),
    });
    const body = await res.text();
    console.log(`[WA] Response ${res.status}: ${body.substring(0, 200)}`);
    return res.ok;
  } catch (e) {
    console.error("[WA] Send error:", e);
    return false;
  }
}

function wrapEmail(subject: string, bodyContent: string): string {
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
    <h2 style="color:#111;font-size:18px;margin:0 0 12px">${subject}</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;white-space:pre-line">${bodyContent}</p>
  </td></tr>
  <tr><td style="padding:24px 32px;text-align:center">
    <p style="color:#999;font-size:11px;margin:0">© ${new Date().getFullYear()} Froiv — Todos os direitos reservados</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

async function sendEmail(to: string, subject: string, body: string) {
  const resendKey = Deno.env.get(RESEND_API_KEY_NAME);
  if (!resendKey) {
    console.log("RESEND_API_KEY not set, skipping email");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html: wrapEmail(subject, body) }),
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
    console.log(`[INIT] UAZAPI_TOKEN set: ${!!uazapiToken}, length: ${uazapiToken?.length || 0}`);
    const admin = getAdmin();
    const body = await req.json();
    const results = { whatsapp: false, email: false, buyer_whatsapp: false, buyer_email: false };

    if (body.notification_id) {
      const { data: notif, error: nErr } = await admin
        .from("notifications")
        .select("*")
        .eq("id", body.notification_id)
        .single();

      if (nErr || !notif) {
        console.error("Notification not found:", nErr);
        return new Response(JSON.stringify({ error: "Notification not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: profile } = await admin
        .from("profiles")
        .select("whatsapp, phone, email, name")
        .eq("user_id", notif.user_id)
        .single();

      const phone = normalizeBrazilianPhone(profile?.whatsapp || profile?.phone);
      const email = normalizeEmail(profile?.email);
      const link = notif.link ? `${SITE_URL}${notif.link}` : SITE_URL;
      const whatsappMsg = `📢 *Froiv*\n\n*${notif.title}*\n${notif.body}\n\n🔗 ${link}`;
      const emailSubject = notif.title.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "").trim();

      if (phone && uazapiToken) {
        results.whatsapp = await sendWhatsApp(uazapiToken, phone, whatsappMsg);
      }
      if (email) {
        results.email = await sendEmail(email, emailSubject || "Notificação Froiv", `${notif.title}\n\n${notif.body}\n\nAcesse: ${link}`);
      }

      return new Response(JSON.stringify({ success: true, ...results }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.user_id && body.message) {
      const { data: profile, error: pErr } = await admin
        .from("profiles")
        .select("whatsapp, phone, email")
        .eq("user_id", body.user_id)
        .single();

      console.log(`[MODE2] Profile:`, JSON.stringify(profile), `Error:`, pErr?.message);

      const phone = normalizeBrazilianPhone(profile?.whatsapp || profile?.phone || body.phone);
      const email = normalizeEmail(profile?.email || body.email);

      if (phone && uazapiToken) {
        console.log(`[MODE2] Sending WA to: ${phone}`);
        results.whatsapp = await sendWhatsApp(uazapiToken, phone, body.message);
      }
      if (email) {
        results.email = await sendEmail(email, body.subject || "Notificação Froiv", body.message);
      }

      return new Response(JSON.stringify({ success: true, ...results }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.transaction_id) {
      const { data: tx, error: txErr } = await admin
        .from("transactions")
        .select("*, listings(title, category, price, prefilled_credentials)")
        .eq("id", body.transaction_id)
        .single();

      if (txErr || !tx) {
        return new Response(JSON.stringify({ error: "Transaction not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const [{ data: buyerProfile }, { data: sellerProfile }] = await Promise.all([
        admin.from("profiles").select("name, username, whatsapp, phone, email").eq("user_id", tx.buyer_id).single(),
        admin.from("profiles").select("name, username, whatsapp, phone, email").eq("user_id", tx.seller_id).single(),
      ]);

      const buyerName = buyerProfile?.name || buyerProfile?.username || "Comprador";
      const sellerName = sellerProfile?.name || sellerProfile?.username || "Vendedor";
      const listing = tx.listings as any;
      const amount = Number(tx.amount);
      const amountStr = `R$ ${amount.toFixed(2).replace(".", ",")}`;
      const net = Number(tx.seller_receives);
      const netStr = `R$ ${net.toFixed(2).replace(".", ",")}`;
      const txLink = `${SITE_URL}/compras/${body.transaction_id}`;

      const { data: creds } = await admin
        .from("credentials")
        .select("data_encrypted")
        .eq("transaction_id", body.transaction_id)
        .maybeSingle();

      const hasCredentials = !!creds?.data_encrypted;
      let credentialsText = "";

      if (hasCredentials) {
        try {
          const parsed = JSON.parse(creds.data_encrypted);
          const parts: string[] = [];
          if (parsed.email) parts.push(`📧 Email: ${parsed.email}`);
          if (parsed.login || parsed.username) parts.push(`👤 Login: ${parsed.login || parsed.username}`);
          if (parsed.password || parsed.senha) parts.push(`🔑 Senha: ${parsed.password || parsed.senha}`);
          if (parsed.twofa || parsed["2fa"]) parts.push(`🛡️ 2FA: ${parsed.twofa || parsed["2fa"]}`);
          if (parsed.notes || parsed.observacoes) parts.push(`📝 Obs: ${parsed.notes || parsed.observacoes}`);
          if (parts.length > 0) credentialsText = parts.join("\n");
        } catch {
          credentialsText = creds.data_encrypted;
        }
      }

      const sellerPhone = normalizeBrazilianPhone(body.seller_phone || sellerProfile?.whatsapp || sellerProfile?.phone);
      const sellerEmail = normalizeEmail(body.seller_email || sellerProfile?.email);
      const sellerWhatsMsg = hasCredentials
        ? `🎉 *Venda realizada na Froiv!*\n\n📦 *${listing?.title || "Conta"}*\n💰 Você recebe: ${netStr}\n👤 Comprador: ${buyerName}\n\n✅ Credenciais entregues automaticamente.\n💰 Valor ficará em custódia por 24h.\n\n🔗 ${txLink}`
        : `🎉 *Nova venda na Froiv!*\n\n📦 *${listing?.title || "Conta"}*\n💰 Você recebe: ${netStr}\n👤 Comprador: ${buyerName}\n\n⚡ Envie as credenciais pelo chat AGORA.\n🔗 ${txLink}`;

      if (sellerPhone && uazapiToken) {
        results.whatsapp = await sendWhatsApp(uazapiToken, sellerPhone, sellerWhatsMsg);
      }
      if (sellerEmail) {
        results.email = await sendEmail(
          sellerEmail,
          hasCredentials ? `💰 Venda realizada — ${listing?.title}` : `🔑 Envie as credenciais — ${listing?.title}`,
          hasCredentials
            ? `Você vendeu "${listing?.title}" por ${amountStr}!\n\nVocê receberá: ${netStr}\nComprador: ${buyerName}\n\nCredenciais entregues automaticamente. O valor ficará em custódia por 24h.\n\n${txLink}`
            : `Você vendeu "${listing?.title}" por ${amountStr}!\n\nVocê receberá: ${netStr}\nComprador: ${buyerName}\n\n⚠️ Acesse o chat e envie as credenciais agora!\n\n${txLink}`,
        );
      }

      const buyerPhone = normalizeBrazilianPhone(body.buyer_phone || buyerProfile?.whatsapp || buyerProfile?.phone);
      const buyerEmail = normalizeEmail(body.buyer_email || buyerProfile?.email);

      if (hasCredentials && credentialsText) {
        const buyerWhatsMsg = `✅ *Froiv — Dados de Acesso*\n\nOlá ${buyerName}!\n\nSua compra de *${listing?.title}* foi confirmada.\n\n🔑 *Credenciais:*\n${credentialsText}\n\n⚠️ Troque a senha após o primeiro acesso.\n📦 Verifique a conta em até 24h.\n\n🔗 ${txLink}`;

        if (buyerPhone && uazapiToken) {
          results.buyer_whatsapp = await sendWhatsApp(uazapiToken, buyerPhone, buyerWhatsMsg);
        }
        if (!body.skip_buyer_email && buyerEmail) {
          results.buyer_email = await sendEmail(
            buyerEmail,
            `🔑 Credenciais de acesso — ${listing?.title}`,
            `Olá ${buyerName}!\n\nSua compra de "${listing?.title}" foi confirmada. Aqui estão seus dados:\n\n${credentialsText}\n\n⚠️ Troque a senha imediatamente após o primeiro acesso.\n📦 Verifique a conta em até 24h antes do pagamento ser liberado.\n\n${txLink}`,
          );
        }
      } else {
        const buyerWhatsMsg = `✅ *Froiv — Pagamento Confirmado*\n\nOlá ${buyerName}!\n\nSeu pagamento de ${amountStr} para *${listing?.title}* foi confirmado.\n\n💬 O vendedor ${sellerName} foi notificado e enviará os dados de acesso pelo chat.\n\n🔗 ${txLink}`;

        if (buyerPhone && uazapiToken) {
          results.buyer_whatsapp = await sendWhatsApp(uazapiToken, buyerPhone, buyerWhatsMsg);
        }
        if (!body.skip_buyer_email && buyerEmail) {
          results.buyer_email = await sendEmail(
            buyerEmail,
            `✅ Pagamento confirmado — ${listing?.title}`,
            `Olá ${buyerName}!\n\nSeu pagamento de ${amountStr} para "${listing?.title}" foi confirmado.\n\n💬 O vendedor foi notificado e enviará os dados de acesso pelo chat em breve.\n\n🔒 Escrow Froiv protege seu pagamento.\n\n${txLink}`,
          );
        }
      }

      console.log(`Notifications sent for tx ${body.transaction_id}:`, JSON.stringify(results));

      return new Response(JSON.stringify({ success: true, ...results }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Provide notification_id, user_id+message, or transaction_id" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("notify-whatsapp error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});