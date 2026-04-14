import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch a seller's public profile directly from the project database.
 * Supports lookup by username, user_id or exact email.
 */
export async function fetchSellerProfile(
  filters: Record<string, string>
): Promise<any | null> {
  try {
    const key = Object.keys(filters)[0];
    const val = filters[key];
    if (!key || !val) return null;

    const { data, error } = await (supabase
      .from("public_profiles") as any)
      .select("user_id,username,name,avatar_url,cover_url,bio,is_verified,avg_rating,total_reviews,total_sales,total_purchases,created_at,referral_code")
      .eq(key, val)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("fetchSellerProfile query error:", error);
      return null;
    }

    return data || null;
  } catch (e) {
    console.error("fetchSellerProfile error:", e);
    return null;
  }
}
