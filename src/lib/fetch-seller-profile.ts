import { supabase } from "@/integrations/supabase/client";

const CLOUD_URL = import.meta.env.VITE_SUPABASE_URL;
const CLOUD_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Fetch a seller's public profile. Tries local public_profiles view first,
 * falls back to the admin Edge Function (which uses service role key).
 */
export async function fetchSellerProfile(
  filters: Record<string, string>
): Promise<any | null> {
  // Try direct query first
  let query = supabase.from("public_profiles" as any).select("*") as any;
  for (const [col, val] of Object.entries(filters)) {
    query = query.eq(col, val);
  }
  const { data } = await query.maybeSingle();
  if (data) return data;

  // Fallback: use edge function with service role
  try {
    const res = await fetch(`${CLOUD_URL}/functions/v1/admin-create-listing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CLOUD_KEY}`,
      },
      body: JSON.stringify({
        action: "query",
        table: "public_profiles",
        filters,
        select: "user_id,username,name,avatar_url,bio,is_verified,avg_rating,total_reviews,total_sales,total_purchases,created_at,referral_code",
      }),
    });
    const json = await res.json();
    return json.data?.[0] || null;
  } catch {
    return null;
  }
}
