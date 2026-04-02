import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Search, Loader2, Shield, CheckCircle2, Clock, Zap, Gamepad2, Smartphone, AlertCircle, Plus, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import PlatformIcon from "@/components/PlatformIcon";
import { PLATFORMS, MOCK_LISTINGS, type Listing } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const { isAuthenticated, openAuth } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

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

  const filtered = listings
    .filter((l) => {
      if (platform !== "all" && l.platform !== platform) return false;
      if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-8 px-4 text-center order-1">
        <div className="container mx-auto max-w-3xl">
          {/* Tag pill */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-light text-primary text-xs font-semibold px-3 py-1 mb-4">
              ✦ Marketplace #1 de contas digitais
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-display font-extrabold text-foreground leading-tight"
          >
            Compre e venda contas com{" "}
            <span className="text-gradient-primary">total segurança</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-base mt-3 max-w-xl mx-auto"
          >
            Instagram, TikTok, YouTube, Free Fire e muito mais. Pagamento seguro e entrega imediata.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 justify-center flex-wrap mt-6"
          >
            <Link to="/marketplace">
              <Button variant="hero" className="px-6 py-3 shadow-md shadow-primary/20">
                Explorar contas <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-primary text-primary rounded-full px-6 py-3 font-semibold hover:bg-primary-light"
              onClick={handleSell}
            >
              Vender agora
            </Button>
          </motion.div>

          {/* Trust badges */}
          <div className="flex gap-4 justify-center flex-wrap mt-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">✓ Pagamento seguro</span>
            <span className="flex items-center gap-1">✓ Suporte 24h</span>
            <span className="flex items-center gap-1">✓ Entrega imediata</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 order-2">
        <div className="container mx-auto">
          <h2 className="font-display font-bold text-xl text-foreground mt-10 mb-4">Explorar por plataforma</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 md:grid md:grid-cols-6">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setPlatform(p.id); }}
                className={`min-w-[80px] flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  platform === p.id
                    ? "bg-primary-light border-primary"
                    : "bg-muted border-border hover:border-primary hover:bg-primary-light"
                }`}
              >
                <PlatformIcon platformId={p.id} size={32} />
                <span className="text-xs font-semibold text-foreground">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-10 sm:py-16 px-4 order-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-semibold px-3 py-1 mb-3">
              Simples e seguro
            </span>
            <h2 className="text-xl sm:text-3xl font-bold text-foreground font-display">
              Como funciona
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
              Em 4 passos simples você compra ou vende com total segurança
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            {[
              { icon: <Search className="h-5 w-5 sm:h-6 sm:w-6" />, title: "Encontre", desc: "Busque por plataforma e preço", num: "01" },
              { icon: <Shield className="h-5 w-5 sm:h-6 sm:w-6" />, title: "Compre", desc: "Pix retido em escrow", num: "02" },
              { icon: <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />, title: "Verifique", desc: "Valide a conta recebida", num: "03" },
              { icon: <Zap className="h-5 w-5 sm:h-6 sm:w-6" />, title: "Pronto!", desc: "Pagamento liberado", num: "04" },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="relative rounded-2xl bg-muted/60 border border-border p-4 sm:p-6 text-center group hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              >
                <span className="absolute top-3 right-3 text-[10px] sm:text-xs font-bold text-primary/25 font-display">
                  {step.num}
                </span>
                <div className="h-11 w-11 sm:h-14 sm:w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {step.icon}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1">{step.title}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="py-8 px-4 order-3">
        <div className="container mx-auto">
          <h2 className="font-display font-bold text-xl text-foreground mb-4">Contas em destaque</h2>

          {/* Search - mobile */}
          <div className="flex items-center gap-2 mb-3 sm:hidden">
            <div className="relative flex-1">
              <Input
                placeholder="Qual conta você está procurando?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-4 pr-10 bg-muted border-border h-11 rounded-full text-xs placeholder:text-muted-foreground/70"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1 mb-3">
              <button
                onClick={() => setPlatform("all")}
                className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-sm font-medium transition-all ${
                  platform === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                Todas
              </button>
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`shrink-0 inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-sm font-medium transition-all ${
                    platform === p.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  <PlatformIcon platformId={p.id} size={14} />
                  {p.name}
                </button>
              ))}
          </div>

          {/* Search desktop */}
          <div className="hidden sm:flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar anúncios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-muted border-border h-9 text-sm placeholder:text-muted-foreground rounded-xl"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`shrink-0 h-9 w-9 rounded-xl border flex items-center justify-center transition-all ${showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:text-foreground"}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-muted border border-border rounded-2xl"
            >
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-36 sm:w-44 bg-background border-border h-8 text-xs rounded-xl">
                  <SelectValue placeholder="Plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="inline-flex items-center gap-1.5">
                        <PlatformIcon platformId={p.id} size={14} />
                        {p.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 sm:w-44 bg-background border-border h-8 text-xs rounded-xl">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="price-asc">Menor preço</SelectItem>
                  <SelectItem value="price-desc">Maior preço</SelectItem>
                </SelectContent>
              </Select>

              {platform !== "all" && (
                <button onClick={() => setPlatform("all")} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Limpar
                </button>
              )}
            </motion.div>
          )}

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
                const SOCIAL_ORDER = ['instagram', 'tiktok', 'youtube', 'facebook', 'other'];
                const social = filtered
                  .filter(l => !GAME_PLATFORMS.includes(l.platform))
                  .sort((a, b) => {
                    const ai = SOCIAL_ORDER.indexOf(a.platform);
                    const bi = SOCIAL_ORDER.indexOf(b.platform);
                    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                  });

                return (
                  <>
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
      <section className="py-10 px-4 order-5">
        <div className="container mx-auto">
          <div className="rounded-2xl border border-border bg-muted p-5 sm:p-8">
            <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
              {[
                { icon: <Shield className="h-5 w-5 sm:h-7 sm:w-7" />, value: "100%", label: "Escrow Seguro" },
                { icon: <Clock className="h-5 w-5 sm:h-7 sm:w-7" />, value: "24h", label: "Garantia" },
                { icon: <CheckCircle2 className="h-5 w-5 sm:h-7 sm:w-7" />, value: "10%", label: "Taxa Fixa" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {stat.icon}
                  </div>
                  <p className="text-lg sm:text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="order-6 w-full"><Footer /></div>
    </div>
  );
}
