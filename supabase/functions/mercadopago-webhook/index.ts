import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PRODUCTION_SUPABASE_URL = Deno.env.get("PERSONAL_SUPABASE_URL")?.trim() || "https://yzwncktlibdfycqhvlqg.supabase.co";

type SupabaseClientEntry = {
  label: string;
  client: ReturnType<typeof createClient>;
};

async function sendEmailNotification(supabaseUrl: string, supabaseKey: string, type: string, to: string, data: Record<string, any>) {
  try {
    await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ type, to, data }),
    });
  } catch (e) {
    console.error("Failed to send email notification:", e);
  }
}

async function sendWhatsAppNotification(supabaseUrl: string, supabaseKey: string, transactionId: string, type: string) {
  try {
    await fetch(`${supabaseUrl}/functions/v1/notify-whatsapp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ transaction_id: transactionId, type }),
    });
  } catch (e) {
    console.error("Failed to send WhatsApp notification:", e);
  }
}

function createSupabaseClient() {
  const personalKey = Deno.env.get("PERSONAL_SUPABASE_SERVICE_ROLE_KEY")?.trim();
  const cloudUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const cloudKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

  const clients: SupabaseClientEntry[] = [];

  if (personalKey) {
    clients.push({ label: "production", client: createClient(PRODUCTION_SUPABASE_URL, personalKey) });
  }

  if (cloudUrl && cloudKey) {
    clients.push({ label: "cloud", client: createClient(cloudUrl, cloudKey) });
  }

  if (!clients.length) {
    throw new Error("No Supabase service role credentials configured");
  }

  return {
    clients,
    cloudUrl: cloudUrl || PRODUCTION_SUPABASE_URL,
    cloudKey: cloudKey || personalKey!,
  };
}

async function findTransaction(clients: SupabaseClientEntry[], transactionId: string) {
  for (const { label, client } of clients) {
    try {
      const { data: tx, error } = await client
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .eq("status", "pending_payment")
        .maybeSingle();

      if (!error && tx) {
        console.log(`Transaction found via ${label} client`);
        return { tx, client, label };
      }
      if (error) {
        console.log(`${label} client error: ${error.message}`);
      }
    } catch (e) {
      console.log(`${label} client exception: ${e}`);
    }
  }
  return null;
}

async function finalizeApprovedTransaction(
  supabase: ReturnType<typeof createClient>,
  transactionId: string,
  tx: Record<string, any>,
  cloudUrl: string,
  cloudKey: string,
) {
  const { data: updatedRows, error: updateError } = await supabase
    .from("transactions")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", transactionId)
    .eq("status", "pending_payment")
    .select("id");

  if (updateError) {
    console.error("Failed to update transaction:", updateError);
    return new Response("error", { status: 500, headers: corsHeaders });
  }

  if (!updatedRows?.length) {
    console.log(`Transaction ${transactionId} already processed`);
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  console.log(`Transaction ${transactionId} marked as paid`);

  const sellerReceives = Number(tx.seller_receives);
  const { error: walletError } = await supabase.rpc("increment_wallet", {
    user_uuid: tx.seller_id,
    field: "pending",
    amount: sellerReceives,
  });

  if (walletError) {
    console.error("Failed to increment seller wallet:", walletError);
    return new Response("error", { status: 500, headers: corsHeaders });
  }

  console.log(`Seller ${tx.seller_id} pending +${sellerReceives} (atomic)`);

  const [{ data: listing }, { data: buyerProfile }, { data: sellerProfile }] = await Promise.all([
    supabase.from("listings").select("title, category").eq("id", tx.listing_id).maybeSingle(),
    supabase.from("profiles").select("email, name").eq("user_id", tx.buyer_id).maybeSingle(),
    supabase.from("profiles").select("email, name").eq("user_id", tx.seller_id).maybeSingle(),
  ]);

  const amount = Number(tx.amount);
  const amountFormatted = `R$ ${amount.toFixed(2).replace(".", ",")}`;
  const buyerName = buyerProfile?.name || "Comprador";
  const listingTitle = listing?.title || "Conta Digital";

  const criticalUpdate = await supabase
    .from("transactions")
    .update({
      status: "transfer_in_progress",
      updated_at: new Date().toISOString(),
    })
    .eq("id", transactionId);

  if (criticalUpdate.error) {
    console.error("Failed to move transaction to transfer_in_progress:", criticalUpdate.error);
    return new Response("error", { status: 500, headers: corsHeaders });
  }

  try {
    await supabase.from("transaction_messages").insert({
      transaction_id: transactionId,
      sender_id: tx.seller_id,
      is_system: true,
      allow_sensitive_data: true,
      message: `✅ Pagamento confirmado! Olá, ${buyerName}.\n\nSeu pagamento de ${amountFormatted} foi processado com sucesso.\n\nAguarde enquanto o vendedor envia as credenciais de acesso da conta.\n\n🔒 Este chat é protegido pelo Escrow Froiv.`,
    });

    await supabase.from("notifications").insert([
      {
        user_id: tx.buyer_id,
        title: "💬 Chat aberto com o vendedor",
        body: "Seu chat com o vendedor foi aberto. Aguarde as credenciais de acesso.",
        link: `/compras/${transactionId}`,
      },
      {
        user_id: tx.seller_id,
        title: "🔑 Envie as credenciais pelo chat!",
        body: `${buyerName} comprou "${listingTitle}". Acesse o chat e envie os dados de acesso agora.`,
        link: `/compras/${transactionId}`,
      },
    ]);

    if (buyerProfile?.email) {
      await sendEmailNotification(cloudUrl, cloudKey, "purchase_confirmed", buyerProfile.email, {
        amount,
        title: listingTitle,
        transaction_id: transactionId,
      });
    }

    if (sellerProfile?.email) {
      await sendEmailNotification(cloudUrl, cloudKey, "credentials_needed", sellerProfile.email, {
        amount,
        fee: Number(tx.platform_fee),
        net: sellerReceives,
        title: listingTitle,
        transaction_id: transactionId,
        buyer_name: buyerName,
      });
    }

    await sendWhatsAppNotification(cloudUrl, cloudKey, transactionId, "payment_confirmed");
  } catch (notificationError) {
    console.error("Post-payment notifications failed:", notificationError);
  }

  return new Response("ok", { status: 200, headers: corsHeaders });
}

async function cancelPendingTransaction(clients: SupabaseClientEntry[], transactionId: string) {
  for (const { client } of clients) {
    await client
      .from("transactions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", transactionId)
      .eq("status", "pending_payment");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const { clients, cloudUrl, cloudKey } = createSupabaseClient();

    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")?.trim();
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");
    }

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    if (body.type === "payment" || body.action === "payment.updated" || body.action === "payment.created") {
      const paymentId = body.data?.id;
      if (!paymentId) {
        console.log("No payment ID in webhook");
        return new Response("ok", { status: 200 });
      }

      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}` },
      });

      const payment = await mpResponse.json();
      if (!mpResponse.ok) {
        console.error("Failed to fetch payment:", JSON.stringify(payment));
        return new Response("error", { status: 500 });
      }

      const transactionId = payment.external_reference;
      if (!transactionId) {
        console.log("No external_reference in payment");
        return new Response("ok", { status: 200 });
      }

      console.log(`Payment ${paymentId} status: ${payment.status} for transaction: ${transactionId}`);

      if (payment.status === "approved") {
        const result = await findTransaction(clients, transactionId);

        if (!result) {
          console.log("Transaction not found in pending state; webhook already processed or transaction is in another status");
          return new Response("ok", { status: 200, headers: corsHeaders });
        }

        const { tx, client: supabase } = result;
        return await finalizeApprovedTransaction(supabase, transactionId, tx, cloudUrl, cloudKey);
      } else if (payment.status === "cancelled" || payment.status === "rejected") {
        await cancelPendingTransaction(clients, transactionId);
        console.log(`Transaction ${transactionId} cancelled due to payment ${payment.status}`);
      }
    }

    return new Response("ok", { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("error", { status: 500, headers: corsHeaders });
  }
});
