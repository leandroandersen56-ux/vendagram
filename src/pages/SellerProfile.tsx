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

export default function SellerProfile() {
  const { username, id } = useParams();
  const identifier = id || username;
  const [seller, setSeller] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"listings" | "reviews">("listings");

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Detect if identifier is a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier || "");
      const filters = isUUID ? { user_id: identifier! } : { username: identifier! };

      let profile = await fetchSellerProfile(filters);

      // Fallback: if not found by username, try as user_id anyway
      if (!profile && !isUUID) {
        profile = await fetchSellerProfile({ user_id: identifier! });
      }

      if (!profile) { setLoading(false); return; }

      // Also fetch email from profiles table for partner detection
      try {
        const CLOUD_URL = import.meta.env.VITE_SUPABASE_URL;
        const CLOUD_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const emailRes = await fetch(`${CLOUD_URL}/functions/v1/admin-create-listing`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${CLOUD_KEY}` },
          body: JSON.stringify({ action: "query", table: "profiles", filters: { user_id: profile.user_id }, select: "email" }),
        });
        const emailJson = await emailRes.json();
        if (emailJson.data?.[0]?.email) {
          profile.email = emailJson.data[0].email;
        }
      } catch {}

      setSeller(profile);

      const [listingsRes, reviewsRes] = await Promise.all([
        supabase.from("listings").select("*").eq("seller_id", profile.user_id).eq("status", "active").order("created_at", { ascending: false }),
        supabase.from("reviews").select("*").eq("reviewed_id", profile.user_id).order("created_at", { ascending: false }).limit(20),
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
    if (identifier) load();
  }, [identifier]);

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
