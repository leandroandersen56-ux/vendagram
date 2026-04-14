import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";

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
  // Try personal instance first, fall back to Cloud
  const personalUrl = Deno.env.get("PERSONAL_SUPABASE_URL");
  const personalKey = Deno.env.get("PERSONAL_SUPABASE_SERVICE_ROLE_KEY");
  const cloudUrl = Deno.env.get("SUPABASE_URL")!;
  const cloudKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const clients = [];

  if (personalUrl && personalKey) {
    clients.push({ label: "personal", client: createClient(personalUrl, personalKey) });
  }
  clients.push({ label: "cloud", client: createClient(cloudUrl, cloudKey) });

  return { clients, cloudUrl, cloudKey };
}

async function findTransaction(clients: Array<{label: string; client: any}>, transactionId: string) {
  for (const { label, client } of clients) {
    try {
      const { data: tx, error } = await client
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .eq("status", "pending_payment")
        .single();

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
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
          console.log("Transaction not found or already processed in any client");
          return new Response("ok", { status: 200 });
        }

        const { tx, client: supabase } = result;

        const { error: updateError } = await supabase
          .from("transactions")
          .update({ status: "paid", paid_at: new Date().toISOString() })
          .eq("id", transactionId)
          .eq("status", "pending_payment");

        if (updateError) {
          console.error("Failed to update transaction:", updateError);
          return new Response("error", { status: 500 });
        }

        console.log(`Transaction ${transactionId} marked as paid`);

        const sellerReceives = Number(tx.seller_receives);

        await supabase.rpc("increment_wallet", {
          user_uuid: tx.seller_id,
          field: "pending",
          amount: sellerReceives,
        });
        console.log(`Seller ${tx.seller_id} pending +${sellerReceives} (atomic)`);

        const { data: listing } = await supabase
          .from("listings")
          .select("title, category")
          .eq("id", tx.listing_id)
          .single();

        const { data: buyerProfile } = await supabase
          .from("profiles")
          .select("email, name")
          .eq("user_id", tx.buyer_id)
          .single();

        const { data: sellerProfile } = await supabase
          .from("profiles")
          .select("email, name")
          .eq("user_id", tx.seller_id)
          .single();

        const amount = Number(tx.amount);
        const amountFormatted = `R$ ${amount.toFixed(2).replace(".", ",")}`;
        const buyerName = buyerProfile?.name || "Comprador";
        const listingTitle = listing?.title || "Conta Digital";

        // Insert system message to open the chat
        await supabase.from("transaction_messages").insert({
          transaction_id: transactionId,
          sender_id: tx.seller_id,
          is_system: true,
          allow_sensitive_data: true,
          message: `✅ Pagamento confirmado! Olá, ${buyerName}.\n\nSeu pagamento de ${amountFormatted} foi processado com sucesso.\n\nAguarde enquanto o vendedor envia as credenciais de acesso da conta.\n\n🔒 Este chat é protegido pelo Escrow Froiv.`,
        });

        // Update transaction to transfer_in_progress
        await supabase.from("transactions").update({
          status: "transfer_in_progress",
          updated_at: new Date().toISOString(),
        }).eq("id", transactionId);

        // Notifications
        await supabase.from("notifications").insert({
          user_id: tx.buyer_id,
          title: "💬 Chat aberto com o vendedor",
          body: "Seu chat com o vendedor foi aberto. Aguarde as credenciais de acesso.",
          link: `/compras/${transactionId}`,
        });

        await supabase.from("notifications").insert({
          user_id: tx.seller_id,
          title: "🔑 Envie as credenciais pelo chat!",
          body: `${buyerName} comprou "${listingTitle}". Acesse o chat e envie os dados de acesso agora.`,
          link: `/compras/${transactionId}`,
        });

        // Emails via Cloud edge function
        if (buyerProfile?.email) {
          await sendEmailNotification(cloudUrl, cloudKey, "purchase_confirmed", buyerProfile.email, {
            amount, title: listingTitle, transaction_id: transactionId,
          });
        }
        if (sellerProfile?.email) {
          await sendEmailNotification(cloudUrl, cloudKey, "credentials_needed", sellerProfile.email, {
            amount, fee: Number(tx.platform_fee), net: sellerReceives,
            title: listingTitle, transaction_id: transactionId,
            buyer_name: buyerName,
          });
        }

        // WhatsApp notification to seller
        await sendWhatsAppNotification(cloudUrl, cloudKey, transactionId, "payment_confirmed");
      } else if (payment.status === "cancelled" || payment.status === "rejected") {
        // Cancel the transaction in any available client
        for (const { client } of clients) {
          await client
            .from("transactions")
            .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
            .eq("id", transactionId)
            .eq("status", "pending_payment");
        }
        console.log(`Transaction ${transactionId} cancelled due to payment ${payment.status}`);
      }
    }

    return new Response("ok", { status: 200 });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("error", { status: 500 });
  }
});
