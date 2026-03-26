import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Loader2, Shield, CheckCircle2, Clock, Zap, Gamepad2, Smartphone, AlertCircle, Plus } from "lucide-react";
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
      {/* Hero Banner */}
      <section className="pt-16 sm:pt-20 px-3 sm:px-4 order-1">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
            <img
              src={bannerImg}
              alt="SafeTrade.GG"
              className="w-full h-[160px] sm:h-[340px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-transparent sm:from-background sm:via-background/70">
              <div className="h-full flex items-center px-4 sm:px-10">
                <div className="max-w-lg">
                  <h1 className="text-[15px] sm:text-3xl lg:text-4xl font-display font-black text-foreground mb-1 sm:mb-2 leading-[1.2] tracking-tight">
                    COMPRE E VENDA<br />
                    <span className="text-primary">CONTAS DIGITAIS</span><br />
                    COM SEGURANÇA
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4 hidden sm:block">
                    Marketplace com escrow automático. Sem riscos.
                  </p>
                  <div className="flex gap-2 sm:gap-3">
                    <Button variant="hero" size="sm" className="text-[10px] sm:text-xs h-7 sm:h-9 px-3 sm:px-5" onClick={handleSell}>
                      Vender Conta <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-1" />
                    </Button>
                    <Link to="/marketplace">
                      <Button variant="glass" size="sm" className="text-[10px] sm:text-xs h-7 sm:h-9 px-3 sm:px-5">
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


      {/* How it works */}
      <section className="py-6 px-4 border-b border-border order-4 sm:order-3">
        <div className="container mx-auto">
          <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide text-center">Como Funciona</h2>
          <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-2xl mx-auto">
            {[
              { icon: <Search className="h-4 w-4 sm:h-5 sm:w-5" />, title: "Encontre", desc: "Busque por plataforma e preço" },
              { icon: <Shield className="h-4 w-4 sm:h-5 sm:w-5" />, title: "Compre", desc: "Pix retido em escrow" },
              { icon: <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />, title: "Verifique", desc: "Valide a conta recebida" },
              { icon: <Zap className="h-4 w-4 sm:h-5 sm:w-5" />, title: "Pronto!", desc: "Pagamento liberado" },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-lg p-2 sm:p-3 text-center"
              >
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto mb-1.5 sm:mb-2">
                  {step.icon}
                </div>
                <h3 className="text-[10px] sm:text-xs font-bold text-foreground mb-0.5">{step.title}</h3>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="py-8 px-4 order-2 sm:order-4">
        <div className="container mx-auto">
          {/* Header + Search */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-base font-bold text-foreground uppercase tracking-wide whitespace-nowrap">Anúncios Recentes</h2>
            <div className="relative w-full max-w-[200px] sm:max-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border h-8 text-xs placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Filter pills — horizontal scroll on mobile */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setPlatform("all")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
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
                className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
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
      <section className="py-8 px-4 border-t border-border order-5">
        <div className="container mx-auto">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
            {[
              { icon: <Shield className="h-5 w-5 sm:h-8 sm:w-8" />, value: "100%", label: "Escrow Seguro" },
              { icon: <Clock className="h-5 w-5 sm:h-8 sm:w-8" />, value: "24h", label: "Garantia de Compra" },
              { icon: <CheckCircle2 className="h-5 w-5 sm:h-8 sm:w-8" />, value: "10%", label: "Taxa Transparente" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 sm:gap-2">
                <div className="text-primary">{stat.icon}</div>
                <p className="text-lg sm:text-2xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="order-6 w-full"><Footer /></div>
    </div>
  );
}
