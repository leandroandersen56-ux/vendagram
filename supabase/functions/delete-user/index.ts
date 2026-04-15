import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PERSONAL_SUPABASE_URL = "https://yzwncktlibdfycqhvlqg.supabase.co";
const ADMIN_EMAIL = "sparckonmeta@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const serviceRoleKey = Deno.env.get("PERSONAL_SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Service role key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify caller is admin via production instance token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - no token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client to verify the caller's token on production
    const prodAdmin = createClient(PERSONAL_SUPABASE_URL, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await prodAdmin.auth.getUser(token);

    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid token", detail: userErr?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (userData.user.email?.toLowerCase() !== ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({ error: "Forbidden - not admin" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const { user_id, email } = await req.json();
    if (!user_id && !email) {
      return new Response(
        JSON.stringify({ error: "user_id or email required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find target user in production
    let targetUserId = user_id;

    if (!targetUserId && email) {
      const { data: listData, error: listErr } = await prodAdmin.auth.admin.listUsers({ perPage: 1000 });
      if (listErr) {
        return new Response(
          JSON.stringify({ error: "Failed to list users", detail: listErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const found = listData?.users?.find(
        (u: any) => u.email?.toLowerCase() === email.toLowerCase()
      );
      if (!found) {
        return new Response(
          JSON.stringify({ error: `User "${email}" not found in production` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      targetUserId = found.id;
    }

    // Prevent self-deletion
    if (targetUserId === userData.user.id) {
      return new Response(
        JSON.stringify({ error: "Cannot delete yourself" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete related data
    const deletions = [
      prodAdmin.from("wallets").delete().eq("user_id", targetUserId),
      prodAdmin.from("favorites").delete().eq("user_id", targetUserId),
      prodAdmin.from("listing_views").delete().eq("user_id", targetUserId),
      prodAdmin.from("notifications").delete().eq("user_id", targetUserId),
      prodAdmin.from("follows").delete().eq("follower_id", targetUserId),
      prodAdmin.from("follows").delete().eq("following_id", targetUserId),
      prodAdmin.from("profiles").delete().eq("user_id", targetUserId),
    ];
    await Promise.allSettled(deletions);

    // Delete auth user
    const { error: deleteErr } = await prodAdmin.auth.admin.deleteUser(targetUserId);
    if (deleteErr) {
      return new Response(
        JSON.stringify({ error: "Failed to delete auth user", detail: deleteErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, deleted_user_id: targetUserId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
