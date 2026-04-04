import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Loader2, ChevronDown, ArrowUpDown } from "lucide-react";
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
  const initialPlatform = searchParams.get("platform") || "all";
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState(initialPlatform);
  const [sortBy, setSortBy] = useState("recent");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync platform filter with URL
  useEffect(() => {
    const p = searchParams.get("platform");
    if (p && p !== platform) setPlatform(p);
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

  const handlePlatformChange = (p: string) => {
    setPlatform(p);
    if (p === "all") {
      searchParams.delete("platform");
    } else {
      searchParams.set("platform", p);
    }
    setSearchParams(searchParams, { replace: true });
  };

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

  const activePlatform = PLATFORMS.find((p) => p.id === platform);

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

          {/* Sort bar */}
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
