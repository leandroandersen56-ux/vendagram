
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Loader2, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
  { value: "free_fire", label: "Free Fire" },
  { value: "valorant", label: "Valorant" },
  { value: "fortnite", label: "Fortnite" },
  { value: "roblox", label: "Roblox" },
  { value: "other", label: "Outros" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Mais relevante" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
  { value: "newest", label: "Mais recentes" },
];

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  // Filters
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    search();
  }, [query, selectedPlatforms, minPrice, maxPrice, sortBy]);

  const search = async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("listings")
        .select("*")
        .eq("status", "active");

      if (query) {
        q = q.textSearch("search_vector", query, { type: "websearch", config: "portuguese" });
      }

      if (selectedPlatforms.length > 0) {
        q = q.in("category", selectedPlatforms as any);
      }

      if (minPrice) q = q.gte("price", Number(minPrice));
      if (maxPrice) q = q.lte("price", Number(maxPrice));

      switch (sortBy) {
        case "price_asc": q = q.order("price", { ascending: true }); break;
        case "price_desc": q = q.order("price", { ascending: false }); break;
        case "newest": q = q.order("created_at", { ascending: false }); break;
        default: q = q.order("views_count", { ascending: false }); break;
      }

      q = q.limit(50);

      const { data, error } = await q;
      if (!error && data) setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchInput });
  };

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const clearFilters = () => {
    setSelectedPlatforms([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("relevance");
  };

  const activeFilterCount = selectedPlatforms.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Platforms */}
      <div>
        <p className="text-[13px] font-semibold text-[#111] mb-3">Plataforma</p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              onClick={() => togglePlatform(p.value)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                selectedPlatforms.includes(p.value)
                  ? "bg-primary text-white"
                  : "bg-[#F0F0F0] text-[#555]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-[13px] font-semibold text-[#111] mb-3">Faixa de preço</p>
        <div className="flex gap-3">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="R$ Mín"
            className="flex-1 h-10 px-3 rounded-lg border border-[#DDD] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="R$ Máx"
            className="flex-1 h-10 px-3 rounded-lg border border-[#DDD] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="text-[13px] font-semibold text-[#111] mb-3">Ordenar por</p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-[#DDD] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="text-[13px] text-destructive font-medium">
          Limpar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-4 pb-20">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar contas..."
            className="w-full h-11 pl-10 pr-4 rounded-full border border-[#DDD] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </form>

        {/* Header + filter trigger */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[16px] font-semibold text-[#111]">
              {query ? `Resultados para "${query}"` : "Todos os anúncios"}
            </h1>
            <p className="text-[12px] text-[#999]">{results.length} encontrados</p>
          </div>

          {/* Mobile filter sheet */}
          <div className="md:hidden">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#DDD] text-[13px] text-[#555]">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                  {activeFilterCount > 0 && (
                    <span className="ml-1 h-5 w-5 rounded-full bg-primary text-white text-[11px] flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-4 pb-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active filter pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedPlatforms.map((p) => {
              const pl = PLATFORMS.find((x) => x.value === p);
              return (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-medium"
                >
                  {pl?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => togglePlatform(p)} />
                </span>
              );
            })}
            {minPrice && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-medium">
                Min: R$ {minPrice}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setMinPrice("")} />
              </span>
            )}
            {maxPrice && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-medium">
                Max: R$ {maxPrice}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setMaxPrice("")} />
              </span>
            )}
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop sidebar filters */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="bg-white rounded-xl border border-[#E8E8E8] p-5 sticky top-4">
              <h3 className="text-[14px] font-semibold text-[#111] mb-4">Filtros</h3>
              <FilterContent />
            </div>
          </div>

          {/* Results grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-20">
                <Search className="h-16 w-16 text-[#DDD] mx-auto mb-3" strokeWidth={1} />
                <p className="text-[#333] font-semibold">Nenhum resultado encontrado</p>
                <p className="text-[#999] text-sm mt-1">Tente buscar com outros termos ou remova filtros</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {results.map((listing, i) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <ListingCard
                      listing={{
                        id: listing.id,
                        title: listing.title,
                        price: listing.price,
                        platform: listing.category,
                        screenshots: listing.screenshots,
                        sellerId: listing.seller_id,
                        sellerName: "",
                        sellerRating: 0,
                        sellerSales: 0,
                        description: listing.description || "",
                        status: listing.status,
                        fields: listing.highlights || {},
                        createdAt: listing.created_at,
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
