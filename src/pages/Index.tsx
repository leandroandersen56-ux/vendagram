import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowRight, Search, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { PLATFORMS, type Listing } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const { isAuthenticated, openAuth } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");

  const handleSell = () => {
    if (isAuthenticated) {
      navigate("/painel/anuncios/novo");
    } else {
      openAuth("/painel/anuncios/novo");
    }
  };

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mapped: Listing[] = data.map((row) => ({
          id: row.id,
          sellerId: row.seller_id,
          sellerName: "Vendedor",
          sellerRating: 5.0,
          sellerSales: 0,
          platform: row.category,
          title: row.title,
          description: row.description || "",
          price: Number(row.price),
          status: row.status as Listing["status"],
          screenshots: row.screenshots || [],
          fields: (row.highlights && typeof row.highlights === "object" && !Array.isArray(row.highlights))
            ? (row.highlights as Record<string, string | number | boolean>)
            : {},
          createdAt: row.created_at,
        }));
        setListings(mapped);
      }
      setLoading(false);
    };
    fetchListings();
  }, []);

  const filtered = listings
    .filter((l) => {
      if (platform !== "all" && l.platform !== platform) return false;
      if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Banner compacto */}
      <section className="relative pt-24 pb-12 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(hsl(263 70% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(263 70% 50%) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-5">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Escrow Automático · 100% Seguro</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-4 text-foreground">
              Compre e venda contas{" "}
              <span className="text-gradient-primary">com segurança</span>
            </h1>

            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Marketplace com escrow automático. Sem intermediários, sem riscos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="hero" size="lg" className="px-8" onClick={handleSell}>
                Vender Minha Conta
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marketplace integrado */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border h-11"
            />
          </div>

          {/* Platform filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge
              className={`cursor-pointer transition-colors ${platform === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              onClick={() => setPlatform("all")}
            >
              Todas
            </Badge>
            {PLATFORMS.map((p) => (
              <Badge
                key={p.id}
                className={`cursor-pointer transition-colors ${platform === p.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                onClick={() => setPlatform(p.id)}
              >
                {p.icon} {p.name}
              </Badge>
            ))}
          </div>

          {/* Listings grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-lg font-medium text-foreground mb-2">Nenhum anúncio encontrado</p>
              <p className="text-muted-foreground text-sm mb-6">Seja o primeiro a anunciar!</p>
              <Button variant="hero" onClick={handleSell}>
                Criar Anúncio
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
