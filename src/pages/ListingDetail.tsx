import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Shield, ShoppingCart, CheckCircle2, Clock, MessageCircle, Loader2, Copy, Check, BadgeCheck, Lock, Store, Eye } from "lucide-react";
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

      if (error || !data) { setLoading(false); return; }
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
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {/* Back */}
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Image */}
            <div>
              <div
                className="aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-card"
                style={{ background: `linear-gradient(145deg, ${platform.color}12, hsl(var(--card)))` }}
              >
                <div className="text-center">
                  <span className="text-[100px] block mb-2">{platform.icon}</span>
                  <p className="text-xs text-muted-foreground">Screenshots do vendedor</p>
                </div>
              </div>
            </div>

            {/* Right: All info */}
            <div>
              {/* Title */}
              <h1 className="text-2xl font-bold text-foreground leading-snug mb-2">{listing.title}</h1>

              {/* Trust badges row (Bonoxs style) */}
              <div className="flex items-center gap-4 mb-5">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded">
                  <Store className="h-3.5 w-3.5" /> Distribuidor oficial
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded">
                  <Lock className="h-3.5 w-3.5" /> Pagamento seguro
                </span>
              </div>

              {/* Separator */}
              <div className="border-t border-border mb-5" />

              {/* Feature flags as selectable-looking chips (like Bonoxs lattice grid) */}
              {featureFlags.length > 0 && (
                <div className="mb-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {featureFlags.map(([key]) => (
                      <div
                        key={key}
                        className="border border-[#FFD700]/40 bg-[#FFD700]/5 rounded px-3 py-2 flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#FFD700] flex-shrink-0" />
                        <span className="text-xs font-medium text-foreground">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info fields */}
              {infoFields.filter(([k]) => k !== "Preço original" && k !== "Itens").length > 0 && (
                <div className="mb-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {infoFields.filter(([k]) => k !== "Preço original" && k !== "Itens").map(([key, value]) => (
                      <div key={key} className="border border-border rounded-md px-3 py-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{key}</p>
                        <p className="text-sm font-semibold text-foreground">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items list */}
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

              {/* Description */}
              {listing.description && (
                <div className="mb-5 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Descrição</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
                </div>
              )}

              {/* Separator */}
              <div className="border-t border-border mb-5" />

              {/* Price */}
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-1">Preço</p>
                {originalPrice && (
                  <p className="text-sm text-muted-foreground line-through">R$ {originalPrice}</p>
                )}
                <p className="text-3xl font-display font-bold text-[#FFD700]">{formatBRL(listing.price)}</p>
              </div>

              {/* Buy button — yellow/primary like Bonoxs */}
              <Button
                variant="hero"
                className="w-full py-6 text-base font-bold rounded-md mb-3"
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

              {/* Share buttons */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <Button variant="outline" size="sm" className="text-xs border-border" onClick={handleWhatsAppShare}>
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" className="text-xs border-border" onClick={handleCopyLink}>
                  {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                  {copied ? "Copiado!" : "Copiar Link"}
                </Button>
              </div>

              {/* Separator */}
              <div className="border-t border-border mb-5" />

              {/* Trust + Seller row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Trust signals */}
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

                {/* Seller */}
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs">
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
    </div>
  );
}
