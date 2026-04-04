
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = claimsData.claims.sub as string;

    // Parse body
    const { transaction_id } = await req.json();
    if (!transaction_id) {
      return new Response(
        JSON.stringify({ error: "transaction_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Admin client for DB operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get transaction
    const { data: tx, error: txError } = await adminClient
      .from("transactions")
      .select("*")
      .eq("id", transaction_id)
      .single();

    if (txError || !tx) {
      return new Response(
        JSON.stringify({ error: "Transaction not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only buyer can release
    if (tx.buyer_id !== userId) {
      return new Response(
        JSON.stringify({ error: "Only the buyer can release escrow" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Must be in correct status (paid or transfer_in_progress)
    if (!["paid", "transfer_in_progress"].includes(tx.status)) {
      return new Response(
        JSON.stringify({ error: `Cannot release escrow from status: ${tx.status}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate fee (10%) and net amount
    const amount = Number(tx.amount);
    const fee = Math.round(amount * 0.10 * 100) / 100;
    const net = Math.round((amount - fee) * 100) / 100;

    // Get seller wallet
    const { data: wallet, error: walletError } = await adminClient
      .from("wallets")
      .select("*")
      .eq("user_id", tx.seller_id)
      .single();

    if (walletError || !wallet) {
      return new Response(
        JSON.stringify({ error: "Seller wallet not found" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update wallet: add net to balance, subtract amount from pending
    const newBalance = Number(wallet.balance) + net;
    const newPending = Math.max(0, Number(wallet.pending) - amount);
    const newTotalEarned = Number(wallet.total_earned) + net;

    const { error: walletUpdateError } = await adminClient
      .from("wallets")
      .update({
        balance: newBalance,
        pending: newPending,
        total_earned: newTotalEarned,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", tx.seller_id);

    if (walletUpdateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update wallet" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update transaction status
    await adminClient
      .from("transactions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        platform_fee: fee,
        seller_receives: net,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction_id);

    // Update listing status to sold
    await adminClient
      .from("listings")
      .update({ status: "sold", updated_at: new Date().toISOString() })
      .eq("id", tx.listing_id);

    // Notify seller
    await adminClient.from("notifications").insert({
      user_id: tx.seller_id,
      title: "💰 Pagamento liberado!",
      body: `R$ ${net.toFixed(2).replace(".", ",")} foi creditado em sua carteira.`,
      link: "/carteira",
    });

    // Notify buyer
    await adminClient.from("notifications").insert({
      user_id: tx.buyer_id,
      title: "✅ Compra concluída!",
      body: "Obrigado por confirmar o recebimento. Sua transação foi finalizada.",
      link: `/compras/${transaction_id}`,
    });

    // Audit log
    await adminClient.from("audit_logs").insert({
      user_id: userId,
      action: "escrow_released",
      details: {
        transaction_id,
        amount,
        fee,
        net,
        seller_id: tx.seller_id,
        buyer_id: tx.buyer_id,
      },
      ip_address: req.headers.get("x-forwarded-for") || "unknown",
    });

    return new Response(
      JSON.stringify({ success: true, net, fee }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
