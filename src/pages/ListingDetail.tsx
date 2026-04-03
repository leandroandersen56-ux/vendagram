import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, Shield, ShoppingCart, CheckCircle2, Clock,
  MessageCircle, Loader2, Copy, Check, Lock, Store, AlertCircle, Edit,
  ChevronLeft, ChevronRight, Zap, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatBRL, getPlatform, PLATFORM_COVERS, MOCK_LISTINGS } from "@/lib/mock-data";
import PlatformIcon from "@/components/PlatformIcon";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuth } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-4">Anúncio não encontrado</p>
            <Link to="/marketplace"><Button variant="hero">Voltar ao Marketplace</Button></Link>
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

  const infoFields = Object.entries(highlights).filter(([_, v]) => typeof v === "string");
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

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length);

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <Navbar />

      <div className="container mx-auto px-4 pt-20 sm:pt-24 pb-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <span>/</span>
            <Link to="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
            <span>/</span>
            <Link to={`/marketplace?platform=${listing.category}`} className="hover:text-foreground transition-colors">{platform.name}</Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Left: Images (3 cols on desktop) */}
            <div className="lg:col-span-3">
              {allImages.length === 0 ? (
                <div className="aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <PlatformIcon platformId={listing.category} size={80} />
                    <p className="text-xs text-muted-foreground mt-3">Sem imagens</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Main image with carousel controls on mobile */}
                  <div className="relative rounded-2xl overflow-hidden bg-muted group">
                    <img
                      src={allImages[selectedImage] || allImages[0]}
                      alt={listing.title}
                      className="w-full h-auto block"
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity"
                        >
                          <ChevronLeft className="h-4 w-4 text-foreground" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="h-4 w-4 text-foreground" />
                        </button>
                        {/* Dots indicator on mobile */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
                          {allImages.map((_: string, i: number) => (
                            <div
                              key={i}
                              className={`h-1.5 rounded-full transition-all ${
                                selectedImage === i ? "w-4 bg-primary" : "w-1.5 bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    {/* Image counter */}
                    {allImages.length > 1 && (
                      <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] text-foreground font-medium">
                        {selectedImage + 1} / {allImages.length}
                      </div>
                    )}
                  </div>
                  {/* Thumbnails — desktop only */}
                  {allImages.length > 1 && (
                    <div className="hidden sm:flex gap-2 overflow-x-auto">
                      {allImages.map((img: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                            selectedImage === i ? "border-primary" : "border-border hover:border-primary/40"
                          }`}
                        >
                          <img src={img} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover object-top" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Description — below images on desktop */}
              <div className="hidden lg:block mt-6">
                <ProductDescription
                  description={listing.description}
                  itemsList={itemsList}
                  infoFields={infoFields}
                  featureFlags={featureFlags}
                />
              </div>
            </div>

            {/* Right: Product info + buy box (2 cols on desktop) */}
            <div className="lg:col-span-2">
              {/* Title + edit */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-lg sm:text-xl font-bold text-foreground leading-snug">{listing.title}</h1>
                {user && user.id === listing.seller_id && (
                  <Button
                    variant="outline" size="sm" className="shrink-0 text-xs"
                    onClick={() => navigate(`/painel/anuncios/editar/${listing.id}`)}
                  >
                    <Edit className="h-3 w-3 mr-1" /> Editar
                  </Button>
                )}
              </div>

              {/* Rating + seller */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                  <span className="text-sm font-medium text-foreground">{sellerRating}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {sellerSales} vendas
                </span>
                {sellerSales >= 5 && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Verificado
                  </span>
                )}
              </div>

              {/* Price box */}
              <div className="rounded-2xl border border-border p-4 sm:p-5 bg-background mb-4">
                {originalPrice && (
                  <p className="text-sm text-muted-foreground line-through mb-0.5">R$ {originalPrice}</p>
                )}
                <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                  {formatBRL(listing.price)}
                </p>
                <p className="text-xs text-success font-medium mb-4">
                  <Zap className="h-3 w-3 inline mr-0.5" /> Entrega imediata após confirmação
                </p>

                <Button
                  variant="hero"
                  className="w-full py-6 text-base font-bold mb-2.5 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200"
                  size="lg"
                  onClick={handleBuy}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" /> Comprar Agora
                </Button>

                <Button
                  variant="outline"
                  className="w-full py-4 text-sm font-semibold border-primary text-primary hover:bg-primary/5"
                  size="lg"
                  onClick={() => {}}
                >
                  Fazer oferta
                </Button>

                <div className="flex justify-around mt-4 pt-3 border-t border-border text-[10px] text-muted-foreground">
                  <span className="flex flex-col items-center gap-1">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Escrow seguro</span>
                  </span>
                  <span className="flex flex-col items-center gap-1">
                    <Zap className="h-4 w-4 text-primary" />
                    <span>Entrega imediata</span>
                  </span>
                  <span className="flex flex-col items-center gap-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Garantia 24h</span>
                  </span>
                </div>
              </div>

              {/* Feature flags + info fields */}
              {featureFlags.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {featureFlags.map(([key]) => (
                    <div key={key} className="border border-primary/20 bg-primary/5 rounded-xl px-3 py-2 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="text-xs font-medium text-foreground">{key}</span>
                    </div>
                  ))}
                </div>
              )}

              {infoFields.filter(([k]) => k !== "Preço original" && k !== "Itens").length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {infoFields.filter(([k]) => k !== "Preço original" && k !== "Itens").map(([key, value]) => (
                    <div key={key} className="border border-border rounded-xl px-3 py-2 bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{key}</p>
                      <p className="text-sm font-semibold text-foreground">{String(value)}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Seller card */}
              <div className="rounded-xl border border-border p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {sellerName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{sellerName}</p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-warning fill-warning" /> {sellerRating}
                      </span>
                      <span>· {sellerSales} vendas</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                    <Store className="h-3 w-3" /> Vendedor
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs border-border rounded-xl" onClick={handleShare}>
                  <Share2 className="h-3.5 w-3.5 mr-1.5" /> WhatsApp
                </Button>
                <Button variant="outline" size="sm" className="text-xs border-border rounded-xl" onClick={handleCopyLink}>
                  {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                  {copied ? "Copiado!" : "Copiar Link"}
                </Button>
              </div>

              {/* Description — mobile only (below buy box) */}
              <div className="lg:hidden mt-6">
                <ProductDescription
                  description={listing.description}
                  itemsList={itemsList}
                  infoFields={infoFields}
                  featureFlags={featureFlags}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="hidden sm:block"><Footer /></div>

      {/* Fixed bottom buy bar on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border sm:hidden safe-area-bottom">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="flex-1 min-w-0">
            {originalPrice && (
              <p className="text-[10px] text-muted-foreground line-through leading-none">R$ {originalPrice}</p>
            )}
            <p className="text-lg font-bold text-foreground leading-tight">{formatBRL(listing.price)}</p>
            <p className="text-[10px] text-success font-medium flex items-center gap-0.5 mt-0.5">
              <Shield className="h-3 w-3" /> Compra protegida
            </p>
          </div>
          <Button
            variant="hero"
            className="px-8 py-5 text-sm font-bold shadow-lg shadow-primary/30 active:scale-[0.97] transition-all"
            onClick={handleBuy}
          >
            Comprar Agora
          </Button>
        </div>
      </div>
    </div>
  );
}

// Sub-component
function ProductDescription({
  description, itemsList, infoFields, featureFlags,
}: {
  description?: string;
  itemsList?: string[];
  infoFields: [string, any][];
  featureFlags: [string, any][];
}) {
  if (!description && !itemsList?.length) return null;

  return (
    <div className="space-y-4">
      {description && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-2">Descrição do produto</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{description}</p>
        </div>
      )}
      {itemsList && itemsList.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-2">O que está incluído</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {itemsList.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

      <Footer />
    </div>
  );
}
