
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

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: authUser }, error: authError } = await userClient.auth.getUser();
    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = authUser!.id;

    const { amount, pix_key, pix_key_type } = await req.json();

    if (!amount || amount < 20) {
      return new Response(
        JSON.stringify({ error: "Minimum withdrawal is R$ 20.00" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!pix_key) {
      return new Response(
        JSON.stringify({ error: "Pix key is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get wallet
    const { data: wallet, error: walletError } = await adminClient
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      return new Response(
        JSON.stringify({ error: "Wallet not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (Number(wallet.balance) < amount) {
      return new Response(
        JSON.stringify({ error: "Insufficient balance" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Debit balance
    await adminClient
      .from("wallets")
      .update({
        balance: Number(wallet.balance) - amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    // Insert withdrawal request
    const { data: withdrawal, error: withdrawalError } = await adminClient
      .from("withdrawals")
      .insert({
        user_id: userId,
        amount,
        pix_key,
        pix_key_type: pix_key_type || "cpf",
        status: "pending",
      })
      .select()
      .single();

    if (withdrawalError) {
      // Rollback balance
      await adminClient
        .from("wallets")
        .update({ balance: Number(wallet.balance), updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      return new Response(
        JSON.stringify({ error: "Failed to create withdrawal" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Notify user
    await adminClient.from("notifications").insert({
      user_id: userId,
      title: "📤 Saque solicitado",
      body: `Seu saque de R$ ${Number(amount).toFixed(2).replace(".", ",")} está sendo processado.`,
      link: "/carteira",
    });

    // Audit
    await adminClient.from("audit_logs").insert({
      user_id: userId,
      action: "withdrawal_requested",
      details: { withdrawal_id: withdrawal.id, amount, pix_key_type },
      ip_address: req.headers.get("x-forwarded-for") || "unknown",
    });

    return new Response(
      JSON.stringify({ success: true, withdrawal_id: withdrawal.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
