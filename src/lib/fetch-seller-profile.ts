import { supabase } from "@/integrations/supabase/client";
import { getTrustedSellerByIdentifier, toTrustedSellerProfile } from "@/lib/trusted-sellers";

const CLOUD_URL = import.meta.env.VITE_SUPABASE_URL;
const CLOUD_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const LOCAL_PROFILE_SELECT = "user_id,username,name,avatar_url,bio,is_verified,avg_rating,total_reviews,total_sales,total_purchases,created_at,referral_code";

/**
 * Fetch a seller's public profile.
 * 1) Check trusted-sellers cache (instant, no network)
 * 2) Try the project's own DB
 * 3) Fallback to external DB via edge function
 */
export async function fetchSellerProfile(
  filters: Record<string, string>
): Promise<any | null> {
  const key = Object.keys(filters)[0];
  const val = filters[key];

  if (!key || !val) return null;

  // Fast path: check trusted sellers first (no network call)
  const trusted = getTrustedSellerByIdentifier(val);
  if (trusted) {
    return toTrustedSellerProfile(trusted);
  }

  if (key === "username" || key === "user_id") {
    try {
      const { data, error } = await (supabase.from("public_profiles") as any)
        .select(LOCAL_PROFILE_SELECT)
        .eq(key, val)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.error("[fetchSellerProfile] project DB error:", e);
    }
  }

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
        select: "user_id,username,name,email,avatar_url,bio,is_verified,avg_rating,total_reviews,total_sales,total_purchases,created_at,referral_code",
      }),
    });

    if (!res.ok) throw new Error(`edge fn failed: ${res.status}`);

    const json = await res.json();
    return json.data?.[0] || null;
  } catch (e) {
    console.error("[fetchSellerProfile] external DB error:", e);
    return null;
  }
}
