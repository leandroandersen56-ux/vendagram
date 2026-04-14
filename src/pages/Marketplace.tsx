import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Loader2, ChevronDown, ArrowUpDown, CheckCircle2, DollarSign, CircleOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { PLATFORMS, type Listing } from "@/lib/mock-data";
import PlatformIcon from "@/components/PlatformIcon";
import { supabase } from "@/integrations/supabase/client";

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const GAME_PLATFORMS = ["free_fire", "valorant", "fortnite", "roblox", "clash_royale"];
  const initialPlatform = searchParams.get("platform") || (typeParam === "games" ? "games" : "all");
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState(initialPlatform);
  const [sortBy, setSortBy] = useState("recent");
  const [subFilter, setSubFilter] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Subcategory definitions per platform
  const SUBCATEGORIES: Record<string, { id: string; label: string; icon: React.ReactNode }[]> = {
    youtube: [
      { id: "monetizado", label: "Monetizado", icon: <DollarSign className="h-3.5 w-3.5" /> },
      { id: "nao_monetizado", label: "Não Monetizado", icon: <CircleOff className="h-3.5 w-3.5" /> },
    ],
    instagram: [
      { id: "verificado", label: "Verificado", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    ],
  };

  // Sync platform filter with URL
  useEffect(() => {
    const p = searchParams.get("platform");
    const t = searchParams.get("type");
    if (t === "games" && platform !== "games") setPlatform("games");
    else if (p && p !== platform) setPlatform(p);
  }, [searchParams]);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const stats = await fetchSellerStats(data.map((r) => r.seller_id));
        const mapped: Listing[] = data.map((row) => {
          const s = stats[row.seller_id];
          return {
            id: row.id,
            sellerId: row.seller_id,
            sellerName: s?.name || "Vendedor",
            sellerRating: s?.rating ?? 4.8,
            sellerSales: s?.sales ?? 0,
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
          };
        });
        setListings(mapped);
      }
      setLoading(false);
    };
    fetchListings();
  }, []);

  const activePlatform = PLATFORMS.find((p) => p.id === platform);

  // Dynamic SEO title
  useEffect(() => {
    const platformName = platform === "all" ? "" : activePlatform?.name || "";
    document.title = platform === "all"
      ? "Marketplace de Contas Digitais | Froiv"
      : `Comprar Conta ${platformName} — Preços e Ofertas | Froiv`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", platform === "all"
        ? "Explore contas de Instagram, TikTok, Free Fire, Valorant e mais. Compra segura com Escrow, pagamento via Pix e entrega imediata."
        : `Compre contas de ${platformName} com proteção Escrow. Melhores preços e entrega imediata no Froiv.`
      );
    }
  }, [platform, activePlatform]);

  const handlePlatformChange = (p: string) => {
    setPlatform(p);
    setSubFilter(null);
    if (p === "all") {
      searchParams.delete("platform");
      searchParams.delete("type");
    } else if (p === "games") {
      searchParams.delete("platform");
      searchParams.set("type", "games");
    } else {
      searchParams.set("platform", p);
      searchParams.delete("type");
    }
    setSearchParams(searchParams, { replace: true });
  };

  // Subcategory filter logic
  const matchesSubFilter = (l: Listing): boolean => {
    if (!subFilter) return true;
    const h = l.fields || {};
    if (subFilter === "monetizado") {
      const val = String(h["Monetizado"] ?? h["monetizado"] ?? h["Monetização"] ?? h["monetização"] ?? "").toLowerCase();
      return val.includes("sim") || val.includes("ativad") || val === "true";
    }
    if (subFilter === "nao_monetizado") {
      const val = String(h["Monetizado"] ?? h["monetizado"] ?? h["Monetização"] ?? h["monetização"] ?? "").toLowerCase();
      return val === "não" || val === "nao" || val === "" || val === "undefined" || val === "false";
    }
    if (subFilter === "verificado") {
      const val = h["Verificado"] ?? h["verificado"];
      return val === true || val === "true" || val === "Sim" || val === "sim";
    }
    return true;
  };

  // Shuffle listings once on load for random order
  const shuffledListings = useMemo(() => {
    const arr = [...listings];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [listings]);

  const filtered = shuffledListings
    .filter((l) => {
      if (platform === "games") {
        if (!GAME_PLATFORMS.includes(l.platform)) return false;
      } else if (platform !== "all" && l.platform !== platform) return false;
      if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (!matchesSubFilter(l)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16 sm:pb-0">
      <Navbar />

      <div className="flex-1">
        <div className="container mx-auto px-4 pt-20 sm:pt-24 pb-16">
          {/* Header with breadcrumb */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
              <span>/</span>
              <span className="text-foreground font-medium">
                {platform === "all" ? "Marketplace" : activePlatform?.name || "Marketplace"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              {platform === "all"
                ? "Todas as contas"
                : `Contas de ${activePlatform?.name || ""}` }
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
            </p>
          </div>

          {/* Search bar — always visible, prominent */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 bg-muted border-border rounded-xl h-11 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30 transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Platform filters — horizontal scroll on mobile */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-3">
            <button
              onClick={() => handlePlatformChange("all")}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
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
                onClick={() => handlePlatformChange(p.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
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

          {/* Subcategory filters */}
          <AnimatePresence>
            {SUBCATEGORIES[platform] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 pb-3">
                  <button
                    onClick={() => setSubFilter(null)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      !subFilter
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "bg-muted text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    Todos
                  </button>
                  {SUBCATEGORIES[platform].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSubFilter(subFilter === sub.id ? null : sub.id)}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        subFilter === sub.id
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "bg-muted text-muted-foreground hover:text-foreground border border-border"
                      }`}
                    >
                      {sub.icon}
                      {sub.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mb-4 py-2 border-b border-border">
            <p className="text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "anúncio" : "anúncios"}
              {platform !== "all" && ` em ${activePlatform?.name}`}
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-auto gap-1.5 border-0 bg-transparent h-auto p-0 text-xs text-muted-foreground hover:text-foreground shadow-none focus:ring-0">
                <ArrowUpDown className="h-3 w-3" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="price-asc">Menor preço</SelectItem>
                <SelectItem value="price-desc">Maior preço</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Search className="h-10 w-10 text-primary mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">Nenhum anúncio encontrado</p>
              <p className="text-muted-foreground text-sm mb-6">Tente alterar seus filtros ou busca</p>
              <Button variant="hero" onClick={() => { setSearch(""); handlePlatformChange("all"); }}>
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
