import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import SellerProfileHeader from "@/components/seller/SellerProfileHeader";
import SellerReviewsList from "@/components/seller/SellerReviewsList";
import { supabase } from "@/integrations/supabase/client";
import { fetchSellerProfile } from "@/lib/fetch-seller-profile";
import type { Listing } from "@/lib/mock-data";

/* ── Hardcoded trusted seller profiles ── */
const TRUSTED_SELLERS: Record<string, any> = {
  "contabanco": {
    user_id: "beccd2b1-0a31-4fd5-9701-4dce5eaa125c",
    username: "contabanco",
    name: "ADM GL",
    avatar_url: "https://yzwncktlibdfycqhvlqg.supabase.co/storage/v1/object/public/avatars/beccd2b1-0a31-4fd5-9701-4dce5eaa125c/avatar.png",
    bio: "Vendedor verificado da plataforma Froiv.",
    is_verified: true,
    avg_rating: 4.8,
    total_reviews: 0,
    total_sales: 0,
    total_purchases: 0,
    created_at: "2024-12-01T00:00:00Z",
  },
  "gb vendas": {
    user_id: "gb-vendas-static",
    username: "gb vendas",
    name: "ADM GB",
    avatar_url: null,
    bio: "Vendedor verificado da plataforma Froiv.",
    is_verified: true,
    avg_rating: 4.8,
    total_reviews: 0,
    total_sales: 0,
    total_purchases: 0,
    created_at: "2024-12-01T00:00:00Z",
  },
  "eduardo": {
    user_id: "d7f85dfb-0f1d-4c58-9a64-0544ec5b158d",
    username: "eduardo",
    name: "Eduardo Klunck",
    avatar_url: null,
    bio: "Vendedor verificado da plataforma Froiv.",
    is_verified: true,
    avg_rating: 4.8,
    total_reviews: 0,
    total_sales: 0,
    total_purchases: 0,
    created_at: "2024-12-01T00:00:00Z",
  },
  "theus": {
    user_id: "73740fcc-5a53-4a10-8645-eeb76ec7642b",
    username: "theus",
    name: "Theus Klunck",
    avatar_url: null,
    bio: "Vendedor verificado da plataforma Froiv.",
    is_verified: true,
    avg_rating: 4.8,
    total_reviews: 0,
    total_sales: 0,
    total_purchases: 0,
    created_at: "2024-12-01T00:00:00Z",
  },
};

// Also map by user_id for /vendedor/:id routes
const TRUSTED_SELLERS_BY_ID: Record<string, any> = {};
for (const v of Object.values(TRUSTED_SELLERS)) {
  TRUSTED_SELLERS_BY_ID[v.user_id] = v;
}

export default function SellerProfile() {
  const { username, id } = useParams();
  const rawIdentifier = decodeURIComponent((username || id || "").trim());
  const normalizedIdentifier = rawIdentifier.toLowerCase().trim();

  const [seller, setSeller] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"listings" | "reviews">("listings");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setSeller(null);
      setListings([]);
      setReviews([]);

      // 1. Check hardcoded trusted sellers first (instant, never fails)
      const hardcoded = TRUSTED_SELLERS[normalizedIdentifier] || TRUSTED_SELLERS_BY_ID[rawIdentifier];
      if (hardcoded) {
        console.log("[SellerProfile] using hardcoded profile:", hardcoded.name);
        setSeller(hardcoded);
        // Try to load listings/reviews from DB (best-effort)
        try {
          const [listingsRes, reviewsRes] = await Promise.all([
            (supabase.from("listings") as any).select("*").eq("seller_id", hardcoded.user_id).eq("status", "active").order("created_at", { ascending: false }),
            (supabase.from("reviews") as any).select("*").eq("reviewed_id", hardcoded.user_id).order("created_at", { ascending: false }).limit(20),
          ]);
          if (listingsRes.data) {
            setListings(listingsRes.data.map((row: any) => ({
              id: row.id, sellerId: row.seller_id, sellerName: hardcoded.name,
              sellerRating: hardcoded.avg_rating || 5, sellerSales: hardcoded.total_sales || 0,
              platform: row.category, title: row.title, description: row.description || "",
              price: Number(row.price), status: row.status, screenshots: row.screenshots || [],
              fields: row.highlights || {}, createdAt: row.created_at,
            })));
          }
          if (reviewsRes.data) setReviews(reviewsRes.data);
        } catch (e) {
          console.log("[SellerProfile] listings/reviews fetch failed (non-critical):", e);
        }
        setLoading(false);
        return;
      }

      // 2. Dynamic lookup for non-hardcoded sellers
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawIdentifier);
      const candidateFilters: Record<string, string>[] = isUUID
        ? [{ user_id: rawIdentifier }]
        : [{ username: rawIdentifier }];

      let profile: any | null = null;
      for (const filters of candidateFilters) {
        profile = await fetchSellerProfile(filters);
        if (profile) break;
      }

      if (!profile) {
        setLoading(false);
        return;
      }

      setSeller(profile);

      const [listingsRes, reviewsRes] = await Promise.all([
        (supabase.from("listings") as any).select("*").eq("seller_id", profile.user_id).eq("status", "active").order("created_at", { ascending: false }),
        (supabase.from("reviews") as any).select("*").eq("reviewed_id", profile.user_id).order("created_at", { ascending: false }).limit(20),
      ]);

      if (listingsRes.data) {
        setListings(listingsRes.data.map((row: any) => ({
          id: row.id, sellerId: row.seller_id, sellerName: profile.name || "Vendedor",
          sellerRating: profile.avg_rating || 5, sellerSales: profile.total_sales || 0,
          platform: row.category, title: row.title, description: row.description || "",
          price: Number(row.price), status: row.status, screenshots: row.screenshots || [],
          fields: row.highlights || {}, createdAt: row.created_at,
        })));
      }

      if (reviewsRes.data) setReviews(reviewsRes.data);
      setLoading(false);
    }
    if (rawIdentifier) load();
  }, [rawIdentifier, normalizedIdentifier]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-foreground font-medium mb-4">Vendedor não encontrado</p>
            <Link to="/marketplace"><Button>Voltar ao Marketplace</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
    : seller.avg_rating?.toFixed(1) || "5.0";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="pb-16 sm:pb-0" style={{ paddingTop: 'calc(56px + var(--pwa-banner-offset, 0px))' }}>
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <SellerProfileHeader
            seller={seller}
            listingsCount={listings.length}
            avgRating={avgRating}
            reviewsCount={reviews.length}
          />

          {/* Tabs */}
          <div className="flex gap-0 bg-card rounded-xl border border-border overflow-hidden mt-4 mb-4">
            {(["listings", "reviews"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"}`}>
                {t === "listings" ? `Anúncios (${listings.length})` : `Avaliações (${reviews.length})`}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "listings" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {listings.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Nenhum anúncio ativo</p>
                </div>
              ) : listings.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}

          {tab === "reviews" && <SellerReviewsList reviews={reviews} />}
        </div>
      </div>
      <Footer />
    </div>
  );
}
