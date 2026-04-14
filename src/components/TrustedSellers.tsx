import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ShieldCheck, Award } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { supabase } from "@/integrations/supabase/client";
import defaultAvatar from "@/assets/default-avatar.png";

interface TrustedSeller {
  name: string;
  username: string;
  userId: string | null;
  email: string;
  avatar: string | null;
  sales: number;
  rating: number;
  badge: string;
}

// Fallback estático — usado enquanto carrega ou se a query falhar
const PARTNER_EMAILS = [
  { email: "vg786674@gmail.com", name: "ADM GB", fallbackUsername: "GB VENDAS" },
  { email: "contabanco743@gmail.com", name: "ADM GL", fallbackUsername: "contabanco" },
  { email: "eduardoklunck95@gmail.com", name: "Eduardo Klunck", fallbackUsername: "eduardo" },
  { email: "costawlc7@gmail.com", name: "Theus Klunck", fallbackUsername: "theus" },
];

const BADGE_STYLES: Record<string, string> = {
  Platinum: "bg-primary/10 text-primary border-primary/20",
  Gold: "bg-amber-50 text-amber-700 border-amber-200",
  Silver: "bg-muted text-muted-foreground border-border",
};

export default function TrustedSellers() {
  const [sellers, setSellers] = useState<TrustedSeller[]>(
    PARTNER_EMAILS.map((p) => ({
      name: p.name,
      username: p.fallbackUsername,
      userId: null,
      email: p.email,
      avatar: null,
      sales: 0,
      rating: 4.8,
      badge: "Platinum",
    }))
  );

  useEffect(() => {
    async function loadProfiles() {
      try {
        const emails = PARTNER_EMAILS.map((p) => p.email.toLowerCase());

        // Fetch profiles matching partner emails
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username, name, avatar_url, total_sales, avg_rating, email")
          .in("email", emails);

        const profileMap = new Map<string, any>();
        profiles?.forEach((p) => {
          if (p.email) profileMap.set(p.email.toLowerCase(), p);
        });

        setSellers(
          PARTNER_EMAILS.map((partner) => {
            const profile = profileMap.get(partner.email.toLowerCase());
            return {
              name: profile?.name || partner.name,
              username: profile?.username || partner.fallbackUsername,
              userId: profile?.user_id || null,
              email: partner.email,
              avatar: profile?.avatar_url || null,
              sales: profile?.total_sales || 0,
              rating: profile?.avg_rating || 4.8,
              badge: "Platinum",
            };
          })
        );
      } catch (err) {
        console.error("Error loading trusted sellers:", err);
      }
    }
    loadProfiles();
  }, []);

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

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
            {sellers.map((seller) => {
              const profileLink = seller.userId
                ? `/vendedor/${seller.userId}`
                : "/marketplace";
              return (
                <Link
                  key={seller.email}
                  to={profileLink}
                  className="flex-shrink-0 w-[160px] sm:w-auto snap-start group"
                >
                  <div className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all">
                    {/* Avatar */}
                    <div className="relative mb-2.5">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-foreground overflow-hidden border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                        <img
                          src={seller.avatar || defaultAvatar}
                          alt={seller.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      </div>
                      <VerifiedBadge size={18} className="absolute -bottom-0.5 -right-0.5" />
                    </div>

                    {/* Name */}
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-sm font-semibold text-foreground truncate max-w-[100px]">
                        {seller.name}
                      </span>
                      <VerifiedBadge size={14} />
                    </div>
                    <span className="text-[11px] text-muted-foreground mb-2">
                      @{seller.username}
                    </span>

                    {/* Badge */}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-2.5 ${BADGE_STYLES[seller.badge]}`}
                    >
                      Froiv {seller.badge}
                    </span>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground w-full">
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-[#FFB800] fill-[#FFB800]" />
                        <strong className="text-foreground font-semibold">
                          {seller.rating > 0 ? Number(seller.rating).toFixed(1) : "5.0"}
                        </strong>
                      </span>
                      <span className="w-px h-3 bg-border" />
                      <span>
                        <strong className="text-foreground font-semibold">
                          {seller.sales}
                        </strong>{" "}
                        vendas
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
