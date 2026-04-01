import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Shield, ShoppingCart, CheckCircle2, Clock, MessageCircle, Loader2, Copy, Check, BadgeCheck, Lock, Store, Eye, AlertCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
            id: mock.id,
            seller_id: mock.sellerId,
            category: mock.platform,
            title: mock.title,
            description: mock.description,
            price: mock.price,
            status: mock.status,
            screenshots: mock.screenshots,
            highlights: mock.fields,
          });
          setSeller({
            name: mock.sellerName,
            avg_rating: mock.sellerRating,
            total_sales: mock.sellerSales,
          });
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
    ? listing.highlights as Record<string, any>
    : {};

  const sellerName = seller?.name || "Vendedor";
  const sellerRating = seller?.avg_rating || 5.0;
  const sellerSales = seller?.total_sales || 0;

  const infoFields = Object.entries(highlights).filter(([_, v]) => typeof v === "string");
  const featureFlags = Object.entries(highlights).filter(([_, v]) => v === true);
  const itemsList = highlights["Itens"] as string[] | undefined;
  const originalPrice = highlights["Preço original"] as string | undefined;

  const handleWhatsAppShare = () => {
    const message = `🎮 ${listing.title} por ${formatBRL(listing.price)} 🔒 Compra segura: ${window.location.origin}/listing/${listing.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/listing/${listing.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {/* Back */}
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Images */}
            <div>
              {(() => {
                const coverImg = PLATFORM_COVERS[listing.category];
                const screenshots = (listing.screenshots || []).filter((s: string) => s);
                const allImages = coverImg ? [coverImg, ...screenshots] : screenshots;

                if (allImages.length === 0) {
                  return (
                    <div
                      className="aspect-square rounded-2xl overflow-hidden flex items-center justify-center bg-muted"
                    >
                      <div className="text-center">
                        <PlatformIcon platformId={listing.category} size={100} />
                        <p className="text-xs text-muted-foreground mt-3">Screenshots do vendedor</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    <div className="rounded-2xl overflow-hidden bg-muted">
                      <img
                        src={allImages[selectedImage] || allImages[0]}
                        alt={listing.title}
                        className="w-full h-auto block"
                      />
                    </div>
                    {allImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto">
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
                );
              })()}
            </div>

            {/* Right: All info */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-2xl font-display font-bold text-foreground leading-snug">{listing.title}</h1>
                {user && user.id === listing.seller_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => navigate(`/painel/anuncios/editar/${listing.id}`)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" /> Editar
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4 mb-5">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">
                  <Store className="h-3.5 w-3.5" /> Distribuidor oficial
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">
                  <Lock className="h-3.5 w-3.5" /> Pagamento seguro
                </span>
              </div>

              <div className="border-t border-border mb-5" />

              {featureFlags.length > 0 && (
                <div className="mb-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {featureFlags.map(([key]) => (
                      <div
                        key={key}
                        className="border border-primary/30 bg-primary-light rounded-xl px-3 py-2 flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="text-xs font-medium text-foreground">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {infoFields.filter(([k]) => k !== "Preço original" && k !== "Itens").length > 0 && (
                <div className="mb-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {infoFields.filter(([k]) => k !== "Preço original" && k !== "Itens").map(([key, value]) => (
                      <div key={key} className="border border-border rounded-xl px-3 py-2 bg-muted">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{key}</p>
                        <p className="text-sm font-semibold text-foreground">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {itemsList && itemsList.length > 0 && (
                <div className="mb-5">
                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Itens Inclusos</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {itemsList.map((item, i) => (
                        <p key={i} className="text-sm text-muted-foreground">▸ {item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {listing.description && (
                <div className="mb-5 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Descrição</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
                </div>
              )}

              <div className="border-t border-border mb-5" />

              {/* Price & Buy Box */}
              <div className="rounded-2xl border border-border p-5 shadow-sm bg-background mb-5">
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Preço</p>
                  {originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">R$ {originalPrice}</p>
                  )}
                  <p className="text-3xl font-display font-extrabold text-foreground">{formatBRL(listing.price)}</p>
                </div>

                <Button
                  variant="hero"
                  className="w-full py-6 text-base font-bold mb-3"
                  size="lg"
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate(`/checkout/${listing.id}`);
                    } else {
                      openAuth(`/checkout/${listing.id}`);
                    }
                  }}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Comprar Agora
                </Button>

                <Button
                  variant="outline"
                  className="w-full py-5 text-base font-semibold border-primary text-primary rounded-full hover:bg-primary-light"
                  size="lg"
                  onClick={() => {}}
                >
                  Fazer oferta
                </Button>

                {/* Trust row */}
                <div className="flex justify-around mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">🔒 Seguro</span>
                  <span className="flex items-center gap-1">⚡ Imediato</span>
                  <span className="flex items-center gap-1">↩ Garantia</span>
                </div>
              </div>

              {/* Share buttons */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <Button variant="outline" size="sm" className="text-xs border-border rounded-xl" onClick={handleWhatsAppShare}>
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" className="text-xs border-border rounded-xl" onClick={handleCopyLink}>
                  {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                  {copied ? "Copiado!" : "Copiar Link"}
                </Button>
              </div>

              <div className="border-t border-border mb-5" />

              {/* Trust + Seller row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {[
                    { icon: <Shield className="h-3 w-3" />, text: "Escrow automático" },
                    { icon: <CheckCircle2 className="h-3 w-3" />, text: "Verificação" },
                    { icon: <Clock className="h-3 w-3" />, text: "24h garantia" },
                  ].map((item) => (
                    <span key={item.text} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="text-primary">{item.icon}</span>
                      {item.text}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {sellerName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-none">{sellerName}</p>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Star className="h-2.5 w-2.5 text-warning fill-warning" />
                      {sellerRating} · {sellerSales} vendas
                      {sellerSales >= 5 && <CheckCircle2 className="h-2.5 w-2.5 text-primary ml-1" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />

      {/* Fixed bottom buy button on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-background/95 backdrop-blur border-t border-border sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Preço</p>
            <p className="text-lg font-display font-bold text-primary">{listing ? formatBRL(listing.price) : ''}</p>
          </div>
          <Button
            variant="hero"
            className="flex-1 max-w-[200px] py-5 text-sm font-bold"
            onClick={() => {
              if (!listing) return;
              if (isAuthenticated) {
                navigate(`/checkout/${listing.id}`);
              } else {
                openAuth(`/checkout/${listing.id}`);
              }
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Comprar Agora
          </Button>
        </div>
      </div>
    </div>
  );
}
