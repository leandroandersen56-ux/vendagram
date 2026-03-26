import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import PlatformIcon from "@/components/PlatformIcon";
import { PLATFORMS, MOCK_LISTINGS, type Listing } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import bannerImg from "@/assets/banner-home.jpg";

// Horizontal carousel component
function Carousel({ title, children, linkTo }: { title: string; children: React.ReactNode; linkTo?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative group/carousel">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-bold text-white tracking-wide uppercase">{title}</h2>
        {linkTo && (
          <Link to={linkTo} className="text-[11px] text-primary hover:underline font-medium">
            Ver todos <ArrowRight className="inline h-3 w-3 ml-0.5" />
          </Link>
        )}
      </div>
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full w-8 bg-gradient-to-r from-[#0A0A0A] to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity flex items-center justify-start"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full w-8 bg-gradient-to-l from-[#0A0A0A] to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity flex items-center justify-end"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </button>
        <div ref={scrollRef} className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const { isAuthenticated, openAuth } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
      } else {
        // Fallback to mock data
        setListings(MOCK_LISTINGS);
      }
      setLoading(false);
    };
    fetchListings();
  }, []);

  // Group listings by platform
  const grouped = PLATFORMS.reduce<Record<string, Listing[]>>((acc, p) => {
    const items = listings.filter((l) => l.platform === p.id);
    if (items.length > 0) acc[p.id] = items;
    return acc;
  }, {});

  // Filtered for search
  const searchResults = search
    ? listings.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-16">
        <div className="relative overflow-hidden">
          <img
            src={bannerImg}
            alt="SafeTrade.GG"
            className="w-full h-[200px] sm:h-[320px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent flex items-center">
            <div className="px-6 sm:px-10 lg:px-16 max-w-md">
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-display font-black text-white mb-2 leading-tight tracking-tight">
                COMPRE E VENDA<br />
                <span className="text-primary">CONTAS DIGITAIS</span><br />
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

      {/* Search bar */}
      <section className="py-4 px-4 border-b border-neutral-800/50">
        <div className="container mx-auto">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input
              placeholder="Buscar conta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-neutral-900 border-neutral-800 h-10 text-sm placeholder:text-neutral-500 focus:border-primary/50 focus:ring-primary/20"
            />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : searchResults ? (
        /* Search results */
        <section className="py-6 px-4">
          <div className="container mx-auto">
            <h2 className="text-sm font-bold text-white mb-4">
              Resultados para "{search}" ({searchResults.length})
            </h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
                {searchResults.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="h-8 w-8 text-neutral-600 mb-3 mx-auto" />
                <p className="text-sm text-white mb-1">Nenhum resultado</p>
                <p className="text-neutral-500 text-xs">Tente outro termo de busca</p>
              </div>
            )}
          </div>
        </section>
      ) : (
        /* Categorized carousels */
        <div className="space-y-8 py-6">
          {/* Platform categories — horizontal scroll */}
          <section className="px-4">
            <div className="container mx-auto">
              <Carousel title="Mais Populares">
                {PLATFORMS.map((p) => (
                  <Link to={`/marketplace?platform=${p.id}`} key={p.id} className="shrink-0">
                    <div
                      className="w-[120px] h-[140px] rounded-lg overflow-hidden relative group cursor-pointer border border-neutral-800 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-2.5"
                      style={{ background: `linear-gradient(180deg, ${p.color}18 0%, #0A0A0A 100%)` }}
                    >
                      <PlatformIcon platformId={p.id} size={40} />
                      <span className="text-[11px] font-semibold text-neutral-300 group-hover:text-white transition-colors">{p.name}</span>
                    </div>
                  </Link>
                ))}
              </Carousel>
            </div>
          </section>

          {/* Listings grouped by platform — carousel per category */}
          {Object.entries(grouped).map(([platformId, items]) => {
            const platform = PLATFORMS.find((p) => p.id === platformId);
            if (!platform) return null;
            return (
              <section key={platformId} className="px-4">
                <div className="container mx-auto">
                  <Carousel
                    title={platform.name}
                    linkTo={`/marketplace?platform=${platformId}`}
                  >
                    {items.map((listing) => (
                      <div key={listing.id} className="shrink-0 w-[180px] sm:w-[200px]">
                        <ListingCard listing={listing} />
                      </div>
                    ))}
                  </Carousel>
                </div>
              </section>
            );
          })}

          {/* If no grouped listings, show all */}
          {Object.keys(grouped).length === 0 && (
            <section className="px-4">
              <div className="container mx-auto text-center py-16">
                <Search className="h-8 w-8 text-neutral-600 mb-3 mx-auto" />
                <p className="text-sm font-medium text-white mb-1">Nenhum anúncio ainda</p>
                <p className="text-neutral-500 text-xs mb-5">Seja o primeiro a anunciar!</p>
                <Button variant="hero" size="sm" onClick={handleSell}>Criar Anúncio</Button>
              </div>
            </section>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
