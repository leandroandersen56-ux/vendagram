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
import PlatformIcon from "@/components/PlatformIcon";
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

      {/* Banner */}
      <section className="pt-16">
        <div className="relative overflow-hidden">
          <img
            src={bannerImg}
            alt="SafeTrade.GG - Marketplace seguro de contas digitais"
            className="w-full h-[260px] sm:h-[360px] object-cover"
            width={1920}
            height={512}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/95 via-[#0D0D0D]/60 to-transparent flex items-center">
            <div className="px-6 sm:px-12 max-w-lg">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mb-3 leading-tight">
                COMPRE E VENDA<br />
                <span className="text-[#FFD700]">CONTAS DIGITAIS</span><br />
                COM SEGURANÇA
              </h1>
              <p className="text-sm text-muted-foreground mb-5 hidden sm:block">
                Marketplace com escrow automático. Sem riscos.
              </p>
              <Button variant="hero" size="sm" onClick={handleSell}>
                Vender Conta <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias carousel — estilo Bonoxs "Mais Populares" */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <h2 className="text-base font-bold text-foreground mb-4">Mais Populares</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {PLATFORMS.map((p) => (
              <Link to={`/marketplace?platform=${p.id}`} key={p.id}>
                <div className="min-w-[120px] h-[140px] rounded-lg overflow-hidden relative group cursor-pointer border border-border hover:border-[#FFD700]/30 transition-all" style={{ background: `linear-gradient(180deg, ${p.color}20, ${p.color}08)` }}>
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <PlatformIcon platformId={p.id} size={40} />
                    <span className="text-xs font-bold text-foreground">{p.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section className="pb-10 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <h2 className="text-base font-bold text-foreground">Anúncios Recentes</h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-muted border-border h-9 text-sm"
              />
            </div>
          </div>

          {/* Platform filter pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge
              className={`cursor-pointer transition-colors text-xs ${platform === "all" ? "bg-[#FFD700] text-[#0D0D0D]" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              onClick={() => setPlatform("all")}
            >
              Todas
            </Badge>
            {PLATFORMS.map((p) => (
              <Badge
                key={p.id}
                className={`cursor-pointer transition-colors text-xs inline-flex items-center gap-1 ${platform === p.id ? "bg-[#FFD700] text-[#0D0D0D]" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                onClick={() => setPlatform(p.id)}
              >
                <PlatformIcon platformId={p.id} size={14} /> {p.name}
              </Badge>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-[#FFD700]" />
            </div>
          ) : filtered.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
            >
              {filtered.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <Search className="h-10 w-10 text-muted-foreground mb-4 mx-auto" />
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
