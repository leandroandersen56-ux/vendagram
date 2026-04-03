import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, Shield, Edit, AlertCircle, Loader2,
  Share2, Heart, ChevronRight, CheckCircle2, Copy, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatBRL, getPlatform, PLATFORM_COVERS, MOCK_LISTINGS } from "@/lib/mock-data";
import PlatformIcon from "@/components/PlatformIcon";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import ProductGallery from "@/components/pdp/ProductGallery";
import BuyBox from "@/components/pdp/BuyBox";
import TrustSignals from "@/components/pdp/TrustSignals";
import SellerCard from "@/components/pdp/SellerCard";
import AccountSpecs from "@/components/pdp/AccountSpecs";
import StickyBuyBar from "@/components/pdp/StickyBuyBar";
import ReviewSection from "@/components/pdp/ReviewSection";
import RelatedProducts from "@/components/pdp/RelatedProducts";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuth } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [copied, setCopied] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchListing() {
      if (!id) return;
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        setListing(data);
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", data.seller_id)
          .maybeSingle();
        if (profile) setSeller(profile);
      } else {
        const mock = MOCK_LISTINGS.find((m) => m.id === id);
        if (mock) {
          setListing({
            id: mock.id, seller_id: mock.sellerId, category: mock.platform,
            title: mock.title, description: mock.description, price: mock.price,
            status: mock.status, screenshots: mock.screenshots, highlights: mock.fields,
          });
          setSeller({ name: mock.sellerName, avg_rating: mock.sellerRating, total_sales: mock.sellerSales });
        }
      }
      setLoading(false);
    }
    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--muted))]">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[hsl(var(--muted))] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-[hsl(var(--txt-hint))] mx-auto mb-4" />
            <p className="text-[hsl(var(--txt-primary))] font-medium mb-4">Anúncio não encontrado</p>
            <Link to="/marketplace"><Button className="bg-primary text-white rounded-xl">Voltar ao Marketplace</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const platform = getPlatform(listing.category);
  const highlights = (listing.highlights && typeof listing.highlights === "object" && !Array.isArray(listing.highlights))
    ? listing.highlights as Record<string, any> : {};

  const sellerName = seller?.name || "Vendedor";
  const sellerRating = seller?.avg_rating || 5.0;
  const sellerSales = seller?.total_sales || 0;

  const infoFields = Object.entries(highlights).filter(([_, v]) => typeof v === "string" || typeof v === "number");
  const featureFlags = Object.entries(highlights).filter(([_, v]) => v === true);
  const itemsList = highlights["Itens"] as string[] | undefined;
  const originalPrice = highlights["Preço original"] as string | undefined;

  const coverImg = PLATFORM_COVERS[listing.category];
  const screenshots = (listing.screenshots || []).filter((s: string) => s);
  const allImages = coverImg ? [coverImg, ...screenshots] : screenshots;

  const handleShare = () => {
    const message = `🎮 ${listing.title} por ${formatBRL(listing.price)} 🔒 Compra segura: ${window.location.origin}/listing/${listing.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/listing/${listing.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuy = () => {
    if (isAuthenticated) {
      navigate(`/checkout/${listing.id}`);
    } else {
      openAuth(`/checkout/${listing.id}`);
    }
  };

  const PLATFORM_BADGE_COLORS: Record<string, string> = {
    instagram: "bg-gradient-to-r from-[#833AB4] to-[#E1306C] text-white",
    tiktok: "bg-[#111] text-white",
    youtube: "bg-[#FF0000] text-white",
    facebook: "bg-[#1877F2] text-white",
    free_fire: "bg-[#FF6B35] text-white",
    valorant: "bg-[#FF4655] text-white",
    fortnite: "bg-[#9D4DBB] text-white",
    roblox: "bg-[#E2231A] text-white",
    clash_royale: "bg-[#F5C518] text-[#111]",
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--muted))] pb-20 sm:pb-0">
      <Navbar />

      <div className="pt-16 sm:pt-20">
        {/* Floating back + actions row (mobile) */}
        <div className="sm:hidden flex items-center justify-between px-4 py-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-[13px] text-[hsl(var(--txt-secondary))] hover:text-primary transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-1.5 rounded-full hover:bg-[hsl(var(--muted))]" aria-label="Compartilhar">
              <Share2 className="h-4 w-4 text-[hsl(var(--txt-secondary))]" />
            </button>
            <motion.button
              onClick={() => setFavorited(!favorited)}
              className="p-1.5 rounded-full hover:bg-[hsl(var(--muted))]"
              aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              whileTap={{ scale: 1.3 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <Heart className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : "text-[hsl(var(--txt-secondary))]"}`} />
            </motion.button>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Breadcrumb (desktop) */}
          <div className="hidden sm:block container mx-auto px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--txt-hint))]">
              <Link to="/" className="hover:text-primary transition-colors">Início</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to={`/marketplace?platform=${listing.category}`} className="hover:text-primary transition-colors">{platform.name}</Link>
            </div>
          </div>

          <div className="container mx-auto px-4 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-8">
              {/* Left column */}
              <div className="lg:col-span-3 space-y-4">
                {/* Gallery */}
                <ProductGallery
                  images={allImages}
                  title={listing.title}
                  category={listing.category}
                  verified={sellerSales >= 5}
                />

                {/* Info block (mobile: below gallery, desktop: below gallery too) */}
                <div className="bg-white rounded-xl p-4 border border-[hsl(var(--border))]">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${PLATFORM_BADGE_COLORS[listing.category] || "bg-[hsl(var(--muted))] text-[hsl(var(--txt-primary))]"}`}>
                      {platform.name.toUpperCase()}
                    </span>
                    {sellerSales >= 5 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[hsl(var(--success-light))] text-[hsl(var(--success))]">
                        VERIFICADO
                      </span>
                    )}
                    {sellerSales >= 15 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[hsl(var(--hot-light))] text-[hsl(var(--hot))]">
                        MAIS VENDIDO
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="flex items-start justify-between gap-2">
                    <h1 className="text-lg sm:text-[22px] font-semibold text-[hsl(var(--txt-primary))] leading-snug">
                      {listing.title}
                    </h1>
                    {user && user.id === listing.seller_id && (
                      <Button
                        variant="outline" size="sm" className="shrink-0 text-xs rounded-lg"
                        onClick={() => navigate(`/painel/anuncios/editar/${listing.id}`)}
                      >
                        <Edit className="h-3 w-3 mr-1" /> Editar
                      </Button>
                    )}
                  </div>

                  {/* Rating + sales */}
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2 text-[13px]">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-primary">{sellerRating.toFixed(1)}</span>
                    </div>
                    <span className="text-[hsl(var(--border))]">|</span>
                    <span className="text-[hsl(var(--txt-secondary))]">{sellerSales} vendas</span>
                    <span className="text-[hsl(var(--border))]">|</span>
                    <button className="text-primary font-medium hover:underline">Ver avaliações →</button>
                  </div>
                </div>

                {/* Buy Box (mobile only) */}
                <div className="lg:hidden" ref={buyBoxRef}>
                  <BuyBox
                    price={listing.price}
                    originalPrice={originalPrice}
                    onBuy={handleBuy}
                  />
                </div>

                {/* Trust Signals (mobile only) */}
                <div className="lg:hidden">
                  <TrustSignals />
                </div>

                {/* Seller Card (mobile only) */}
                <div className="lg:hidden">
                  <SellerCard
                    name={sellerName}
                    rating={sellerRating}
                    sales={sellerSales}
                  />
                </div>

                {/* Account Specs */}
                <AccountSpecs infoFields={infoFields} featureFlags={featureFlags} />

                {/* Description */}
                {listing.description && (
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-white p-4">
                    <h3 className="text-sm font-bold text-[hsl(var(--txt-primary))] mb-2">📝 Descrição completa</h3>
                    <p className="text-[14px] text-[hsl(var(--txt-secondary))] leading-relaxed whitespace-pre-line">
                      {listing.description}
                    </p>
                    {itemsList && itemsList.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[hsl(var(--border))]/60">
                        <p className="text-[13px] font-semibold text-[hsl(var(--txt-primary))] mb-2">O que está incluído:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {itemsList.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-[13px] text-[hsl(var(--txt-secondary))]">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))] flex-shrink-0" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews */}
                <ReviewSection rating={sellerRating} totalSales={sellerSales} />

                {/* Related Products */}
                <RelatedProducts currentId={listing.id} category={listing.category} />

                {/* Share (mobile) */}
                <div className="lg:hidden grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-xs rounded-lg border-[hsl(var(--border))]" onClick={handleShare}>
                    <Share2 className="h-3.5 w-3.5 mr-1.5" /> WhatsApp
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs rounded-lg border-[hsl(var(--border))]" onClick={handleCopyLink}>
                    {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                    {copied ? "Copiado!" : "Copiar Link"}
                  </Button>
                </div>
              </div>

              {/* Right column (desktop sidebar) */}
              <div className="hidden lg:block lg:col-span-2">
                <div className="sticky top-20 space-y-4">
                  <div ref={buyBoxRef}>
                    <BuyBox
                      price={listing.price}
                      originalPrice={originalPrice}
                      onBuy={handleBuy}
                    />
                  </div>
                  <TrustSignals />
                  <SellerCard
                    name={sellerName}
                    rating={sellerRating}
                    sales={sellerSales}
                  />
                  {/* Share (desktop) */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="text-xs rounded-lg border-[hsl(var(--border))]" onClick={handleShare}>
                      <Share2 className="h-3.5 w-3.5 mr-1.5" /> WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs rounded-lg border-[hsl(var(--border))]" onClick={handleCopyLink}>
                      {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                      {copied ? "Copiado!" : "Copiar Link"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:block"><Footer /></div>
        </motion.div>
      </div>

      {/* Sticky buy bar (mobile) */}
      <StickyBuyBar
        price={listing.price}
        originalPrice={originalPrice}
        onBuy={handleBuy}
        triggerRef={buyBoxRef}
      />
    </div>
  );
}
