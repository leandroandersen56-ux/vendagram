
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

    const { transaction_id, description, screenshot_url } = await req.json();
    if (!transaction_id || !description || description.length < 20) {
      return new Response(
        JSON.stringify({ error: "transaction_id and description (min 20 chars) required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Only buyer or seller can open dispute
    if (tx.buyer_id !== userId && tx.seller_id !== userId) {
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check valid status
    if (!["paid", "transfer_in_progress"].includes(tx.status)) {
      return new Response(
        JSON.stringify({ error: "Cannot open dispute for this transaction status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert dispute
    const { data: dispute, error: disputeError } = await adminClient
      .from("disputes")
      .insert({
        transaction_id,
        opened_by: userId,
        description,
        screenshot_url: screenshot_url || null,
        status: "open",
      })
      .select()
      .single();

    if (disputeError) {
      return new Response(
        JSON.stringify({ error: "Failed to create dispute" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update transaction status
    await adminClient
      .from("transactions")
      .update({ status: "disputed", updated_at: new Date().toISOString() })
      .eq("id", transaction_id);

    // Notify the other party
    const otherUserId = userId === tx.buyer_id ? tx.seller_id : tx.buyer_id;
    await adminClient.from("notifications").insert({
      user_id: otherUserId,
      title: "⚠️ Disputa aberta",
      body: "Uma disputa foi aberta em uma de suas transações. Admin analisará em até 24h.",
      link: `/compras/${transaction_id}`,
    });

    // Audit
    await adminClient.from("audit_logs").insert({
      user_id: userId,
      action: "dispute_opened",
      details: { transaction_id, dispute_id: dispute.id },
      ip_address: req.headers.get("x-forwarded-for") || "unknown",
    });

    return new Response(
      JSON.stringify({ success: true, dispute_id: dispute.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
