import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Loader2, Shield, CheckCircle2, Clock, Zap, Gamepad2, Smartphone, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import PlatformIcon from "@/components/PlatformIcon";
import { PLATFORMS, MOCK_LISTINGS, type Listing } from "@/lib/mock-data";
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

      if (!error && data && data.length > 0) {
        const mapped: Listing[] = data.map((row) => ({
          id: row.id,
          sellerId: row.seller_id,
          sellerName: "Vendedor",
          sellerRating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
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

        const GAME_PLATFORMS = ["free_fire", "valorant", "fortnite", "roblox", "clash_royale"];
        const isGamePlatform = (platformId: string) => GAME_PLATFORMS.includes(platformId);

        const dbGames = mapped.filter((l) => isGamePlatform(l.platform));
        const dbSocial = mapped.filter((l) => !isGamePlatform(l.platform));

        const neededGames = Math.max(0, 5 - dbGames.length);
        const neededSocial = Math.max(0, 5 - dbSocial.length);

        const existingIds = new Set(mapped.map((l) => String(l.id)));
        const gameFillers = MOCK_LISTINGS.filter((m) => isGamePlatform(m.platform) && !existingIds.has(String(m.id))).slice(0, neededGames);
        const socialFillers = MOCK_LISTINGS.filter((m) => !isGamePlatform(m.platform) && !existingIds.has(String(m.id))).slice(0, neededSocial);

        setListings([...mapped, ...gameFillers, ...socialFillers]);
      } else {
        setListings(MOCK_LISTINGS);
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      {/* Hero Banner */}
      <section className="pt-20 px-4 order-1 sm:order-1">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={bannerImg}
              alt="SafeTrade.GG"
              className="w-full h-[140px] sm:h-[340px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent">
              <div className="h-full flex items-center px-6 sm:px-10">
                <div className="max-w-lg">
                  <h1 className="text-xl sm:text-3xl lg:text-4xl font-display font-black text-foreground mb-2 leading-tight tracking-tight">
                    COMPRE E VENDA<br />
                    <span className="text-primary">CONTAS DIGITAIS</span><br />
                    COM SEGURANÇA
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4 hidden sm:block">
                    Marketplace com escrow automático. Sem riscos.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="hero" size="sm" className="text-xs h-9 px-5" onClick={handleSell}>
                      Vender Conta <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                    <Link to="/marketplace">
                      <Button variant="glass" size="sm" className="text-xs h-9 px-5">
                        Ver Marketplace
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Grid — full width cards */}
      <section className="py-8 px-4 border-b border-border order-3 sm:order-2">
        <div className="container mx-auto">
          <h2 className="text-base font-bold text-foreground mb-5 uppercase tracking-wide">Categorias</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {PLATFORMS.map((p) => (
              <Link to={`/marketplace?platform=${p.id}`} key={p.id}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="rounded-xl border border-border bg-card hover:border-primary/40 transition-all p-3 sm:p-5 flex items-center gap-2.5 sm:gap-3 group cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${p.color}08 0%, hsl(var(--card)) 100%)` }}
                >
                  <PlatformIcon platformId={p.id} size={24} className="sm:w-8 sm:h-8" />
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">Ver contas</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-10 px-4 border-b border-border order-4 sm:order-3">
        <div className="container mx-auto">
          <h2 className="text-base font-bold text-foreground mb-6 uppercase tracking-wide text-center">Como Funciona</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: <Search className="h-5 w-5 sm:h-6 sm:w-6" />, title: "Encontre", desc: "Busque contas por plataforma, preço e categoria" },
              { icon: <Shield className="h-5 w-5 sm:h-6 sm:w-6" />, title: "Compre Seguro", desc: "Pagamento via Pix retido em escrow automático" },
              { icon: <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />, title: "Verifique", desc: "Checklist passo a passo para validar a conta" },
              { icon: <Zap className="h-5 w-5 sm:h-6 sm:w-6" />, title: "Pronto!", desc: "Conta transferida e pagamento liberado ao vendedor" },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-xl p-3 sm:p-5 text-center"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
                  {step.icon}
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="py-8 px-4 order-2 sm:order-4">
        <div className="container mx-auto">
          {/* Header + Search + Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-base font-bold text-foreground uppercase tracking-wide">Anúncios Recentes</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border h-9 text-xs placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            <button
              onClick={() => setPlatform("all")}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                platform === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              Todas
            </button>
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                  platform === p.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
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
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-8">
              {(() => {
                const GAME_PLATFORMS = ['free_fire', 'valorant', 'fortnite', 'roblox', 'clash_royale'];
                const games = filtered.filter(l => GAME_PLATFORMS.includes(l.platform));
                const social = filtered.filter(l => !GAME_PLATFORMS.includes(l.platform));

                return (
                  <>
                    {games.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                            <Gamepad2 className="h-4 w-4 text-primary" /> Contas de Jogos
                          </h3>
                          {games.length > 5 && (
                            <Link to="/marketplace?type=games" className="text-xs text-primary hover:underline flex items-center gap-1">
                              Ver todos <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                          {games.slice(0, 5).map((listing) => (
                            <ListingCard key={listing.id} listing={listing} />
                          ))}
                        </motion.div>
                      </div>
                    )}
                    {social.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-primary" /> Redes Sociais
                          </h3>
                          {social.length > 5 && (
                            <Link to="/marketplace?type=social" className="text-xs text-primary hover:underline flex items-center gap-1">
                              Ver todos <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                          {social.slice(0, 5).map((listing) => (
                            <ListingCard key={listing.id} listing={listing} />
                          ))}
                        </motion.div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="h-8 w-8 text-muted-foreground mb-3 mx-auto" />
              <p className="text-sm font-medium text-foreground mb-1">Nenhum anúncio encontrado</p>
              <p className="text-muted-foreground text-xs mb-5">Seja o primeiro a anunciar!</p>
              <Button variant="hero" size="sm" onClick={handleSell}>Criar Anúncio</Button>
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-10 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: <Shield className="h-8 w-8" />, value: "100%", label: "Escrow Seguro" },
              { icon: <Clock className="h-8 w-8" />, value: "24h", label: "Garantia de Compra" },
              { icon: <CheckCircle2 className="h-8 w-8" />, value: "10%", label: "Taxa Transparente" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <div className="text-primary">{stat.icon}</div>
                <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
