import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// DB lives on personal instance — ALWAYS
const DB_URL = "https://yzwncktlibdfycqhvlqg.supabase.co";
const UAZAPI_BASE_URL = "https://ipazua.uazapi.com";
const UAZAPI_INSTANCE_ID = "c433e432-781e-4f03-a8fc-d9e3cb1c6f4a";
const RESEND_API_KEY_NAME = "RESEND_API_KEY";
const FROM_EMAIL = "Froiv <onboarding@resend.dev>";
const SITE_URL = "https://froiv.com";

function getAdmin() {
  const key = Deno.env.get("PERSONAL_SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!key) throw new Error("PERSONAL_SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(DB_URL, key);
}

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
    console.log(`WhatsApp to ${phone}: ${res.status}`);
    return res.ok;
  } catch (e) {
    console.error("WhatsApp send error:", e);
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
        "Authorization": `Bearer ${resendKey}`,
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
    const admin = getAdmin();
    const body = await req.json();
    const results = { whatsapp: false, email: false, buyer_whatsapp: false, buyer_email: false };

    // ── Mode 1: notification_id (triggered by DB trigger on notification insert) ──
    if (body.notification_id) {
      const { data: notif, error: nErr } = await admin
        .from("notifications")
        .select("*")
        .eq("id", body.notification_id)
        .single();

      if (nErr || !notif) {
        console.error("Notification not found:", nErr);
        return new Response(JSON.stringify({ error: "Notification not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: profile } = await admin
        .from("profiles")
        .select("whatsapp, phone, email, name")
        .eq("user_id", notif.user_id)
        .single();

      const phone = profile?.whatsapp || profile?.phone;
      const email = profile?.email;
      const link = notif.link ? `${SITE_URL}${notif.link}` : SITE_URL;
      const whatsappMsg = `📢 *Froiv*\n\n*${notif.title}*\n${notif.body}\n\n🔗 ${link}`;
      const emailSubject = notif.title.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "").trim();

      if (phone && uazapiToken) {
        const cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length >= 10) {
          results.whatsapp = await sendWhatsApp(uazapiToken, cleanPhone, whatsappMsg);
        }
      }
      if (email) {
        results.email = await sendEmail(email, emailSubject || "Notificação Froiv", `${notif.title}\n\n${notif.body}\n\nAcesse: ${link}`);
      }

      return new Response(JSON.stringify({ success: true, ...results }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Mode 2: user_id + message (direct call) ──
    if (body.user_id && body.message) {
      const { data: profile } = await admin
        .from("profiles")
        .select("whatsapp, phone, email")
        .eq("user_id", body.user_id)
        .single();

      const phone = profile?.whatsapp || profile?.phone;
      if (phone && uazapiToken) {
        const cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length >= 10) {
          results.whatsapp = await sendWhatsApp(uazapiToken, cleanPhone, body.message);
        }
      }
      if (profile?.email) {
        results.email = await sendEmail(profile.email, body.subject || "Notificação Froiv", body.message);
      }

      return new Response(JSON.stringify({ success: true, ...results }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Mode 3: transaction_id + type (payment_confirmed — notify BOTH buyer and seller) ──
    if (body.transaction_id) {
      const { data: tx, error: txErr } = await admin
        .from("transactions")
        .select("*, listings(title, category, price, prefilled_credentials)")
        .eq("id", body.transaction_id)
        .single();

      if (txErr || !tx) {
        return new Response(JSON.stringify({ error: "Transaction not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
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

      // Check if credentials were auto-delivered
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

      // ── SELLER notification ──
      const sellerPhone = sellerProfile?.whatsapp || sellerProfile?.phone;
      const sellerWhatsMsg = hasCredentials
        ? `🎉 *Venda realizada na Froiv!*\n\n📦 *${listing?.title || "Conta"}*\n💰 Você recebe: ${netStr}\n👤 Comprador: ${buyerName}\n\n✅ Credenciais entregues automaticamente.\n💰 Valor ficará em custódia por 24h.\n\n🔗 ${txLink}`
        : `🎉 *Nova venda na Froiv!*\n\n📦 *${listing?.title || "Conta"}*\n💰 Você recebe: ${netStr}\n👤 Comprador: ${buyerName}\n\n⚡ Envie as credenciais pelo chat AGORA.\n🔗 ${txLink}`;

      if (sellerPhone && uazapiToken) {
        const clean = sellerPhone.replace(/\D/g, "");
        if (clean.length >= 10) results.whatsapp = await sendWhatsApp(uazapiToken, clean, sellerWhatsMsg);
      }
      if (sellerProfile?.email) {
        results.email = await sendEmail(
          sellerProfile.email,
          hasCredentials ? `💰 Venda realizada — ${listing?.title}` : `🔑 Envie as credenciais — ${listing?.title}`,
          hasCredentials
            ? `Você vendeu "${listing?.title}" por ${amountStr}!\n\nVocê receberá: ${netStr}\nComprador: ${buyerName}\n\nCredenciais entregues automaticamente. O valor ficará em custódia por 24h.\n\n${txLink}`
            : `Você vendeu "${listing?.title}" por ${amountStr}!\n\nVocê receberá: ${netStr}\nComprador: ${buyerName}\n\n⚠️ Acesse o chat e envie as credenciais agora!\n\n${txLink}`,
        );
      }

      // ── BUYER notification ──
      const buyerPhone = buyerProfile?.whatsapp || buyerProfile?.phone;

      if (hasCredentials && credentialsText) {
        // Send credentials to buyer via WhatsApp and Email
        const buyerWhatsMsg = `✅ *Froiv — Dados de Acesso*\n\nOlá ${buyerName}!\n\nSua compra de *${listing?.title}* foi confirmada.\n\n🔑 *Credenciais:*\n${credentialsText}\n\n⚠️ Troque a senha após o primeiro acesso.\n📦 Verifique a conta em até 24h.\n\n🔗 ${txLink}`;

        if (buyerPhone && uazapiToken) {
          const clean = buyerPhone.replace(/\D/g, "");
          if (clean.length >= 10) results.buyer_whatsapp = await sendWhatsApp(uazapiToken, clean, buyerWhatsMsg);
        }
        if (buyerProfile?.email) {
          results.buyer_email = await sendEmail(
            buyerProfile.email,
            `🔑 Credenciais de acesso — ${listing?.title}`,
            `Olá ${buyerName}!\n\nSua compra de "${listing?.title}" foi confirmada. Aqui estão seus dados:\n\n${credentialsText}\n\n⚠️ Troque a senha imediatamente após o primeiro acesso.\n📦 Verifique a conta em até 24h antes do pagamento ser liberado.\n\n${txLink}`,
          );
        }
      } else {
        // No credentials yet — just notify buyer that chat is open
        const buyerWhatsMsg = `✅ *Froiv — Pagamento Confirmado*\n\nOlá ${buyerName}!\n\nSeu pagamento de ${amountStr} para *${listing?.title}* foi confirmado.\n\n💬 O vendedor ${sellerName} foi notificado e enviará os dados de acesso pelo chat.\n\n🔗 ${txLink}`;

        if (buyerPhone && uazapiToken) {
          const clean = buyerPhone.replace(/\D/g, "");
          if (clean.length >= 10) results.buyer_whatsapp = await sendWhatsApp(uazapiToken, clean, buyerWhatsMsg);
        }
        if (buyerProfile?.email) {
          results.buyer_email = await sendEmail(
            buyerProfile.email,
            `✅ Pagamento confirmado — ${listing?.title}`,
            `Olá ${buyerName}!\n\nSeu pagamento de ${amountStr} para "${listing?.title}" foi confirmado.\n\n💬 O vendedor foi notificado e enviará os dados de acesso pelo chat em breve.\n\n🔒 Escrow Froiv protege seu pagamento.\n\n${txLink}`,
          );
        }
      }

      console.log(`Notifications sent for tx ${body.transaction_id}:`, JSON.stringify(results));

      return new Response(JSON.stringify({ success: true, ...results }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Provide notification_id, user_id+message, or transaction_id" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("notify-whatsapp error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
