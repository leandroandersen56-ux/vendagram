import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Shield, Share2, ShoppingCart, CheckCircle2, Clock, MessageCircle, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatBRL, getPlatform } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuth } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      if (!id) return;
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setListing(data);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", data.seller_id)
        .single();

      if (profile) setSeller(profile);
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
            <p className="text-4xl mb-4">😕</p>
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
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Back */}
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Image area — 3 cols */}
            <div className="lg:col-span-3 space-y-4">
              {/* Main image / placeholder */}
              <div
                className="aspect-[4/3] rounded-xl border border-border overflow-hidden flex items-center justify-center"
                style={{ background: `linear-gradient(145deg, ${platform.color}18, ${platform.color}06)` }}
              >
                <div className="text-center">
                  <span className="text-8xl block mb-3">{platform.icon}</span>
                  <p className="text-xs text-muted-foreground">Screenshots do vendedor</p>
                </div>
              </div>

              {/* Details card — visible on desktop below image */}
              <div className="hidden lg:block bg-card border border-border rounded-xl p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Descrição</h3>
                  {listing.description ? (
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sem descrição</p>
                  )}
                </div>

                {/* Items list */}
                {itemsList && itemsList.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Itens Inclusos</h3>
                    <div className="grid grid-cols-2 gap-1.5">
                      {itemsList.map((item, i) => (
                        <p key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="text-primary text-xs">▸</span> {item}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Info + actions — 2 cols */}
            <div className="lg:col-span-2 space-y-4">
              {/* Title & badges */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-muted text-foreground border-0 text-xs">{platform.icon} {platform.name}</Badge>
                  <Badge className="bg-success/15 text-success border-0 text-xs">● Disponível</Badge>
                </div>
                <h1 className="text-xl font-bold text-foreground mb-1 leading-snug">{listing.title}</h1>

                {/* Mobile description */}
                <div className="lg:hidden mt-3">
                  {listing.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
                  )}
                </div>
              </div>

              {/* Info fields grid */}
              {infoFields.filter(([k]) => k !== "Preço original" && k !== "Itens").length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Detalhes</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {infoFields.filter(([k]) => k !== "Preço original" && k !== "Itens").map(([key, value]) => (
                      <div key={key} className="bg-muted/50 rounded-lg px-3 py-2.5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{key}</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature flags */}
              {featureFlags.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Inclusos</h3>
                  <div className="flex flex-wrap gap-2">
                    {featureFlags.map(([key]) => (
                      <span key={key} className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                        <CheckCircle2 className="h-3 w-3" /> {key}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile items */}
              {itemsList && itemsList.length > 0 && (
                <div className="lg:hidden bg-card border border-border rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Itens Inclusos</h3>
                  <div className="space-y-1.5">
                    {itemsList.map((item, i) => (
                      <p key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-primary text-xs">▸</span> {item}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & Buy */}
              <div className="bg-card border border-primary/20 rounded-xl p-5 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Preço</p>
                  {originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">R$ {originalPrice}</p>
                  )}
                  <p className="text-3xl font-display font-bold text-primary">{formatBRL(listing.price)}</p>
                </div>

                <Button
                  variant="hero"
                  className="w-full py-6 text-base font-bold"
                  size="lg"
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate(`/transaction/${listing.id}`);
                    } else {
                      openAuth(`/transaction/${listing.id}`);
                    }
                  }}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Comprar Agora
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-xs" onClick={handleWhatsAppShare}>
                    <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs" onClick={handleCopyLink}>
                    {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                    {copied ? "Copiado!" : "Copiar Link"}
                  </Button>
                </div>

                {/* Trust signals */}
                <div className="border-t border-border pt-3 space-y-2">
                  {[
                    { icon: <Shield className="h-3.5 w-3.5" />, text: "Escrow automático" },
                    { icon: <CheckCircle2 className="h-3.5 w-3.5" />, text: "Checklist de verificação" },
                    { icon: <Clock className="h-3.5 w-3.5" />, text: "24h para verificar a conta" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-primary">{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Seller */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                    {sellerName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{sellerName}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 text-warning fill-warning" />
                      {sellerRating} · {sellerSales} vendas
                    </div>
                  </div>
                  {sellerSales >= 5 && (
                    <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Verificado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
