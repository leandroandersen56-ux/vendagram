import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch a seller's public profile directly from the project database.
 * Supports lookup by username, user_id or exact email.
 */
export async function fetchSellerProfile(
  filters: Record<string, string>
): Promise<any | null> {
  try {
    let q = supabase.from("public_profiles").select("*");

    for (const [col, val] of Object.entries(filters)) {
      q = q.eq(col, val);
    }

    const { data, error } = await q.limit(1).maybeSingle();

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
