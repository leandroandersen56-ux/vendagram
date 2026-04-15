import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PERSONAL_SUPABASE_URL = "https://yzwncktlibdfycqhvlqg.supabase.co";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify caller is admin via Lovable Cloud instance
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cloudClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claims, error: claimsErr } = await cloudClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: isAdmin } = await cloudClient.rpc("has_role", {
      _user_id: claims.claims.sub,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_id, email } = await req.json();
    if (!user_id && !email) {
      return new Response(JSON.stringify({ error: "user_id or email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Connect to production instance with service role
    const serviceRoleKey = Deno.env.get("PERSONAL_SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Service role key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prodClient = createClient(PERSONAL_SUPABASE_URL, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Find user in production
    let targetUserId = user_id;

    if (!targetUserId && email) {
      const { data: users } = await prodClient.auth.admin.listUsers({ perPage: 1000 });
      const found = users?.users?.find(
        (u: any) => u.email?.toLowerCase() === email.toLowerCase()
      );
      if (!found) {
        return new Response(JSON.stringify({ error: "User not found in production" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      targetUserId = found.id;
    }

    // Delete related data first
    await prodClient.from("wallets").delete().eq("user_id", targetUserId);
    await prodClient.from("favorites").delete().eq("user_id", targetUserId);
    await prodClient.from("listing_views").delete().eq("user_id", targetUserId);
    await prodClient.from("notifications").delete().eq("user_id", targetUserId);
    await prodClient.from("follows").delete().eq("follower_id", targetUserId);
    await prodClient.from("follows").delete().eq("following_id", targetUserId);
    await prodClient.from("profiles").delete().eq("user_id", targetUserId);

    // Delete auth user
    const { error: deleteErr } = await prodClient.auth.admin.deleteUser(targetUserId);
    if (deleteErr) {
      return new Response(JSON.stringify({ error: deleteErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, deleted_user_id: targetUserId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
