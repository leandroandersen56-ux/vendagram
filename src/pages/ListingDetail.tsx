import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, Shield, Edit, AlertCircle, Loader2,
  Share2, Heart, ChevronRight, CheckCircle2, Copy, Check, FileText, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatBRL, getPlatform } from "@/lib/mock-data";
import { getSellerProfilePath } from "@/lib/getSellerProfilePath";
import PlatformIcon from "@/components/PlatformIcon";
import { supabase } from "@/integrations/supabase/client";
import { fetchSellerProfile } from "@/lib/fetch-seller-profile";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { addToCart } from "@/pages/Cart";
import { useOffer } from "@/hooks/useOffer";
import OfferButton from "@/components/offers/OfferButton";

import ProductGallery from "@/components/pdp/ProductGallery";
import BuyBox from "@/components/pdp/BuyBox";
import TrustSignals from "@/components/pdp/TrustSignals";
import SellerCard from "@/components/pdp/SellerCard";
import AccountSpecs from "@/components/pdp/AccountSpecs";
import StickyBuyBar from "@/components/pdp/StickyBuyBar";
import ReviewSection from "@/components/pdp/ReviewSection";
import RelatedProducts from "@/components/pdp/RelatedProducts";
import PartialStars from "@/components/PartialStars";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuth } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = id ? isFavorite(id) : false;
  const [copied, setCopied] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);
  const { offer, loading: offerLoading, refetch: refetchOffer } = useOffer(id);

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
        const profile = await fetchSellerProfile({ user_id: data.seller_id });
        if (profile) setSeller(profile);
      }
      setLoading(false);
    }
    fetchListing();
  }, [id]);

  // Track view
  useEffect(() => {
    if (!listing?.id) return;
    const trackView = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        (supabase.from as any)("listing_views").insert({
          listing_id: listing.id,
          user_id: authUser.id,
          session_id: sessionStorage.getItem("froiv_session") || crypto.randomUUID(),
        }).then();
      }
    };
    trackView();
  }, [listing?.id]);

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

  const screenshots = (listing.screenshots || []).filter((s: string) => s);
  const allImages = screenshots;

  const officialUrl = `https://www.froiv.com/listing/${listing.id}`;
  const sellerProfilePath = getSellerProfilePath(seller?.username || seller?.user_id || listing?.seller_id);

  const handleShare = () => {
    const message = `🎮 ${listing.title}\n💰 ${formatBRL(listing.price)}\n🔒 Compra segura no Froiv by Top Login\n${officialUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(officialUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuy = (quantity: number = 1) => {
    if (listing) {
      addToCart({
        listingId: listing.id,
        title: listing.title,
        price: Number(listing.price) * quantity,
        category: listing.category,
        screenshot: listing.screenshots?.[0] || undefined,
      });
      toast.success("Adicionado ao carrinho!");
    }
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

      <div className="sm:pt-20" style={{ paddingTop: 'calc(64px + var(--pwa-banner-offset, 0px))' }}>
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

          <div className="container mx-auto px-4 sm:px-4 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-8">
              {/* Left column */}
              <div className="lg:col-span-3 space-y-4">
                {/* Gallery + Info unified card (mobile) */}
                <div className="lg:hidden bg-white rounded-xl border border-[hsl(var(--border))] overflow-hidden">
                  {/* Title & badges above gallery on mobile */}
                  <div className="px-4 pt-3 pb-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 mb-2 flex-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${PLATFORM_BADGE_COLORS[listing.category] || "bg-[hsl(var(--muted))] text-[hsl(var(--txt-primary))]"}`}>
                          {platform.name.toUpperCase()}
                        </span>
                        {sellerSales >= 5 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[hsl(var(--success-light))] text-[hsl(var(--success))]">
                            VERIFICADO
                          </span>
                        )}
                        {sellerSales >= 15 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[hsl(var(--hot-light))] text-[hsl(var(--hot))]">
                            MAIS VENDIDO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 -mt-1 -mr-1 shrink-0">
                        <button onClick={handleShare} className="p-1.5 rounded-full hover:bg-[hsl(var(--muted))] transition-colors" aria-label="Compartilhar">
                          <Share2 className="h-4.5 w-4.5 text-[hsl(var(--txt-hint))]" />
                        </button>
                        <motion.button
                          onClick={() => {
                            if (!isAuthenticated) { openAuth(); return; }
                            if (id) toggleFavorite(id);
                          }}
                          className="p-1.5 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
                          aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                          whileTap={{ scale: 1.3 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          <Heart className={`h-4.5 w-4.5 ${favorited ? "fill-red-500 text-red-500" : "text-[hsl(var(--txt-hint))]"}`} />
                        </motion.button>
                      </div>
                    </div>
                    <h1 className="text-lg font-semibold text-[hsl(var(--txt-primary))] leading-snug">{listing.title}</h1>
                    {listing.seller_id === "00000000-0000-0000-0000-000000000001" && (
                      <span className="inline-block mt-1 bg-black/80 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Anúncio Demo</span>
                    )}
                  </div>
                  <ProductGallery
                    images={allImages}
                    title={listing.title}
                    category={listing.category}
                    verified={sellerSales >= 5}
                    isDemo={listing.seller_id === "00000000-0000-0000-0000-000000000001"}
                  />
                  {/* Stars / sales / reviews line below gallery */}
                  <div className="px-4 pt-3 pb-0">
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[13px]">
                      <div className="flex items-center gap-1.5">
                        <PartialStars rating={sellerRating} size="h-3.5 w-3.5" />
                        <span className="font-semibold text-primary">{sellerRating.toFixed(1)}</span>
                      </div>
                      <span className="text-[hsl(var(--border))]">|</span>
                      <span className="text-[hsl(var(--txt-secondary))]">{sellerSales} vendas</span>
                      <span className="text-[hsl(var(--border))]">|</span>
                      <button className="text-primary font-medium hover:underline" onClick={() => sellerProfilePath ? navigate(sellerProfilePath) : toast.info("Vendedor sem perfil público")}>Ver avaliações →</button>
                    </div>
                  </div>

                  {/* Buy Box */}
                  <div ref={buyBoxRef} className="px-4 py-3 border-t border-[hsl(var(--border))]">
                    <BuyBox
                      price={listing.price}
                      originalPrice={originalPrice}
                      stock={(listing as any).stock || 1}
                      onBuy={handleBuy}
                      inline
                    />
                    <div className="mt-2.5">
                      <OfferButton
                        listing={{ ...listing, price: Number(listing.price) }}
                        offer={offer}
                        offerLoading={offerLoading}
                        onRefetch={refetchOffer}
                      />
                    </div>
                    <a
                      href="https://wa.me/5519988499681?text=Ol%C3%A1%2C%20tenho%20uma%20d%C3%BAvida%20sobre%20um%20produto%20na%20Froiv!"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-[52px] rounded-xl text-[16px] font-bold border-2 border-[#25D366] text-[#25D366] flex items-center justify-center gap-2 transition-colors hover:bg-[#25D366]/5 active:scale-[0.97] mt-2.5"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Fale conosco no WhatsApp
                    </a>
                  </div>

                  {/* Trust Signals inline */}
                  <div className="px-4 pb-4 pt-1 border-t border-[hsl(var(--border))]">
                    <TrustSignals inline />
                  </div>
                </div>

                {/* Gallery (desktop only) */}
                <div className="hidden lg:block">
                  <ProductGallery
                    images={allImages}
                    title={listing.title}
                    category={listing.category}
                    verified={sellerSales >= 5}
                    isDemo={listing.seller_id === "00000000-0000-0000-0000-000000000001"}
                  />
                </div>

                {/* Seller Card (mobile only) */}
                <div className="lg:hidden">
                  <SellerCard
                    name={sellerName}
                    rating={sellerRating}
                    sales={sellerSales}
                    avatarUrl={seller?.avatar_url || undefined}
                    isVerified={seller?.is_verified || false}
                    onViewProfile={() => sellerProfilePath ? navigate(sellerProfilePath) : toast.info("Vendedor sem perfil público")}
                    onMessage={() => toast.info("Inicie uma compra para conversar com o vendedor")}
                  />
                </div>

                {/* Account Specs */}
                <AccountSpecs infoFields={infoFields} featureFlags={featureFlags} />

                {/* Description */}
                {listing.description && (
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-white p-4">
                    <h3 className="text-sm font-semibold text-[hsl(var(--txt-primary))] mb-2 flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary" /> Descrição completa</h3>
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
                <ReviewSection sellerId={listing.seller_id} sellerName={sellerName} rating={sellerRating} totalSales={sellerSales} />

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
                  {/* Info + BuyBox + Trust unified card */}
                  <div className="bg-white rounded-xl border border-[hsl(var(--border))] overflow-hidden">
                    {/* Info block */}
                    <div className="p-4 pb-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${PLATFORM_BADGE_COLORS[listing.category] || "bg-[hsl(var(--muted))] text-[hsl(var(--txt-primary))]"}`}>
                          {platform.name.toUpperCase()}
                        </span>
                        {sellerSales >= 5 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[hsl(var(--success-light))] text-[hsl(var(--success))]">
                            VERIFICADO
                          </span>
                        )}
                        {sellerSales >= 15 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[hsl(var(--hot-light))] text-[hsl(var(--hot))]">
                            MAIS VENDIDO
                          </span>
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h1 className="text-[22px] font-semibold text-[hsl(var(--txt-primary))] leading-snug">
                            {listing.title}
                          </h1>
                          {listing.seller_id === "00000000-0000-0000-0000-000000000001" && (
                            <span className="inline-block mt-1 bg-black/80 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Anúncio Demo</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <motion.button
                            onClick={() => {
                              if (!isAuthenticated) { openAuth(); return; }
                              if (id) toggleFavorite(id);
                            }}
                            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
                            aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                            whileTap={{ scale: 1.3 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          >
                            <Heart className={`h-5 w-5 ${favorited ? "fill-red-500 text-red-500" : "text-[hsl(var(--txt-hint))]"}`} />
                          </motion.button>
                          {user && user.id === listing.seller_id && (
                            <Button
                              variant="outline" size="sm" className="shrink-0 text-xs rounded-lg"
                              onClick={() => navigate(`/vendedor/editar/${listing.id}`)}
                            >
                              <Edit className="h-3 w-3 mr-1" /> Editar
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2 text-[13px]">
                        <div className="flex items-center gap-1.5">
                          <PartialStars rating={sellerRating} size="h-3.5 w-3.5" />
                          <span className="font-semibold text-primary">{sellerRating.toFixed(1)}</span>
                        </div>
                        <span className="text-[hsl(var(--border))]">|</span>
                        <span className="text-[hsl(var(--txt-secondary))]">{sellerSales} vendas</span>
                        <span className="text-[hsl(var(--border))]">|</span>
                        <button className="text-primary font-medium hover:underline" onClick={() => sellerProfilePath ? navigate(sellerProfilePath) : toast.info("Vendedor sem perfil público")}>Ver avaliações →</button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 my-3 border-t border-[hsl(var(--border))]" />

                    {/* BuyBox inline */}
                    <div ref={buyBoxRef} className="px-4 pb-4">
                      <BuyBox
                        price={listing.price}
                        originalPrice={originalPrice}
                        stock={(listing as any).stock || 1}
                        onBuy={handleBuy}
                        inline
                      />
                      <div className="mt-2.5">
                        <OfferButton
                          listing={{ ...listing, price: Number(listing.price) }}
                          offer={offer}
                          offerLoading={offerLoading}
                          onRefetch={refetchOffer}
                        />
                      </div>
                      <a
                        href="https://wa.me/5519988499681?text=Ol%C3%A1%2C%20tenho%20uma%20d%C3%BAvida%20sobre%20um%20produto%20na%20Froiv!"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-[52px] rounded-xl text-[16px] font-bold border-2 border-[#25D366] text-[#25D366] flex items-center justify-center gap-2 transition-colors hover:bg-[#25D366]/5 active:scale-[0.97] mt-2.5"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Fale conosco no WhatsApp
                      </a>
                    </div>
                  </div>
                  <TrustSignals />
                  <SellerCard
                    name={sellerName}
                    rating={sellerRating}
                    sales={sellerSales}
                    avatarUrl={seller?.avatar_url || undefined}
                    isVerified={seller?.is_verified || false}
                    onViewProfile={() => sellerProfilePath ? navigate(sellerProfilePath) : toast.info("Vendedor sem perfil público")}
                    onMessage={() => toast.info("Inicie uma compra para conversar com o vendedor")}
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
