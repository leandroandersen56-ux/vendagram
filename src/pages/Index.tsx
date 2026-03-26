import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-16">
        <div className="relative overflow-hidden">
          <img
            src={bannerImg}
            alt="SafeTrade.GG"
            className="w-full h-[220px] sm:h-[320px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent flex items-center">
            <div className="px-6 sm:px-10 lg:px-16 max-w-md">
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-display font-black text-white mb-2 leading-tight tracking-tight">
                COMPRE E VENDA<br />
                <span className="text-[#FFFF00]">CONTAS DIGITAIS</span><br />
                COM SEGURANÇA
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mb-4 hidden sm:block">
                Marketplace com escrow automático. Sem riscos.
              </p>
              <Button variant="hero" size="sm" className="text-xs h-9 px-5" onClick={handleSell}>
                Vender Conta <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias — horizontal scroll como Bonoxs */}
      <section className="py-5 px-4 border-b border-neutral-800/50">
        <div className="container mx-auto">
          <h2 className="text-sm font-bold text-white mb-3 tracking-wide">Mais Populares</h2>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {PLATFORMS.map((p) => (
              <Link to={`/marketplace?platform=${p.id}`} key={p.id} className="shrink-0">
                <div
                  className="w-[100px] h-[110px] rounded-lg overflow-hidden relative group cursor-pointer border border-neutral-800 hover:border-[#FFFF00]/40 transition-all flex flex-col items-center justify-center gap-2"
                  style={{ background: `linear-gradient(180deg, ${p.color}12 0%, #0A0A0A 100%)` }}
                >
                  <PlatformIcon platformId={p.id} size={36} />
                  <span className="text-[10px] font-semibold text-neutral-300 group-hover:text-white transition-colors">{p.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-white tracking-wide">Anúncios Recentes</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-neutral-900 border-neutral-800 h-8 text-xs placeholder:text-neutral-500 focus:border-[#FFFF00]/50 focus:ring-[#FFFF00]/20"
              />
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            <button
              onClick={() => setPlatform("all")}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                platform === "all"
                  ? "bg-[#FFFF00] text-[#0A0A0A]"
                  : "bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700"
              }`}
            >
              Todas
            </button>
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                  platform === p.id
                    ? "bg-[#FFFF00] text-[#0A0A0A]"
                    : "bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700"
                }`}
              >
                <PlatformIcon platformId={p.id} size={12} />
                {p.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 animate-spin text-[#FFFF00]" />
            </div>
          ) : filtered.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5"
            >
              {filtered.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <Search className="h-8 w-8 text-neutral-600 mb-3 mx-auto" />
              <p className="text-sm font-medium text-white mb-1">Nenhum anúncio encontrado</p>
              <p className="text-neutral-500 text-xs mb-5">Seja o primeiro a anunciar!</p>
              <Button variant="hero" size="sm" onClick={handleSell}>Criar Anúncio</Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
