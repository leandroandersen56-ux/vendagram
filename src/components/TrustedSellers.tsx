import { Link } from "react-router-dom";
import { Star, ShieldCheck, Award } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";

const TRUSTED_SELLERS = [
  { name: "Sparckon", username: "sparckon", userId: "b78c563a-41eb-4933-9b4d-b53e3cd62dfb", avatar: "https://tqfvhfrbeolnvjpcfckl.supabase.co/storage/v1/object/public/avatars/sparckon-avatar.jpg", sales: 156, rating: 4.9, reviews: 47, badge: "Platinum" },
  { name: "ADM GB", username: "adm_gb", userId: "af11290b-014b-43db-aca1-ed1a12ab1707", avatar: null, sales: 89, rating: 4.8, reviews: 32, badge: "Platinum" },
  { name: "Costa", username: "costa_digital", userId: null, avatar: null, sales: 67, rating: 4.7, reviews: 24, badge: "Platinum" },
  { name: "Eduardo Klunck", username: "edu_accounts", userId: "d7f85dfb-0f1d-4c58-9a64-0544ec5b158d", avatar: null, sales: 54, rating: 4.8, reviews: 19, badge: "Platinum" },
  { name: "ADM GL", username: "contabanco", userId: "beccd2b1-0a31-4fd5-9701-4dce5eaa125c", avatar: null, sales: 42, rating: 4.6, reviews: 15, badge: "Platinum" },
];

const BADGE_STYLES: Record<string, string> = {
  Platinum: "bg-primary/10 text-primary border-primary/20",
  Gold: "bg-amber-50 text-amber-700 border-amber-200",
  Silver: "bg-muted text-muted-foreground border-border",
};

export default function TrustedSellers() {
  return (
    <section className="py-4">
      <div className="container mx-auto">
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-txt-primary flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" /> Vendedores Verificados
            </h2>
            <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1">
              <Award className="h-3 w-3" /> Confiáveis
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:overflow-visible sm:pb-0">
            {TRUSTED_SELLERS.map((seller) => {
              const profileLink = seller.userId ? `/vendedor/${seller.userId}` : "/marketplace";
              return (
                <Link
                  key={seller.username}
                  to={profileLink}
                  className="flex-shrink-0 w-[160px] sm:w-auto snap-start group"
                >
                  <div className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all">
                    {/* Avatar */}
                    <div className="relative mb-2.5">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-foreground overflow-hidden border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                        {seller.avatar ? (
                          <img src={seller.avatar} alt={seller.name} className="h-full w-full rounded-full object-cover" />
                        ) : (
                          <span>{seller.name[0].toUpperCase()}</span>
                        )}
                      </div>
                      <VerifiedBadge size={18} className="absolute -bottom-0.5 -right-0.5" />
                    </div>

                    {/* Name */}
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-sm font-semibold text-foreground truncate max-w-[120px]">{seller.name}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground mb-2">@{seller.username}</span>

                    {/* Badge */}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-2.5 ${BADGE_STYLES[seller.badge]}`}>
                      Froiv {seller.badge}
                    </span>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground w-full">
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-[#FFB800] fill-[#FFB800]" />
                        <strong className="text-foreground font-semibold">{seller.rating}</strong>
                      </span>
                      <span className="w-px h-3 bg-border" />
                      <span>
                        <strong className="text-foreground font-semibold">{seller.sales}</strong> vendas
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
