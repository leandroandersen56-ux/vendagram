import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowRight, Search, Loader2 } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { PLATFORMS, type Listing } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import bannerImg from "@/assets/banner-home.jpg";

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

  const filtered = listings.filter((l) => {
    if (platform !== "all" && l.platform !== platform) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Banner visual estilo Bonoxs */}
      <section className="pt-20 px-4">
        <div className="container mx-auto">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src={bannerImg}
              alt="SafeTrade.GG - Marketplace seguro de contas digitais"
              className="w-full h-[280px] sm:h-[340px] object-cover"
              width={1920}
              height={512}
            />
            {/* Overlay com texto */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent flex items-center">
              <div className="px-8 sm:px-12 max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/20 mb-4">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-primary font-medium">Escrow Automático</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mb-3 leading-tight">
                  COMPRE E VENDA<br />
                  <span className="text-gradient-primary">CONTAS DIGITAIS</span><br />
                  COM SEGURANÇA
                </h1>
                <p className="text-sm text-muted-foreground mb-5 hidden sm:block">
                  Marketplace com escrow automático. Sem riscos.
                </p>
                <div className="flex gap-3">
                  <Button variant="hero" size="sm" onClick={handleSell}>
                    Vender Conta <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias rápidas (carrossel horizontal) */}
      <section className="pt-6 pb-2 px-4">
        <div className="container mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {PLATFORMS.map((p) => (
              <Link to={`/marketplace?platform=${p.id}`} key={p.id}>
                <div className="flex flex-col items-center gap-2 min-w-[80px] px-3 py-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer group">
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">{p.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          {/* Header + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <h2 className="text-xl font-display font-bold text-foreground">Anúncios Recentes</h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card border-border h-10"
              />
            </div>
          </div>

          {/* Platform filter pills */}
          <div className="flex flex-wrap gap-2 mb-6">
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

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {filtered.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-lg font-medium text-foreground mb-2">Nenhum anúncio encontrado</p>
              <p className="text-muted-foreground text-sm mb-6">Seja o primeiro a anunciar!</p>
              <Button variant="hero" onClick={handleSell}>Criar Anúncio</Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
