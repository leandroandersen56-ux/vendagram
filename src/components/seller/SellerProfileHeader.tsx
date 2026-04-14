import { motion } from "framer-motion";
import { Star, Package, Calendar, Users, Award } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Button } from "@/components/ui/button";
import sellerCoverMain from "@/assets/seller-cover-main.jpg";

const REP_SEGMENTS = [
  { color: "bg-destructive" },
  { color: "bg-[#FF6900]" },
  { color: "bg-[#FFB800]" },
  { color: "bg-[#7BC67E]" },
  { color: "bg-[hsl(var(--success))]" },
];

function getRepLevel(sales: number, isVerified: boolean) {
  if (!isVerified) return { label: "Novo", color: "text-muted-foreground", idx: 0 };
  if (sales >= 20) return { label: "Platinum", color: "text-primary", idx: 4, badge: "bg-primary/10 text-primary border-primary/20" };
  if (sales >= 10) return { label: "Gold", color: "text-[#FFB800]", idx: 3, badge: "bg-amber-50 text-amber-700 border-amber-200" };
  if (sales >= 5) return { label: "Silver", color: "text-muted-foreground", idx: 2, badge: "bg-muted text-muted-foreground border-border" };
  return { label: "Bronze", color: "text-[#FF6900]", idx: 1, badge: "bg-orange-50 text-orange-600 border-orange-200" };
}

interface Props {
  seller: any;
  listingsCount: number;
  avgRating: string;
  reviewsCount: number;
}

export default function SellerProfileHeader({ seller, listingsCount, avgRating, reviewsCount }: Props) {
  const rep = getRepLevel(seller.total_sales || 0, seller.is_verified);
  const memberSince = new Date(seller.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const positiveRate = Math.min(98, 85 + Math.floor((seller.total_sales || 0) * 0.5));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Cover banner */}
      <div className="h-32 sm:h-40 rounded-t-2xl relative overflow-hidden">
        {seller.is_verified ? (
          <img src={sellerCoverMain} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary via-[#1A4BC4] to-primary">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2EpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
          </div>
        )}
      </div>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-b-2xl px-4 sm:px-6 pb-5 relative">
        {/* Avatar row — overlaps banner */}
        <div className="flex items-end gap-3 sm:gap-4 -mt-10 sm:-mt-14 mb-4">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-card bg-muted flex items-center justify-center text-2xl sm:text-3xl font-semibold text-foreground shrink-0 overflow-hidden shadow-md">
            {seller.avatar_url ? (
              <img src={seller.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <span>{seller.name?.[0]?.toUpperCase() || "?"}</span>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-12 sm:pt-14">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base sm:text-xl font-semibold text-foreground truncate leading-tight">{seller.name || "Vendedor"}</h1>
              {seller.is_verified && <VerifiedBadge size={20} />}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">@{seller.username || "usuario"}</p>
          </div>
          <div className="pt-12 sm:pt-14 shrink-0">
            <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold border-primary text-primary hover:bg-primary/5 h-8 px-4">
              Seguir
            </Button>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <strong className="text-foreground font-semibold">{seller.total_sales || 0}</strong> vendas
          </span>
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            <strong className="text-foreground font-semibold">{listingsCount}</strong> anúncios
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Desde {memberSince}
          </span>
        </div>

        {seller.bio && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">{seller.bio}</p>
        )}

        {/* Reputation badge */}
        {seller.is_verified && rep.badge && (
          <div className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full border mb-3 ${rep.badge}`}>
            <Award className="h-3.5 w-3.5" />
            Froiv {rep.label}
            {rep.idx >= 3 && <span className="opacity-60">· É um dos melhores do site!</span>}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
          <div className="flex-1 text-center">
            <p className="text-base sm:text-lg font-semibold text-foreground">{seller.total_sales || 0}+</p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground">Vendas</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#FFB800] fill-[#FFB800]" />
              <p className="text-base sm:text-lg font-semibold text-foreground">{avgRating}</p>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground">{reviewsCount} avaliações</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex-1 text-center">
            <div className="flex gap-0.5 mx-auto max-w-[70px] sm:max-w-[80px] mb-1">
              {REP_SEGMENTS.map((seg, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${seg.color} ${i <= rep.idx ? "opacity-100" : "opacity-15"}`} />
              ))}
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground">{positiveRate}% positivas</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
