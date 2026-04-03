import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";

Deno.serve(async (req) => {
  // Webhook doesn't need CORS - it's server-to-server
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");
    }

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    // Mercado Pago sends different notification types
    if (body.type === "payment" || body.action === "payment.updated" || body.action === "payment.created") {
      const paymentId = body.data?.id;
      if (!paymentId) {
        console.log("No payment ID in webhook");
        return new Response("ok", { status: 200 });
      }

      // Fetch payment details from Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
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
        // Update transaction to paid
        const { error: updateError } = await supabase
          .from("transactions")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
          })
          .eq("id", transactionId)
          .eq("status", "pending_payment");

        if (updateError) {
          console.error("Failed to update transaction:", updateError);
        } else {
          console.log(`Transaction ${transactionId} marked as paid`);

          // Create notification for seller
          const { data: tx } = await supabase
            .from("transactions")
            .select("seller_id, listing_id")
            .eq("id", transactionId)
            .single();

          if (tx) {
            await supabase.from("notifications").insert({
              user_id: tx.seller_id,
              title: "Pagamento recebido!",
              body: "Um comprador efetuou o pagamento. Envie as credenciais da conta.",
              link: `/transaction/${tx.listing_id}`,
            });
          }
        }
      } else if (payment.status === "cancelled" || payment.status === "rejected") {
        await supabase
          .from("transactions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("id", transactionId)
          .eq("status", "pending_payment");

        console.log(`Transaction ${transactionId} cancelled due to payment ${payment.status}`);
      }
    }

    return new Response("ok", { status: 200 });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("error", { status: 500 });
  }
});
