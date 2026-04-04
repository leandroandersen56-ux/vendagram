import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Offer {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  original_price: number;
  offered_price: number;
  counter_price: number | null;
  final_price: number | null;
  status: string;
  buyer_message: string | null;
  seller_message: string | null;
  expires_at: string;
  responded_at: string | null;
  created_at: string;
}

export function useOffer(listingId: string | undefined) {
  const { user } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOffer = async () => {
    if (!user?.id || !listingId) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("offers")
      .select("*")
      .eq("listing_id", listingId)
      .eq("buyer_id", user.id)
      .in("status", ["pending", "accepted", "countered", "rejected"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setOffer(data as Offer | null);
    setLoading(false);
  };

  useEffect(() => {
    fetchOffer();
  }, [user?.id, listingId]);

  // Realtime
  useEffect(() => {
    if (!offer?.id) return;
    const channel = supabase
      .channel(`offer-${offer.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "offers",
        filter: `id=eq.${offer.id}`,
      }, (payload) => {
        setOffer(payload.new as Offer);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [offer?.id]);

  return { offer, loading, refetch: fetchOffer };
}

export function useSellerOffers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<(Offer & { listing_title?: string; listing_screenshots?: string[]; listing_category?: string; buyer_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    if (!user?.id) { setLoading(false); return; }

    const { data } = await supabase
      .from("offers")
      .select("*, listings(title, screenshots, category), profiles!offers_buyer_id_profiles(name)")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const mapped = data.map((o: any) => ({
        ...o,
        listing_title: o.listings?.title,
        listing_screenshots: o.listings?.screenshots,
        listing_category: o.listings?.category,
        buyer_name: o.profiles?.name,
      }));
      setOffers(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOffers(); }, [user?.id]);

  // Realtime for all seller offers
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel("seller-offers")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "offers",
        filter: `seller_id=eq.${user.id}`,
      }, () => {
        fetchOffers();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return { offers, loading, refetch: fetchOffers };
}
