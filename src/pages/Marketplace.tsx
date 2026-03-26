import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { PLATFORMS, type Listing } from "@/lib/mock-data";
import PlatformIcon from "@/components/PlatformIcon";
import { supabase } from "@/integrations/supabase/client";

export default function Marketplace() {
  const [searchParams] = useSearchParams();
  const initialPlatform = searchParams.get("platform") || "all";
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState(initialPlatform);
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

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
          platform: row.category === "free_fire" ? "free_fire" : row.category,
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
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Marketplace</h1>
          <p className="text-muted-foreground mb-8">Encontre a conta perfeita com segurança garantida</p>

          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Button variant="glass" onClick={() => setShowFilters(!showFilters)} className="sm:w-auto">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-wrap gap-3 mb-6 p-4 bg-card border border-border rounded-lg"
            >
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-44 bg-muted border-border">
                  <SelectValue placeholder="Plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <PlatformIcon platformId={p.id} size={16} className="mr-1" /> {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 bg-muted border-border">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="price-asc">Menor preço</SelectItem>
                  <SelectItem value="price-desc">Maior preço</SelectItem>
                </SelectContent>
              </Select>

              {platform !== "all" && (
                <Button variant="ghost" size="sm" onClick={() => setPlatform("all")} className="text-muted-foreground">
                  <X className="h-3 w-3 mr-1" /> Limpar
                </Button>
              )}
            </motion.div>
          )}

          {/* Platform quick filters */}
          <div className="flex flex-wrap gap-2 mb-8">
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

          {/* Results */}
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
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-lg font-medium text-foreground mb-2">Nenhum anúncio encontrado</p>
              <p className="text-muted-foreground text-sm mb-6">Tente alterar seus filtros ou busca</p>
              <Button variant="hero" onClick={() => { setSearch(""); setPlatform("all"); }}>
                Limpar Filtros
              </Button>
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
