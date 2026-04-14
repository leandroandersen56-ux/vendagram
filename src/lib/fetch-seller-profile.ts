import { supabase } from "@/integrations/supabase/client";

const CLOUD_URL = import.meta.env.VITE_SUPABASE_URL;
const CLOUD_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Fetch a seller's public profile.
 * 1) Try the project's own DB (public_profiles view)
 * 2) Fallback to external/personal DB via edge function
 */
export async function fetchSellerProfile(
  filters: Record<string, string>
): Promise<any | null> {
  const key = Object.keys(filters)[0];
  const val = filters[key];
  if (!key || !val) return null;

  // 1. Try project DB first
  try {
    const { data, error } = await (supabase
      .from("public_profiles") as any)
      .select("user_id,username,name,avatar_url,cover_url,bio,is_verified,avg_rating,total_reviews,total_sales,total_purchases,created_at,referral_code")
      .eq(key, val)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      console.log("[fetchSellerProfile] found in project DB:", data.name);
      return data;
    }
  } catch (e) {
    console.error("[fetchSellerProfile] project DB error:", e);
  }

  // 2. Fallback to external DB via edge function
  try {
    const res = await fetch(`${CLOUD_URL}/functions/v1/admin-create-listing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CLOUD_KEY}`,
      },
      body: JSON.stringify({
        action: "query",
        table: "profiles",
        filters,
        select: "user_id,username,name,email,avatar_url,cover_url,bio,is_verified,avg_rating,total_reviews,total_sales,total_purchases,created_at,referral_code",
      }),
    });

    if (!res.ok) throw new Error(`edge fn failed: ${res.status}`);

    const json = await res.json();
    const profile = json.data?.[0] || null;
    if (profile) {
      console.log("[fetchSellerProfile] found in external DB:", profile.name);
    }
    return profile;
  } catch (e) {
    console.error("[fetchSellerProfile] external DB error:", e);
    return null;
  }
}
