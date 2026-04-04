import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Shield, CheckCircle2, Package, Calendar, Loader2, MessageCircle, ArrowLeft, Tag, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, type Listing } from "@/lib/mock-data";

const REP_SEGMENTS = [
  { color: "bg-destructive", label: "Vermelho" },
  { color: "bg-[#FF6900]", label: "Laranja" },
  { color: "bg-[#FFB800]", label: "Amarelo" },
  { color: "bg-[#7BC67E]", label: "Verde claro" },
  { color: "bg-success", label: "Verde" },
];

function getRepLevel(rating: number) {
  if (rating >= 4.8) return { label: "Platinum", color: "text-primary", idx: 4 };
  if (rating >= 4.5) return { label: "Gold", color: "text-[#FFB800]", idx: 3 };
  if (rating >= 4.0) return { label: "Silver", color: "text-muted-foreground", idx: 2 };
  return { label: "Bronze", color: "text-[#FF6900]", idx: 1 };
}

export default function SellerProfile() {
  const { username } = useParams();
  const [seller, setSeller] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"listings" | "reviews">("listings");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (!profile) { setLoading(false); return; }
      setSeller(profile);

      const [listingsRes, reviewsRes] = await Promise.all([
        supabase.from("listings").select("*").eq("seller_id", profile.user_id).eq("status", "active").order("created_at", { ascending: false }),
        supabase.from("reviews").select("*, profiles!reviews_reviewer_id_fkey(name, avatar_url, username)").eq("reviewed_id", profile.user_id).order("created_at", { ascending: false }).limit(20),
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
    if (username) load();
  }, [username]);

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

  const rep = getRepLevel(seller.avg_rating || 0);
  const memberSince = new Date(seller.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
    : seller.avg_rating?.toFixed(1) || "5.0";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="pt-14 pb-16 sm:pb-0">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary to-[#1A4BC4] rounded-2xl p-6 text-white mb-6">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-semibold shrink-0">
                {seller.avatar_url ? (
                  <img src={seller.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                ) : seller.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold">{seller.name || "Vendedor"}</h1>
                  {seller.is_verified && <CheckCircle2 className="h-5 w-5 text-white/80" />}
                </div>
                <p className="text-white/70 text-sm">@{seller.username || "usuario"}</p>
                {seller.bio && <p className="text-white/80 text-sm mt-1">{seller.bio}</p>}

                {/* Rep bar */}
                <div className="flex gap-1 h-2 rounded-full overflow-hidden mt-3 max-w-[200px]">
                  {REP_SEGMENTS.map((seg, i) => (
                    <div key={i} className={`flex-1 ${seg.color} ${i <= rep.idx ? "" : "opacity-20"}`} />
                  ))}
                </div>
                <p className="text-xs text-white/60 mt-1">Reputação: <span className="font-semibold text-white">{rep.label}</span></p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mt-4 text-sm flex-wrap items-center">
              <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5 text-primary" /> {listings.length} anúncios</span>
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-primary fill-primary" /> {avgRating}</span>
              <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5 text-primary" /> {seller.total_sales || 0} vendas</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-primary" /> Desde {memberSince}</span>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-0 bg-card rounded-xl border border-border overflow-hidden mb-6">
            {(["listings", "reviews"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t ? "bg-primary text-white" : "text-muted-foreground"}`}>
                {t === "listings" ? `Anúncios (${listings.length})` : `Avaliações (${reviews.length})`}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "listings" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {listings.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Nenhum anúncio ativo</p>
                </div>
              ) : listings.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}

          {tab === "reviews" && (
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Nenhuma avaliação ainda</p>
                </div>
              ) : reviews.map((r: any) => (
                <div key={r.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground">
                      {(r.profiles as any)?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{(r.profiles as any)?.name || "Comprador"}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "text-[#FFB800] fill-[#FFB800]" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
