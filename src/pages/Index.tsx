import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, Search, Loader2, Shield, CheckCircle2, Clock, Zap,
  Gamepad2, Smartphone, ChevronLeft, ChevronRight, Plus, SlidersHorizontal
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import PlatformIcon from "@/components/PlatformIcon";
import { PLATFORMS, MOCK_LISTINGS, type Listing } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";

import bannerHero1 from "@/assets/banners/banner-hero-1.jpg";
import bannerHero2 from "@/assets/banners/banner-hero-2.jpg";
import bannerHero3 from "@/assets/banners/banner-hero-3.jpg";

const BANNERS = [
  { img: bannerHero1, title: "Contas de Redes Sociais", subtitle: "Instagram, TikTok, YouTube e mais", cta: "Ver contas", link: "/marketplace?type=social" },
  { img: bannerHero2, title: "Contas de Jogos", subtitle: "Free Fire, Valorant, Fortnite e mais", cta: "Ver contas", link: "/marketplace?type=games" },
  { img: bannerHero3, title: "Compra 100% Segura", subtitle: "Pagamento protegido com escrow", cta: "Saiba mais", link: "/marketplace" },
];

export default function Index() {
  const { isAuthenticated, openAuth } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "price_asc" | "price_desc">("recent");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minFollowers, setMinFollowers] = useState<number>(0);

  const handleSell = () => {
    if (isAuthenticated) {
      navigate("/painel/anuncios/novo");
    } else {
      openAuth("/painel/anuncios/novo");
    }
  };

  // Auto-rotate banners
  useEffect(() => {
    const timer = setInterval(() => setBannerIdx((i) => (i + 1) % BANNERS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const goToBanner = useCallback((dir: number) => {
    setBannerIdx((i) => (i + dir + BANNERS.length) % BANNERS.length);
  }, []);

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
    if (selectedPlatform && l.platform !== selectedPlatform) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!l.title.toLowerCase().includes(q) && !l.description.toLowerCase().includes(q)) return false;
    }
    if (l.price < priceRange[0] || l.price > priceRange[1]) return false;
    if (minFollowers > 0) {
      const followers = Number(l.fields?.followers || l.fields?.seguidores || l.fields?.followers_count || 0);
      if (followers < minFollowers) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[hsl(var(--secondary))] flex flex-col">
      <Navbar />

      <div className="pt-14 md:pt-16">
        {/* === BANNER CAROUSEL === */}
        <section className="relative w-full">
          <div className="relative overflow-hidden aspect-[2.2/1] sm:aspect-[3/1] md:aspect-[3.5/1]">
            {BANNERS.map((b, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-500 ${i === bannerIdx ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              >
                <img
                  src={b.img}
                  alt={b.title}
                  className="w-full h-full object-cover"
                  {...(i === 0 ? {} : { loading: "lazy" as const })}
                />
                {/* Overlay with text */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-end sm:items-center">
                  <div className="container mx-auto px-4 pb-6 sm:pb-0">
                    <div className="max-w-md pl-6 sm:pl-10 md:pl-14">
                      <h2 className="text-white text-lg sm:text-2xl md:text-3xl font-bold leading-tight drop-shadow-lg">
                        {b.title}
                      </h2>
                      <p className="text-white/80 text-xs sm:text-sm mt-1 drop-shadow">{b.subtitle}</p>
                      <Link to={b.link}>
                        <Button size="sm" className="mt-3 bg-white text-foreground hover:bg-white/90 rounded-full text-xs font-semibold px-4 shadow-lg">
                          {b.cta} <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Nav arrows */}
            <button
              onClick={() => goToBanner(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition z-10"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-white/70" />
            </button>
            <button
              onClick={() => goToBanner(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition z-10"
            >
              <ChevronRight className="h-3.5 w-3.5 text-white/70" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {BANNERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setBannerIdx(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === bannerIdx ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* === SEARCH BAR (Home) === */}
        <section className="px-4 pt-3 pb-2 bg-background">
          <div className="container mx-auto">
            <div className="relative w-full">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar contas, jogos, redes sociais..."
                className="w-full bg-muted border-border h-11 pl-4 pr-11 text-sm placeholder:text-muted-foreground rounded-full"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <Search className="h-4 w-4" />
              </div>
            </div>
          </div>
        </section>

        {/* === PLATFORM NAV (horizontal scroll) === */}
        <section className="px-4 py-3 bg-background border-b border-border">
          <div className="container mx-auto">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1 md:justify-between">
              {/* Filter dropdown button */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowFilterMenu(!showFilterMenu); }}
                  className="flex flex-col items-center gap-1 min-w-[56px] group"
                >
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center transition-colors ${showFilterMenu ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground group-hover:bg-primary/10'}`}>
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-medium text-foreground whitespace-nowrap">Filtro</span>
                </button>

                {showFilterMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowFilterMenu(false)} />
                    <div className="absolute top-full left-0 mt-2 z-40 bg-background border border-border rounded-xl shadow-lg p-4 min-w-[260px] space-y-4">
                      {/* Ordenar */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Ordenar por</p>
                        <div className="flex flex-wrap gap-1.5">
                          {([
                            { key: "recent" as const, label: "Recentes" },
                            { key: "price_asc" as const, label: "Menor preço" },
                            { key: "price_desc" as const, label: "Maior preço" },
                          ]).map((opt) => (
                            <button
                              key={opt.key}
                              onClick={() => setSortBy(opt.key)}
                              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${sortBy === opt.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Faixa de preço */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Faixa de preço</p>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Mín"
                            value={priceRange[0] || ""}
                            onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                            className="h-8 text-xs w-full"
                          />
                          <span className="text-muted-foreground text-xs">—</span>
                          <Input
                            type="number"
                            placeholder="Máx"
                            value={priceRange[1] === 10000 ? "" : priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 10000])}
                            className="h-8 text-xs w-full"
                          />
                        </div>
                      </div>

                      {/* Seguidores mínimo */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Seguidores mínimos</p>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { value: 0, label: "Todos" },
                            { value: 1000, label: "1K+" },
                            { value: 5000, label: "5K+" },
                            { value: 10000, label: "10K+" },
                            { value: 50000, label: "50K+" },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setMinFollowers(opt.value)}
                              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${minFollowers === opt.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Aplicar / Limpar */}
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8"
                          onClick={() => { setSortBy("recent"); setPriceRange([0, 10000]); setMinFollowers(0); }}
                        >
                          Limpar
                        </Button>
                        <Button
                          variant="hero"
                          size="sm"
                          className="flex-1 text-xs h-8"
                          onClick={() => setShowFilterMenu(false)}
                        >
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Platform filters (local) */}
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(selectedPlatform === p.id ? null : p.id)}
                  className="flex flex-col items-center gap-1 min-w-[56px] group"
                >
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center transition-colors ${selectedPlatform === p.id ? 'bg-primary/15 ring-2 ring-primary' : 'bg-muted group-hover:bg-primary/10'}`}>
                    <PlatformIcon platformId={p.id} size={22} />
                  </div>
                  <span className={`text-[10px] font-medium whitespace-nowrap ${selectedPlatform === p.id ? 'text-primary' : 'text-foreground'}`}>{p.name}</span>
                </button>
              ))}
              <button
                onClick={handleSell}
                className="flex flex-col items-center gap-1 min-w-[56px] group"
              >
                <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium text-primary whitespace-nowrap">Vender</span>
              </button>
            </div>

            {/* Active filter indicator */}
            {selectedPlatform && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] bg-primary/10 text-primary px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  {PLATFORMS.find(p => p.id === selectedPlatform)?.name}
                  <button onClick={() => setSelectedPlatform(null)} className="ml-1 hover:text-primary/70">✕</button>
                </span>
              </div>
            )}
          </div>
        </section>

        {/* === FEATURED LISTINGS === */}
        <section className="px-4 py-4 bg-background">
          <div className="container mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : filtered.length > 0 ? (
              <div className="space-y-6">
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
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-primary" /> Redes Sociais
                            </h3>
                            <Link to="/marketplace?type=social" className="text-xs text-primary hover:underline flex items-center gap-1">
                              Ver todos <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                            {social.slice(0, 5).map((listing) => (
                              <ListingCard key={listing.id} listing={listing} />
                            ))}
                          </div>
                        </div>
                      )}

                      {games.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                              <Gamepad2 className="h-4 w-4 text-primary" /> Contas de Jogos
                            </h3>
                            <Link to="/marketplace?type=games" className="text-xs text-primary hover:underline flex items-center gap-1">
                              Ver todos <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                            {games.slice(0, 5).map((listing) => (
                              <ListingCard key={listing.id} listing={listing} />
                            ))}
                          </div>
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

        {/* === HOW IT WORKS === */}
        <section className="py-6 px-4 bg-background border-t border-border">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-base sm:text-lg font-bold text-foreground text-center mb-4">
              Como funciona
            </h2>
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {[
                { icon: <Search className="h-5 w-5" />, title: "Encontre", desc: "Busque contas", num: "1" },
                { icon: <Shield className="h-5 w-5" />, title: "Compre", desc: "Pix com escrow", num: "2" },
                { icon: <CheckCircle2 className="h-5 w-5" />, title: "Verifique", desc: "Valide a conta", num: "3" },
                { icon: <Zap className="h-5 w-5" />, title: "Pronto!", desc: "Pagamento liberado", num: "4" },
              ].map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    {step.icon}
                  </div>
                  <h3 className="text-[11px] sm:text-xs font-bold text-foreground">{step.title}</h3>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 leading-tight">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* === TRUST BANNER === */}
        <section className="py-6 px-4 bg-background">
          <div className="container mx-auto max-w-3xl">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-dark))] p-5 sm:p-8 text-white">
              <h2 className="text-center text-sm sm:text-lg font-bold mb-5">
                Por que escolher a Froiv?
              </h2>
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                {[
                  { icon: <Shield className="h-5 w-5" />, value: "100%", label: "Escrow Seguro" },
                  { icon: <Clock className="h-5 w-5" />, value: "24h", label: "Garantia" },
                  { icon: <CheckCircle2 className="h-5 w-5" />, value: "10%", label: "Taxa Fixa" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center gap-1.5 text-center">
                    <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center">
                      {stat.icon}
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs text-white/75">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
