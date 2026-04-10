import { useState, useEffect, useCallback, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, Search, Loader2, Shield, CheckCircle2, Clock, Zap,
  Gamepad2, ChevronLeft, ChevronRight, SlidersHorizontal,
  Flame
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import PlatformIcon from "@/components/PlatformIcon";
import { PLATFORMS, MOCK_LISTINGS, type Listing } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from "embla-carousel-react";

import bannerHero1 from "@/assets/banner-hero-v8.jpg";
import bannerGamesSection from "@/assets/banner-roblox.jpg";
import bannerYoutube from "@/assets/banner-youtube-v4.jpg";
import bannerSocialFacebook from "@/assets/banner-facebook.jpg";
import bannerSocialTiktok from "@/assets/banners/banner-social-tiktok.jpg";
import bannerInstagram from "@/assets/banner-instagram.jpg";

import catMinecraft from "@/assets/categories/minecraft.jpg";
import catFreefire from "@/assets/categories/freefire.jpg";
import catClash from "@/assets/categories/clash-of-clans.jpg";
import catValorant from "@/assets/categories/valorant.jpg";
import catFortnite from "@/assets/categories/fortnite.jpg";
import catRoblox from "@/assets/categories/roblox.jpg";

const GAME_CATEGORIES = [
  { id: "free_fire", label: "Free Fire", img: catFreefire },
  { id: "valorant", label: "Valorant", img: catValorant },
  { id: "fortnite", label: "Fortnite", img: catFortnite },
  { id: "roblox", label: "Roblox", img: catRoblox },
  { id: "clash_royale", label: "Clash of Clans", img: catClash },
  { id: "other", label: "Minecraft", img: catMinecraft },
];

const BANNERS = [
  { img: bannerHero1, title: "Contas & Perfis\nDigitais", subtitle: "Redes sociais e jogos\ncom segurança e escrow", cta: "Explorar", link: "/marketplace", objectPosition: "right 40%" },
];

const QUICK_CATEGORIES = [
  { id: "youtube", label: "YouTube", icon: () => <PlatformIcon platformId="youtube" size={22} />, bg: "bg-[#FFE8E8]", color: "text-[#FF0000]" },
  { id: "instagram", label: "Instagram", icon: () => <PlatformIcon platformId="instagram" size={22} />, bg: "bg-[#FFE4F0]", color: "text-[#E1306C]" },
  { id: "facebook", label: "Facebook", icon: () => <PlatformIcon platformId="facebook" size={22} />, bg: "bg-[#E8F0FE]", color: "text-[#1877F2]" },
  { id: "tiktok", label: "TikTok", icon: () => <PlatformIcon platformId="tiktok" size={22} />, bg: "bg-[#F0F0F0]", color: "text-[#000]" },
  { id: "free_fire", label: "Free Fire", icon: () => <PlatformIcon platformId="free_fire" size={22} />, bg: "bg-[#FFF3E0]", color: "text-[#FF6F00]" },
  { id: "valorant", label: "Jogos", icon: Gamepad2, bg: "bg-primary-light", color: "text-primary" },
];

function SkeletonCard() {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="aspect-[4/3] skeleton-shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-3 skeleton-shimmer rounded w-full" />
        <div className="h-3 skeleton-shimmer rounded w-2/3" />
        <div className="h-4 skeleton-shimmer rounded w-1/2 mt-3" />
      </div>
    </div>
  );
}
function DestaquesCarousel({ items, loading }: { items: Listing[]; loading: boolean }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    slidesToScroll: 2,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const slides = loading ? Array(8).fill(null) : items;

  return (
    <div className="relative">
      <div className="overflow-hidden fade-edges -mx-1 px-1" ref={emblaRef}>
        <div className="flex gap-3 pb-2">
          {slides.map((listing, i) =>
            listing ? (
              <div key={listing.id} className="flex-shrink-0 min-w-0 w-[calc(50%-6px)] sm:w-[180px] md:w-[200px]">
                <ListingCard listing={listing} />
              </div>
            ) : (
              <div key={i} className="flex-shrink-0 min-w-0 w-[calc(50%-6px)] sm:w-[180px] md:w-[200px]">
                <SkeletonCard />
              </div>
            )
          )}
        </div>
      </div>
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-10 h-8 w-8 rounded-full bg-card shadow-md border border-border flex items-center justify-center hover:bg-muted transition"
        aria-label="Anterior"
      >
        <ChevronLeft className="h-4 w-4 text-txt-primary" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-10 h-8 w-8 rounded-full bg-card shadow-md border border-border flex items-center justify-center hover:bg-muted transition"
        aria-label="Próximo"
      >
        <ChevronRight className="h-4 w-4 text-txt-primary" />
      </button>
    </div>
  );
}

export default function Index() {
  const { isAuthenticated, openAuth } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    if (isAuthenticated) navigate("/vendedor/novo");
    else openAuth("/vendedor/novo");
  };

  useEffect(() => {
    const timer = setInterval(() => setBannerIdx((i) => (i + 1) % BANNERS.length), 4000);
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
          id: row.id, sellerId: row.seller_id, sellerName: "Vendedor",
          sellerRating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
          sellerSales: 0, platform: row.category, title: row.title,
          description: row.description || "", price: Number(row.price),
          status: row.status as Listing["status"], screenshots: row.screenshots || [],
          fields: (row.highlights && typeof row.highlights === "object" && !Array.isArray(row.highlights))
            ? (row.highlights as Record<string, string | number | boolean>) : {},
          createdAt: row.created_at,
        }));

        const GAME_PLATFORMS = ["free_fire", "valorant", "fortnite", "roblox", "clash_royale"];
        const isGamePlatform = (p: string) => GAME_PLATFORMS.includes(p);
        const dbGames = mapped.filter((l) => isGamePlatform(l.platform));
        const dbSocial = mapped.filter((l) => !isGamePlatform(l.platform));
        const existingIds = new Set(mapped.map((l) => String(l.id)));
        const gameFillers = MOCK_LISTINGS.filter((m) => isGamePlatform(m.platform) && !existingIds.has(String(m.id))).slice(0, Math.max(0, 5 - dbGames.length));
        const socialFillers = MOCK_LISTINGS.filter((m) => !isGamePlatform(m.platform) && !existingIds.has(String(m.id))).slice(0, Math.max(0, 5 - dbSocial.length));
        setListings([...mapped, ...gameFillers, ...socialFillers]);
      } else {
        setListings(MOCK_LISTINGS);
      }
      setLoading(false);
    };
    fetchListings();
  }, []);

  const filtered = useMemo(() => listings.filter((l) => {
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
  }), [listings, selectedPlatform, searchQuery, priceRange, minFollowers, sortBy]);

  const GAME_PLATFORMS = ['free_fire', 'valorant', 'fortnite', 'roblox', 'clash_royale'];
  const games = filtered.filter(l => GAME_PLATFORMS.includes(l.platform));

  // Individual platform arrays (priority order)
  const instagramListings = filtered.filter(l => l.platform === 'instagram');
  const tiktokListings = filtered.filter(l => l.platform === 'tiktok');
  const youtubeListings = filtered.filter(l => l.platform === 'youtube');
  const facebookListings = filtered.filter(l => l.platform === 'facebook');

  // Shuffle for "Destaques do Dia" only when filters/data actually change
  const shuffled = useMemo(() => [...filtered].sort(() => Math.random() - 0.5), [filtered]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* SEO H1 — visually hidden */}
      <h1 className="sr-only">Comprar Conta Instagram, TikTok, Free Fire, Valorant — Froiv Marketplace de Contas Digitais</h1>

      <div className="pt-14 pb-16 sm:pb-0">
        {/* === BANNER CAROUSEL === */}
        <section className="pt-3 md:pt-6">
          <div className="container mx-auto">
            <div className="relative overflow-hidden rounded-xl h-[180px] md:h-[340px]">
              {BANNERS.map((b, i) => (
                <div key={i} className={`absolute inset-0 transition-opacity duration-500 ${i === bannerIdx ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                  <img src={b.img} alt={b.title} className="w-full h-full object-cover" style={b.objectPosition ? { objectPosition: b.objectPosition } : undefined} {...(i === 0 ? {} : { loading: "lazy" as const })} />
                  <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 flex items-center pointer-events-none">
                    <div className="px-5 sm:px-8 md:px-12 max-w-sm md:max-w-lg">
                      <h2 className="text-white text-base sm:text-xl md:text-3xl lg:text-4xl font-semibold leading-tight whitespace-pre-line sm:whitespace-normal">{b.title}</h2>
                      <p className="text-white/80 text-[11px] sm:text-sm md:text-base lg:text-lg mt-1 md:mt-2 whitespace-pre-line">{b.subtitle}</p>
                      <Link to={b.link} className="pointer-events-auto">
                        <button className="mt-3 md:mt-4 text-[11px] sm:text-xs md:text-sm font-semibold text-white border border-white/40 rounded-lg px-3 md:px-5 py-1.5 md:py-2 hover:bg-white/10 transition-colors">
                          {b.cta} →
                        </button>
                      </Link>
                    </div>
                  </div>
                  {/* Progress bar */}
                  {i === bannerIdx && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20">
                      <motion.div
                        className="h-full bg-white/60"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4, ease: "linear" }}
                        key={bannerIdx}
                      />
                    </div>
                  )}
                </div>
              ))}

              <button onClick={() => goToBanner(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition z-10" aria-label="Banner anterior">
                <ChevronLeft className="h-4 w-4 text-white/80" />
              </button>
              <button onClick={() => goToBanner(1)} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition z-10" aria-label="Próximo banner">
                <ChevronRight className="h-4 w-4 text-white/80" />
              </button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {BANNERS.map((_, i) => (
                  <button key={i} onClick={() => setBannerIdx(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === bannerIdx ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} aria-label={`Banner ${i + 1}`} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* === QUICK CATEGORIES === */}
        <section className="py-4">
          <div className="container mx-auto">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide fade-edges py-1 px-1 md:justify-evenly md:gap-6">
              {QUICK_CATEGORIES.map((cat) => {
                const IconComp = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedPlatform(selectedPlatform === cat.id ? null : cat.id)}
                    className="flex flex-col items-center gap-1.5 min-w-[60px] group"
                  >
                    <div className={`h-[52px] w-[52px] rounded-full ${cat.bg} flex items-center justify-center transition-transform group-hover:scale-105 ${selectedPlatform === cat.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                      {typeof IconComp === 'function' && IconComp.length === 0 ? <IconComp /> : <IconComp className={`h-5 w-5 ${cat.color}`} />}
                    </div>
                    <span className={`text-[11px] font-semibold ${selectedPlatform === cat.id ? 'text-primary' : 'text-txt-secondary'}`}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* === CATEGORY TABS + FILTER === */}
        <section className="bg-card border-y border-border sticky top-14 z-30">
          <div className="container mx-auto">
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide h-10 md:justify-evenly">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`shrink-0 flex items-center gap-1 px-3 h-full text-[13px] font-semibold border-b-2 transition-colors ${showFilterMenu ? 'border-primary text-primary' : 'border-transparent text-txt-secondary hover:text-txt-primary'}`}
                aria-label="Filtros"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filtros
              </button>
              <button
                onClick={() => setSelectedPlatform(null)}
                className={`shrink-0 px-3 h-full text-[13px] font-semibold border-b-2 transition-colors ${!selectedPlatform ? 'border-primary text-primary' : 'border-transparent text-txt-secondary hover:text-txt-primary'}`}
              >
                Tudo
              </button>
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(selectedPlatform === p.id ? null : p.id)}
                  className={`shrink-0 px-3 h-full text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap ${selectedPlatform === p.id ? 'border-primary text-primary' : 'border-transparent text-txt-secondary hover:text-txt-primary'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Filter panel */}
        <section className={`bg-card border-b border-border ${showFilterMenu ? 'block' : 'hidden sm:block'}`}>
            <div className="container mx-auto py-4">
              <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-txt-hint">Ordenar por</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([
                      { key: "recent" as const, label: "Recentes" },
                      { key: "price_asc" as const, label: "Menor preço" },
                      { key: "price_desc" as const, label: "Maior preço" },
                    ]).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setSortBy(opt.key)}
                        className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${sortBy === opt.key ? 'bg-primary text-white' : 'bg-muted text-txt-primary hover:bg-border'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-txt-hint">Faixa de preço</p>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="Mín" value={priceRange[0] || ""} onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])} className="h-9 w-full text-xs bg-muted border-border" />
                    <span className="text-xs text-txt-hint">—</span>
                    <Input type="number" placeholder="Máx" value={priceRange[1] === 10000 ? "" : priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 10000])} className="h-9 w-full text-xs bg-muted border-border" />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-txt-hint">Seguidores mínimos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[{ value: 0, label: "Todos" }, { value: 1000, label: "1K+" }, { value: 5000, label: "5K+" }, { value: 10000, label: "10K+" }, { value: 50000, label: "50K+" }].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setMinFollowers(opt.value)}
                        className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${minFollowers === opt.value ? 'bg-primary text-white' : 'bg-muted text-txt-primary hover:bg-border'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end gap-2 md:pb-0 mt-4 md:mt-0">
                  <button
                    className="h-9 flex-1 md:flex-none md:px-5 text-[12px] font-medium rounded-lg border border-border bg-card text-txt-primary hover:bg-muted transition-colors"
                    onClick={() => { setSortBy("recent"); setPriceRange([0, 10000]); setMinFollowers(0); }}
                  >
                    Limpar
                  </button>
                  <button
                    className="h-9 flex-1 md:flex-none md:px-6 text-[12px] font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
                    onClick={() => setShowFilterMenu(false)}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </section>

        {/* Active filter pills */}
        {(selectedPlatform || sortBy !== "recent" || priceRange[0] > 0 || priceRange[1] < 10000 || minFollowers > 0) && (
          <div className="container mx-auto py-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedPlatform && (
                <span className="text-[11px] bg-primary-light text-primary px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  {PLATFORMS.find(p => p.id === selectedPlatform)?.name}
                  <button onClick={() => setSelectedPlatform(null)} className="ml-0.5 hover:opacity-70">✕</button>
                </span>
              )}
              {sortBy !== "recent" && (
                <span className="text-[11px] bg-primary-light text-primary px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  {sortBy === "price_asc" ? "Menor preço" : "Maior preço"}
                  <button onClick={() => setSortBy("recent")} className="ml-0.5 hover:opacity-70">✕</button>
                </span>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                <span className="text-[11px] bg-primary-light text-primary px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  R$ {priceRange[0]}–{priceRange[1] >= 10000 ? "∞" : priceRange[1]}
                  <button onClick={() => setPriceRange([0, 10000])} className="ml-0.5 hover:opacity-70">✕</button>
                </span>
              )}
              {minFollowers > 0 && (
                <span className="text-[11px] bg-primary-light text-primary px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  {minFollowers >= 1000 ? `${minFollowers / 1000}K+` : `${minFollowers}+`} seg.
                  <button onClick={() => setMinFollowers(0)} className="ml-0.5 hover:opacity-70">✕</button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* === DESTAQUES DO DIA === */}
        <section className="py-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-txt-primary flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-hot" /> Destaques do Dia
              </h2>
              <span className="text-[11px] font-semibold bg-hot text-white px-2.5 py-1 rounded-full">
                🔥 HOT
              </span>
            </div>
            <DestaquesCarousel items={loading ? [] : shuffled.slice(0, 10)} loading={loading} />
          </div>
        </section>

        {/* === LISTINGS BY CATEGORY === */}
        <section className="py-2">
          <div className="container mx-auto">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Array(6).fill(null).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length > 0 ? (
              <div className="space-y-6">

                {/* Instagram Banner */}
                <Link to="/marketplace?platform=instagram" className="block rounded-2xl overflow-hidden relative">
                  <img src={bannerInstagram} alt="Instagram" className="w-full h-[180px] md:h-[340px] object-cover" loading="lazy" />
                  <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 flex items-center">
                    <div className="px-5 sm:px-8 md:px-12 max-w-sm md:max-w-lg">
                      <h2 className="text-white text-base sm:text-xl md:text-3xl lg:text-4xl font-semibold leading-tight">Contas Instagram</h2>
                      <p className="text-white/80 text-[11px] sm:text-sm md:text-base lg:text-lg mt-1 md:mt-2 whitespace-pre-line">{"Perfis verificados, engajados\ne prontos para monetizar"}</p>
                      <span className="inline-block mt-2 md:mt-3 text-[11px] sm:text-xs md:text-sm font-semibold text-white border border-white/40 rounded-lg px-3 py-1 md:py-1.5 hover:bg-white/10 transition-colors">Explorar →</span>
                    </div>
                  </div>
                </Link>

                {/* === INSTAGRAM === */}
                {instagramListings.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[15px] font-semibold text-txt-primary flex items-center gap-2">
                        <PlatformIcon platformId="instagram" size={18} /> Contas Instagram
                      </h3>
                      <Link to="/marketplace?platform=instagram" className="text-[12px] text-primary font-semibold hover:underline flex items-center gap-1">
                        Ver todos <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:overflow-visible sm:pb-0">
                      {instagramListings.slice(0, isMobile ? 6 : 5).map((listing) => (
                        <div key={listing.id} className="flex-shrink-0 w-[calc(50%-6px)] sm:w-auto snap-start">
                          <ListingCard listing={listing} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TikTok Banner */}
                <Link to="/marketplace?platform=tiktok" className="block rounded-2xl overflow-hidden relative">
                  <img src={bannerSocialTiktok} alt="TikTok" className="w-full h-[180px] md:h-[340px] object-cover" loading="lazy" />
                  <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 flex items-center">
                    <div className="px-5 sm:px-8 md:px-12 max-w-sm md:max-w-lg">
                      <h2 className="text-white text-base sm:text-xl md:text-3xl lg:text-4xl font-semibold leading-tight">Contas TikTok</h2>
                      <p className="text-white/80 text-[11px] sm:text-sm md:text-base lg:text-lg mt-1 md:mt-2 whitespace-pre-line">{"Perfis com seguidores reais,\nlives liberadas e engajamento"}</p>
                      <span className="inline-block mt-2 md:mt-3 text-[11px] sm:text-xs md:text-sm font-semibold text-white border border-white/40 rounded-lg px-3 py-1 md:py-1.5 hover:bg-white/10 transition-colors">Explorar →</span>
                    </div>
                  </div>
                </Link>

                {/* === TIKTOK === */}
                {tiktokListings.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[15px] font-semibold text-txt-primary flex items-center gap-2">
                        <PlatformIcon platformId="tiktok" size={18} /> Contas TikTok
                      </h3>
                      <Link to="/marketplace?platform=tiktok" className="text-[12px] text-primary font-semibold hover:underline flex items-center gap-1">
                        Ver todos <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:overflow-visible sm:pb-0">
                      {tiktokListings.slice(0, isMobile ? 6 : 5).map((listing) => (
                        <div key={listing.id} className="flex-shrink-0 w-[calc(50%-6px)] sm:w-auto snap-start">
                          <ListingCard listing={listing} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* YouTube Banner */}
                <Link to="/marketplace?platform=youtube" className="block rounded-2xl overflow-hidden relative">
                  <img src={bannerYoutube} alt="YouTube" className="w-full h-[180px] md:h-[340px] object-cover" loading="lazy" />
                  <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 flex items-center">
                    <div className="px-5 sm:px-8 md:px-12 max-w-sm md:max-w-lg">
                      <h2 className="text-white text-base sm:text-xl md:text-3xl lg:text-4xl font-semibold leading-tight">Canais YouTube</h2>
                      <p className="text-white/80 text-[11px] sm:text-sm md:text-base lg:text-lg mt-1 md:mt-2 whitespace-pre-line">{"Canais monetizados, inscritos\ne audiência garantida"}</p>
                      <span className="inline-block mt-2 md:mt-3 text-[11px] sm:text-xs md:text-sm font-semibold text-white border border-white/40 rounded-lg px-3 py-1 md:py-1.5 hover:bg-white/10 transition-colors">Explorar →</span>
                    </div>
                  </div>
                </Link>

                {/* === YOUTUBE === */}
                {youtubeListings.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[15px] font-semibold text-txt-primary flex items-center gap-2">
                        <PlatformIcon platformId="youtube" size={18} /> Canais YouTube
                      </h3>
                      <Link to="/marketplace?platform=youtube" className="text-[12px] text-primary font-semibold hover:underline flex items-center gap-1">
                        Ver todos <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:overflow-visible sm:pb-0">
                      {youtubeListings.slice(0, isMobile ? 6 : 5).map((listing) => (
                        <div key={listing.id} className="flex-shrink-0 w-[calc(50%-6px)] sm:w-auto snap-start">
                          <ListingCard listing={listing} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facebook Banner */}
                <Link to="/marketplace?platform=facebook" className="block rounded-2xl overflow-hidden relative">
                  <img src={bannerSocialFacebook} alt="Facebook" className="w-full h-[180px] md:h-[340px] object-cover" loading="lazy" />
                  <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 flex items-center">
                    <div className="px-5 sm:px-8 md:px-12 max-w-sm md:max-w-lg">
                      <h2 className="text-white text-base sm:text-xl md:text-3xl lg:text-4xl font-semibold leading-tight">Páginas Facebook</h2>
                      <p className="text-white/80 text-[11px] sm:text-sm md:text-base lg:text-lg mt-1 md:mt-2 whitespace-pre-line">{"Páginas com seguidores,\nalcance e engajamento real"}</p>
                      <span className="inline-block mt-2 md:mt-3 text-[11px] sm:text-xs md:text-sm font-semibold text-white border border-white/40 rounded-lg px-3 py-1 md:py-1.5 hover:bg-white/10 transition-colors">Explorar →</span>
                    </div>
                  </div>
                </Link>

                {/* === FACEBOOK === */}
                {facebookListings.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[15px] font-semibold text-txt-primary flex items-center gap-2">
                        <PlatformIcon platformId="facebook" size={18} /> Páginas Facebook
                      </h3>
                      <Link to="/marketplace?platform=facebook" className="text-[12px] text-primary font-semibold hover:underline flex items-center gap-1">
                        Ver todos <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:overflow-visible sm:pb-0">
                      {facebookListings.slice(0, isMobile ? 6 : 5).map((listing) => (
                        <div key={listing.id} className="flex-shrink-0 w-[calc(50%-6px)] sm:w-auto snap-start">
                          <ListingCard listing={listing} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Games Section Banner */}
                <Link to="/marketplace?type=games" className="block rounded-2xl overflow-hidden relative">
                  <img
                    src={bannerGamesSection}
                    alt="Roblox"
                    className="w-full h-[180px] md:h-[340px] object-cover object-[center_35%]"
                    loading="lazy"
                  />
                  <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 flex items-center">
                    <div className="px-5 sm:px-8 md:px-12 max-w-sm md:max-w-lg">
                      <h2 className="text-white text-base sm:text-xl md:text-3xl lg:text-4xl font-semibold leading-tight">Contas Roblox</h2>
                      <p className="text-white/80 text-[11px] sm:text-sm md:text-base lg:text-lg mt-1 md:mt-2 whitespace-pre-line">{"Contas com Robux, itens raros\ne avatares exclusivos"}</p>
                      <span className="inline-block mt-2 md:mt-3 text-[11px] sm:text-xs md:text-sm font-semibold text-white border border-white/40 rounded-lg px-3 py-1 md:py-1.5 hover:bg-white/10 transition-colors">
                        Explorar →
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Game Categories Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[15px] font-semibold text-txt-primary flex items-center gap-2">
                      <Gamepad2 className="h-4 w-4 text-primary" /> Categorias de Jogos
                    </h3>
                    <Link to="/marketplace?type=games" className="text-[12px] text-primary font-semibold hover:underline flex items-center gap-1">
                      Ver todos <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 snap-x snap-mandatory fade-edges sm:grid sm:grid-cols-6 sm:overflow-visible sm:mx-0 sm:px-0" id="game-categories-scroll">
                      {GAME_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedPlatform(selectedPlatform === cat.id ? null : cat.id)}
                          className="flex-shrink-0 group w-[calc((100vw-2rem-24px)/3)] sm:w-auto snap-start"
                        >
                          <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden transition-all ${selectedPlatform === cat.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                            <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <span className="absolute bottom-2.5 left-0 right-0 text-center text-white text-[13px] font-semibold drop-shadow-lg">
                              {cat.label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => document.getElementById('game-categories-scroll')?.scrollBy({ left: -300, behavior: 'smooth' })}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-10 h-8 w-8 rounded-full bg-card shadow-md border border-border flex items-center justify-center hover:bg-muted transition sm:hidden"
                      aria-label="Anterior"
                    >
                      <ChevronLeft className="h-4 w-4 text-txt-primary" />
                    </button>
                    <button
                      onClick={() => document.getElementById('game-categories-scroll')?.scrollBy({ left: 300, behavior: 'smooth' })}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-10 h-8 w-8 rounded-full bg-card shadow-md border border-border flex items-center justify-center hover:bg-muted transition sm:hidden"
                      aria-label="Próximo"
                    >
                      <ChevronRight className="h-4 w-4 text-txt-primary" />
                    </button>
                  </div>
                </div>

                {games.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[15px] font-semibold text-txt-primary flex items-center gap-2">
                        <Gamepad2 className="h-4 w-4 text-primary" /> Contas de Jogos
                      </h3>
                      <Link to="/marketplace?type=games" className="text-[12px] text-primary font-semibold hover:underline flex items-center gap-1">
                        Ver todos <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:overflow-visible sm:pb-0">
                      {games.slice(0, isMobile ? 6 : 5).map((listing) => (
                        <div key={listing.id} className="flex-shrink-0 w-[calc(50%-6px)] sm:w-auto snap-start">
                          <ListingCard listing={listing} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="h-8 w-8 text-txt-hint mb-3 mx-auto" />
                <p className="text-sm font-semibold text-txt-primary mb-1">Nenhum anúncio encontrado</p>
                <p className="text-txt-hint text-xs mb-5">Seja o primeiro a anunciar!</p>
                <button onClick={handleSell} className="bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors">
                  Criar Anúncio
                </button>
              </div>
            )}
          </div>
        </section>

        {/* === HOW IT WORKS === */}
        <section className="py-8 bg-muted">
          <div className="container mx-auto">
            <h2 className="text-[16px] font-semibold text-txt-primary text-center mb-1">Como funciona</h2>
            <p className="text-[11px] text-txt-hint text-center mb-5">Compre contas digitais com segurança em 4 passos</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Search className="h-5 w-5" />, title: "Encontre", desc: "Busque a conta ideal no marketplace com filtros avançados", num: "1", color: "bg-primary" },
                { icon: <Shield className="h-5 w-5" />, title: "Compre", desc: "Pague com segurança via sistema Escrow protegido", num: "2", color: "bg-primary" },
                { icon: <CheckCircle2 className="h-5 w-5" />, title: "Verifique", desc: "Acesse e confira a conta antes de liberar o pagamento", num: "3", color: "bg-primary" },
                { icon: <Zap className="h-5 w-5" />, title: "Pronto!", desc: "Pagamento liberado ao vendedor automaticamente", num: "4", color: "bg-primary" },
              ].map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  viewport={{ once: true }}
                  className="relative bg-card rounded-2xl border border-border p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="absolute top-2.5 right-3 text-[10px] font-bold text-txt-hint/40">{step.num}</span>
                  <div className={`h-11 w-11 rounded-xl ${step.color} flex items-center justify-center text-white mb-3 shadow-sm`}>
                    {step.icon}
                  </div>
                  <h3 className="text-[13px] font-semibold text-txt-primary mb-1">{step.title}</h3>
                  <p className="text-[10px] text-txt-hint leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* === TRUST BANNER === */}
        <section className="py-8">
          <div className="container mx-auto">
            <div className="rounded-xl bg-muted/60 border border-border p-6 sm:p-8">
              <h2 className="text-center text-[15px] sm:text-lg font-semibold text-txt-primary mb-6">Por que escolher a Froiv?</h2>
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {[
                  { icon: <Shield className="h-5 w-5" />, value: "100%", label: "Escrow Seguro" },
                  { icon: <Clock className="h-5 w-5" />, value: "24h", label: "Garantia" },
                  { icon: <CheckCircle2 className="h-5 w-5" />, value: "10%", label: "Taxa Fixa" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">{stat.icon}</div>
                    <p className="text-[28px] font-semibold leading-none text-txt-primary">{stat.value}</p>
                    <p className="text-[11px] text-txt-hint font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Block */}
        <section className="bg-card border-t border-border">
          <div className="container mx-auto px-4 py-10">
            <h2 className="text-lg font-semibold text-foreground mb-4">Comprar Contas Digitais com Segurança</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground space-y-3">
              <p>
                O <strong>Froiv</strong> é o marketplace #1 do Brasil para <strong>comprar e vender contas digitais</strong> com total segurança. 
                Oferecemos proteção <strong>Escrow</strong> em todas as transações — o pagamento só é liberado ao vendedor após o comprador confirmar o recebimento da conta.
              </p>
              <p>
                Encontre as melhores ofertas para <strong>comprar conta Instagram</strong>, <strong>comprar conta TikTok</strong>, <strong>comprar conta Free Fire</strong>, 
                <strong>comprar conta Valorant</strong>, <strong>comprar conta Fortnite</strong>, <strong>comprar conta Roblox</strong>, <strong>comprar conta YouTube</strong> e 
                <strong>comprar conta Facebook</strong>. Contas verificadas, com seguidores reais, skins raras e itens exclusivos.
              </p>
              <p>
                Aceite pagamentos via <strong>Pix</strong> e cartão de crédito. Processo simples: busque, pague, verifique e pronto. 
                Suporte 24h, sistema de avaliações e disputa integrada para sua tranquilidade.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
