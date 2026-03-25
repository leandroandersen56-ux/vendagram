import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Shield, Share2, ShoppingCart, CheckCircle2, Clock, MessageCircle, Loader2 } from "lucide-react";
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

      // Fetch seller profile
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <p className="text-4xl mb-4">😕</p>
          <p className="text-foreground font-medium mb-4">Anúncio não encontrado</p>
          <Link to="/marketplace"><Button variant="hero">Voltar ao Marketplace</Button></Link>
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

  const handleWhatsAppShare = () => {
    const message = `🎮 ${listing.title} por ${formatBRL(listing.price)} 🔒 Compra segura: ${window.location.origin}/listing/${listing.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Separate features (boolean) from info fields (string values)
  const infoFields = Object.entries(highlights).filter(([_, v]) => typeof v === "string");
  const featureFlags = Object.entries(highlights).filter(([_, v]) => v === true);
  const itemsList = highlights["Itens"] as string[] | undefined;
  const originalPrice = highlights["Preço original"] as string | undefined;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Marketplace
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery placeholder */}
              <div className="aspect-video rounded-lg flex items-center justify-center border border-border" style={{ background: `linear-gradient(135deg, ${platform.color}15, ${platform.color}05)` }}>
                <div className="text-center">
                  <span className="text-7xl block mb-4">{platform.icon}</span>
                  <p className="text-sm text-muted-foreground">Screenshots do vendedor aparecerão aqui</p>
                </div>
              </div>

              {/* Details */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-muted text-foreground border-0">{platform.icon} {platform.name}</Badge>
                    <Badge className="bg-success/10 text-success border-0">Disponível</Badge>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-3">{listing.title}</h1>
                  {listing.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
                  )}
                </div>

                {/* Info fields (Seguidores, Nicho, Região, etc.) */}
                {infoFields.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Detalhes da Conta</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {infoFields.filter(([k]) => k !== "Preço original" && k !== "Itens").map(([key, value]) => (
                        <div key={key} className="bg-muted rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">{key}</p>
                          <p className="text-sm font-medium text-foreground">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items list */}
                {itemsList && itemsList.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Itens da Conta</h3>
                    <div className="space-y-1.5">
                      {itemsList.map((item, i) => (
                        <p key={i} className="text-sm text-muted-foreground">▸ {item}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feature flags */}
                {featureFlags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {featureFlags.map(([key]) => (
                      <span key={key} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">✅ {key}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 space-y-4 sticky top-24">
                <div className="text-center">
                  {originalPrice && (
                    <p className="text-sm text-muted-foreground line-through mb-1">R$ {originalPrice}</p>
                  )}
                  <p className="text-3xl font-display font-bold text-primary mb-1">{formatBRL(listing.price)}</p>
                  <p className="text-xs text-muted-foreground">+ 10% taxa de segurança (paga pelo vendedor)</p>
                </div>

                <Button
                  variant="hero"
                  className="w-full py-6 text-base"
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
                  Comprar com Segurança
                </Button>

                <Button variant="glass" className="w-full" onClick={handleWhatsAppShare}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Compartilhar no WhatsApp
                </Button>

                <Button variant="outline" className="w-full" onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/listing/${listing.id}`);
                }}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>

                <div className="space-y-3 pt-4 border-t border-border">
                  {[
                    { icon: <Shield className="h-4 w-4" />, text: "Escrow automático" },
                    { icon: <CheckCircle2 className="h-4 w-4" />, text: "Checklist de verificação" },
                    { icon: <Clock className="h-4 w-4" />, text: "24h para verificar" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-primary">{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Seller card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Vendedor</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {sellerName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{sellerName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 text-warning fill-warning" />
                      {sellerRating} · {sellerSales} vendas
                    </div>
                  </div>
                </div>
                {sellerSales >= 5 && (
                  <Badge className="bg-primary/10 text-primary border-0 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Vendedor Verificado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
