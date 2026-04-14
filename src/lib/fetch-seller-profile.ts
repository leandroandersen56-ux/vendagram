const CLOUD_URL = import.meta.env.VITE_SUPABASE_URL;
const CLOUD_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Fetch a seller's public profile via Edge Function.
 * Supports lookup by username, user_id or exact email.
 */
export async function fetchSellerProfile(
  filters: Record<string, string>
): Promise<any | null> {
  try {
    const res = await fetch(`${CLOUD_URL}/functions/v1/admin-create-listing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CLOUD_KEY}`,
      },
      body: JSON.stringify({
        action: "query",
        table: "profiles",
        filters,
        select: "user_id,username,name,email,avatar_url,cover_url,bio,is_verified,avg_rating,total_reviews,total_sales,total_purchases,created_at,referral_code",
      }),
    });

    if (!res.ok) {
      throw new Error(`fetchSellerProfile failed: ${res.status}`);
    }

    const json = await res.json();
    return json.data?.[0] || null;
  } catch (e) {
    console.error("fetchSellerProfile error:", e);
    return null;
  }
}
