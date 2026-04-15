import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DB_URL = "https://yzwncktlibdfycqhvlqg.supabase.co";

function getSupabase() {
  const key = Deno.env.get("PERSONAL_SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!key) throw new Error("PERSONAL_SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(DB_URL, key);
}

function getEdgeFunctionsBase() {
  const cloudUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const cloudKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  return {
    url: cloudUrl || DB_URL,
    key: cloudKey || Deno.env.get("PERSONAL_SUPABASE_SERVICE_ROLE_KEY")!.trim(),
  };
}

async function callEdgeFunction(name: string, body: Record<string, unknown>) {
  const { url, key } = getEdgeFunctionsBase();
  try {
    const response = await fetch(`${url}/functions/v1/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    if (!response.ok) {
      console.error(`Edge function ${name} failed with ${response.status}: ${responseText}`);
    }

    return {
      ok: response.ok,
      status: response.status,
      body: responseText,
    };
  } catch (e) {
    console.error(`Edge function ${name} failed:`, e);
    return {
      ok: false,
      status: 0,
      body: e instanceof Error ? e.message : String(e),
    };
  }
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

function buildCredentialsText(rawCredentials?: string | null) {
  if (!rawCredentials) return "";

  try {
    const parsed = JSON.parse(rawCredentials);
    const parts: string[] = [];
    if (parsed.email) parts.push(`Email: ${parsed.email}`);
    if (parsed.login || parsed.username) parts.push(`Login: ${parsed.login || parsed.username}`);
    if (parsed.password || parsed.senha) parts.push(`Senha: ${parsed.password || parsed.senha}`);
    if (parsed.twofa || parsed["2fa"]) parts.push(`2FA: ${parsed.twofa || parsed["2fa"]}`);
    if (parsed.notes || parsed.observacoes) parts.push(`Obs: ${parsed.notes || parsed.observacoes}`);
    return parts.join("\n");
  } catch {
    return rawCredentials;
  }
}

async function deliverPrefilledCredentials(
  supabase: ReturnType<typeof createClient>,
  transactionId: string,
  tx: Record<string, unknown>,
  listingTitle: string,
  buyerName: string,
) {
  const { data: listing } = await supabase
    .from("listings")
    .select("prefilled_credentials")
    .eq("id", tx.listing_id)
    .maybeSingle();

  if (!listing?.prefilled_credentials) return false;

  await supabase.from("credentials").insert({
    transaction_id: transactionId,
    data_encrypted: listing.prefilled_credentials,
    delivered_at: new Date().toISOString(),
  });

  await supabase
    .from("transactions")
    .update({ status: "credentials_sent", updated_at: new Date().toISOString() })
    .eq("id", transactionId);

  await supabase.from("transaction_messages").insert({
    transaction_id: transactionId,
    sender_id: tx.seller_id as string,
    is_system: true,
    allow_sensitive_data: true,
    message: `🔑 Credenciais entregues automaticamente!\n\nAs credenciais de acesso de "${listingTitle}" foram enviadas. Verifique os dados de acesso na aba da transação.\n\n⚠️ Troque a senha imediatamente após o primeiro acesso.\n🔒 Você tem 24h para verificar antes do pagamento ser liberado ao vendedor.`,
  });

  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = getSupabase();

    const MP_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")?.trim();
    if (!MP_TOKEN) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    if (body.type !== "payment" && body.action !== "payment.updated" && body.action !== "payment.created") {
      return new Response("ok", { status: 200, headers: corsHeaders });
    }

    const paymentId = body.data?.id;
    if (!paymentId) return new Response("ok", { status: 200, headers: corsHeaders });

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_TOKEN}` },
    });
    const payment = await mpRes.json();
    if (!mpRes.ok) {
      console.error("MP fetch failed:", JSON.stringify(payment));
      return new Response("error", { status: 500, headers: corsHeaders });
    }

    const transactionId = payment.external_reference;
    if (!transactionId) return new Response("ok", { status: 200, headers: corsHeaders });

    console.log(`Payment ${paymentId} status=${payment.status} tx=${transactionId}`);

    if (payment.status === "approved") {
      const { data: updated, error: updErr } = await supabase
        .from("transactions")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", transactionId)
        .eq("status", "pending_payment")
        .select("*")
        .maybeSingle();

      if (updErr) {
        console.error("Update failed:", updErr);
        return new Response("error", { status: 500, headers: corsHeaders });
      }

      if (!updated) {
        console.log("Already processed or not found");
        return new Response("ok", { status: 200, headers: corsHeaders });
      }

      const tx = updated;
      const sellerReceives = Number(tx.seller_receives);

      const { error: walletErr } = await supabase.rpc("increment_wallet", {
        user_uuid: tx.seller_id,
        field: "pending",
        amount: sellerReceives,
      });
      if (walletErr) console.error("Wallet error:", walletErr);

      const [{ data: listing }, { data: buyer }, { data: seller }] = await Promise.all([
        supabase.from("listings").select("title, category, prefilled_credentials").eq("id", tx.listing_id).maybeSingle(),
        supabase.from("profiles").select("email, name, phone, whatsapp").eq("user_id", tx.buyer_id).maybeSingle(),
        supabase.from("profiles").select("email, name, phone, whatsapp").eq("user_id", tx.seller_id).maybeSingle(),
      ]);

      const listingTitle = listing?.title || "Conta Digital";
      const buyerName = buyer?.name || "Comprador";
      const amount = Number(tx.amount);
      const amountFmt = `R$ ${amount.toFixed(2).replace(".", ",")}`;
      const buyerEmail = normalizeEmail(buyer?.email) || normalizeEmail(payment?.payer?.email);
      const sellerEmail = normalizeEmail(seller?.email);
      const buyerPhone = normalizeBrazilianPhone(buyer?.whatsapp || buyer?.phone);
      const credentialsText = buildCredentialsText(listing?.prefilled_credentials);

      if (buyerEmail && buyer?.email !== buyerEmail) {
        const { error: syncBuyerEmailError } = await supabase
          .from("profiles")
          .update({ email: buyerEmail })
          .eq("user_id", tx.buyer_id);
        if (syncBuyerEmailError) {
          console.error("Failed to sync buyer email:", syncBuyerEmailError);
        }
      }

      const autoDelivered = await deliverPrefilledCredentials(supabase, transactionId, tx, listingTitle, buyerName);

      if (!autoDelivered) {
        await supabase
          .from("transactions")
          .update({ status: "transfer_in_progress", updated_at: new Date().toISOString() })
          .eq("id", transactionId);

        await supabase.from("transaction_messages").insert({
          transaction_id: transactionId,
          sender_id: tx.seller_id,
          is_system: true,
          allow_sensitive_data: true,
          message: `✅ Pagamento confirmado! Olá, ${buyerName}.\n\nSeu pagamento de ${amountFmt} foi processado com sucesso.\n\nAguarde enquanto o vendedor envia as credenciais de acesso.\n\n🔒 Este chat é protegido pelo Escrow Froiv.`,
        });
      }

      await supabase.from("notifications").insert([
        {
          user_id: tx.buyer_id,
          title: autoDelivered ? "🔑 Credenciais recebidas!" : "💬 Chat aberto com o vendedor",
          body: autoDelivered
            ? `Suas credenciais de "${listingTitle}" foram entregues automaticamente.`
            : "Aguarde as credenciais de acesso no chat.",
          link: `/compras/${transactionId}`,
        },
        {
          user_id: tx.seller_id,
          title: autoDelivered ? "💰 Venda realizada!" : "🔑 Envie as credenciais!",
          body: autoDelivered
            ? `${buyerName} comprou "${listingTitle}". Credenciais entregues automaticamente.`
            : `${buyerName} comprou "${listingTitle}". Envie os dados de acesso pelo chat.`,
          link: `/compras/${transactionId}`,
        },
      ]);

      if (buyerEmail) {
        const buyerEmailResult = await callEdgeFunction("send-email", {
          type: autoDelivered ? "credentials_delivered" : "purchase_confirmed",
          to: buyerEmail,
          data: {
            amount,
            title: listingTitle,
            transaction_id: transactionId,
            credentials_text: autoDelivered ? credentialsText : undefined,
          },
        });
        if (!buyerEmailResult.ok) {
          console.error("Buyer email failed:", buyerEmailResult);
        }
      } else {
        console.error(`Buyer email missing for transaction ${transactionId}`);
      }

      if (!autoDelivered && sellerEmail) {
        const sellerEmailResult = await callEdgeFunction("send-email", {
          type: "credentials_needed",
          to: sellerEmail,
          data: {
            amount,
            fee: Number(tx.platform_fee),
            net: sellerReceives,
            title: listingTitle,
            transaction_id: transactionId,
            buyer_name: buyerName,
          },
        });
        if (!sellerEmailResult.ok) {
          console.error("Seller email failed:", sellerEmailResult);
        }
      }

      const notifyResult = await callEdgeFunction("notify-whatsapp", {
        transaction_id: transactionId,
        type: "payment_confirmed",
        buyer_phone: buyerPhone,
        buyer_email: buyerEmail,
        skip_buyer_email: true,
      });
      if (!notifyResult.ok) {
        console.error("Notify WhatsApp failed:", notifyResult);
      }

      console.log(`Transaction ${transactionId} processed successfully. Auto-delivered: ${autoDelivered}`);
    } else if (payment.status === "cancelled" || payment.status === "rejected") {
      await supabase
        .from("transactions")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", transactionId)
        .eq("status", "pending_payment");
      console.log(`Transaction ${transactionId} cancelled`);
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("error", { status: 500, headers: corsHeaders });
  }
});