import { supabase } from "@/integrations/supabase/client";
import { getTrustedSellerByIdentifier } from "@/lib/trusted-sellers";

/**
 * Given an array of seller IDs, returns a map of sellerId -> { rating, sales, name }
 * by checking trusted-sellers first, then falling back to public_profiles.
 */
export async function fetchSellerStats(sellerIds: string[]): Promise<
  Record<string, { rating: number; sales: number; name: string }>
> {
  const unique = [...new Set(sellerIds)];
  const result: Record<string, { rating: number; sales: number; name: string }> = {};

  // 1. Resolve from trusted sellers
  const remaining: string[] = [];
  for (const id of unique) {
    const ts = getTrustedSellerByIdentifier(id);
    if (ts) {
      result[id] = { rating: ts.rating, sales: ts.sales, name: ts.name };
    } else {
      remaining.push(id);
    }
  }

  // 2. Fetch remaining from public_profiles
  if (remaining.length > 0) {
    const { data } = await supabase
      .from("public_profiles")
      .select("user_id, avg_rating, total_sales, name")
      .in("user_id", remaining);

    if (data) {
      for (const p of data) {
        if (p.user_id) {
          result[p.user_id] = {
            rating: p.avg_rating ?? 0,
            sales: p.total_sales ?? 0,
            name: p.name || "Vendedor",
          };
        }
      }
    }
  }

  return result;
}
