import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FavoriteWithListing {
  id: string;
  listing_id: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    price: number;
    category: string;
    screenshots: string[] | null;
    status: string;
  } | null;
}

export function useFavorites() {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteWithListing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("favorites")
      .select("id, listing_id, created_at, listing:listings(id, title, price, category, screenshots, status)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setFavorites(data as unknown as FavoriteWithListing[]);
      setFavoriteIds(new Set(data.map((f: any) => f.listing_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) fetchFavorites();
    else {
      setFavorites([]);
      setFavoriteIds(new Set());
    }
  }, [isAuthenticated, fetchFavorites]);

  const toggleFavorite = useCallback(async (listingId: string) => {
    if (!user) return;
    if (favoriteIds.has(listingId)) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId);
      setFavoriteIds((prev) => { const s = new Set(prev); s.delete(listingId); return s; });
      setFavorites((prev) => prev.filter((f) => f.listing_id !== listingId));
    } else {
      const { data } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, listing_id: listingId })
        .select("id, listing_id, created_at, listing:listings(id, title, price, category, screenshots, status)")
        .single();
      if (data) {
        setFavorites((prev) => [data as unknown as FavoriteWithListing, ...prev]);
        setFavoriteIds((prev) => new Set(prev).add(listingId));
      }
    }
  }, [user, favoriteIds]);

  const isFavorite = useCallback((listingId: string) => favoriteIds.has(listingId), [favoriteIds]);

  return { favorites, favoriteIds, loading, toggleFavorite, isFavorite, fetchFavorites };
}
