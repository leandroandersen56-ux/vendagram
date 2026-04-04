
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: authUser }, error: authError } = await userClient.auth.getUser();
    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = authUser.id;

    const { transaction_id, credentials, action } = await req.json();

    if (!transaction_id) {
      return new Response(JSON.stringify({ error: "transaction_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: tx, error: txError } = await adminClient
      .from("transactions")
      .select("*")
      .eq("id", transaction_id)
      .single();

    if (txError || !tx) {
      return new Response(JSON.stringify({ error: "Transaction not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SEND credentials (seller)
    if (action === "send") {
      if (tx.seller_id !== userId) {
        return new Response(JSON.stringify({ error: "Only seller can send credentials" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!["paid", "transfer_in_progress"].includes(tx.status)) {
        return new Response(JSON.stringify({ error: "Invalid transaction status" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!credentials || !credentials.login || !credentials.password) {
        return new Response(JSON.stringify({ error: "Login and password required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Simple encoding (in production use AES with CREDENTIALS_SECRET)
      const encoder = new TextEncoder();
      const data = JSON.stringify(credentials);
      const encoded = btoa(String.fromCharCode(...encoder.encode(data)));

      await adminClient.from("credentials").insert({
        transaction_id,
        data_encrypted: encoded,
        delivered_at: new Date().toISOString(),
      });

      await adminClient.from("transactions").update({
        status: "transfer_in_progress",
        updated_at: new Date().toISOString(),
      }).eq("id", transaction_id);

      // Notify buyer
      await adminClient.from("notifications").insert({
        user_id: tx.buyer_id,
        title: "🔐 Credenciais disponíveis!",
        body: "O vendedor enviou os dados da conta. Verifique e confirme o recebimento.",
        link: `/compras/${transaction_id}`,
      });

      // System message in chat
      await adminClient.from("transaction_messages").insert({
        transaction_id,
        sender_id: userId,
        message: "📦 Credenciais da conta enviadas. Verifique os dados de acesso.",
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET credentials (buyer or seller)
    if (action === "get") {
      if (tx.buyer_id !== userId && tx.seller_id !== userId) {
        return new Response(JSON.stringify({ error: "Not authorized" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: creds } = await adminClient
        .from("credentials")
        .select("*")
        .eq("transaction_id", transaction_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!creds) {
        return new Response(JSON.stringify({ credentials: null }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Decode
      try {
        const decoded = atob(creds.data_encrypted);
        const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
        const text = new TextDecoder().decode(bytes);
        const parsed = JSON.parse(text);

        return new Response(JSON.stringify({
          credentials: parsed,
          delivered_at: creds.delivered_at,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ error: "Failed to decrypt" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
