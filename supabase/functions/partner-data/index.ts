import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PERSONAL_URL = "https://yzwncktlibdfycqhvlqg.supabase.co";
const PERSONAL_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6d25ja3RsaWJkZnljcWh2bHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTg1MDQsImV4cCI6MjA4OTk3NDUwNH0.6moeEg1xDf9gviNvFQGYzuxEzKMLNG1JlLnjuttPiIw";

const ADMIN_EMAILS = [
  "sparckonmeta@gmail.com",
  "contabanco743@gmail.com",
  "vg786674@gmail.com",
  "costawlc7@gmail.com",
  "eduardoklunck95@gmail.com",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const serviceKey = Deno.env.get("PERSONAL_SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey) {
      return new Response(
        JSON.stringify({ error: "Service key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate caller via auth token against personal instance
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing auth token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(PERSONAL_URL, PERSONAL_ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userResp, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userResp?.user?.email) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerEmail = userResp.user.email.toLowerCase();

    // Authorize: must be admin email OR active partner
    const admin = createClient(PERSONAL_URL, serviceKey);
    let authorized = ADMIN_EMAILS.includes(callerEmail);
    if (!authorized) {
      const { data: partner } = await admin
        .from("partners")
        .select("id")
        .eq("email", callerEmail)
        .eq("is_active", true)
        .maybeSingle();
      authorized = !!partner;
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { resource } = body as { resource?: string };

    if (resource === "listings") {
      const { data, error } = await admin
        .from("listings")
        .select(
          "id, title, price, status, category, screenshots, created_at, views_count, stock, seller_id"
        )
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (resource === "users") {
      const { data, error } = await admin
        .from("profiles")
        .select(
          "user_id, name, username, email, whatsapp, avatar_url, is_verified, total_sales, total_purchases, avg_rating, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid resource" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
