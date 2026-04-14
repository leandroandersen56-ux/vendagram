import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ShieldCheck, Award } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { getSellerProfilePath } from "@/lib/getSellerProfilePath";
import defaultAvatar from "@/assets/default-avatar.png";

const SUPERADMIN_EMAIL = "sparckonmeta@gmail.com";

// Fallback estático — SEMPRE renderiza mesmo se toda busca falhar
const STATIC_PARTNERS: TrustedSeller[] = [
  { name: "ADM GB", username: "GB VENDAS", userId: null, email: "vg786674@gmail.com", avatar: null, sales: 0, rating: 4.8 },
  { name: "ADM GL", username: "contabanco", userId: null, email: "contabanco743@gmail.com", avatar: null, sales: 0, rating: 4.8 },
  { name: "Eduardo Klunck", username: "eduardo", userId: null, email: "eduardoklunck95@gmail.com", avatar: null, sales: 0, rating: 4.8 },
  { name: "Theus Klunck", username: "theus", userId: null, email: "costawlc7@gmail.com", avatar: null, sales: 0, rating: 4.8 },
];

interface TrustedSeller {
  name: string;
  username: string | null;
  userId: string | null;
  email: string;
  avatar: string | null;
  sales: number;
  rating: number;
}

export default function TrustedSellers() {
  // Inicia com fallback estático — cards SEMPRE visíveis desde o primeiro render
  const [sellers, setSellers] = useState<TrustedSeller[]>(STATIC_PARTNERS);

  useEffect(() => {
    async function load() {
      try {
        const CLOUD_URL = import.meta.env.VITE_SUPABASE_URL;
        const CLOUD_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        // Buscar parceiros ativos via edge function (bypass RLS)
        let partnerList: { name: string; email: string }[] = [];
        try {
          const pRes = await fetch(`${CLOUD_URL}/functions/v1/admin-create-listing`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${CLOUD_KEY}` },
            body: JSON.stringify({ action: "query", table: "partners", filters: { is_active: true }, select: "name, email" }),
          });
          const pJson = await pRes.json();
          if (pJson.data?.length) {
            partnerList = pJson.data.filter((p: any) => p.email.toLowerCase() !== SUPERADMIN_EMAIL);
          }
        } catch {
          // Se falhar, usa a lista estática
        }

        // Se não encontrou parceiros no banco, mantém o fallback
        if (!partnerList.length) {
          partnerList = STATIC_PARTNERS.map((p) => ({ name: p.name, email: p.email }));
        }

        // Enriquecer cada parceiro com dados do profile
        const enriched = await Promise.all(
          partnerList.map(async (partner) => {
            try {
              const res = await fetch(`${CLOUD_URL}/functions/v1/admin-create-listing`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${CLOUD_KEY}` },
                body: JSON.stringify({
                  action: "query",
                  table: "profiles",
                  filters: { email: partner.email },
                  select: "user_id,username,name,avatar_url,total_sales,avg_rating",
                }),
              });
              const json = await res.json();
              const profile = json.data?.[0] ?? null;
              return {
                name: profile?.name || partner.name,
                username: profile?.username || null,
                userId: profile?.user_id || null,
                email: partner.email,
                avatar: profile?.avatar_url || null,
                sales: profile?.total_sales || 0,
                rating: profile?.avg_rating || 4.8,
              };
            } catch {
              return {
                name: partner.name,
                username: null,
                userId: null,
                email: partner.email,
                avatar: null,
                sales: 0,
                rating: 4.8,
              };
            }
          })
        );

        setSellers(enriched);
      } catch (err) {
        console.error("Error enriching trusted sellers:", err);
        // Fallback já está no state — não faz nada
      }
    }
    load();
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
              const profileLink = getSellerProfilePath(seller.username || seller.userId || seller.email) ?? "/marketplace";
              return (
                <Link
                  key={seller.email}
                  to={profileLink}
                  className="flex-shrink-0 w-[160px] sm:w-auto snap-start group"
                >
                  <div className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all">
                    <div className="relative mb-2.5">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-foreground overflow-hidden border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                        <img
                          src={seller.avatar || defaultAvatar}
                          alt={seller.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-sm font-semibold text-foreground truncate max-w-[100px]">
                        {seller.name}
                      </span>
                      <VerifiedBadge size={14} />
                    </div>
                    <span className="text-[11px] text-muted-foreground mb-2">
                      @{seller.username || seller.email.split("@")[0]}
                    </span>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-2.5 bg-primary/10 text-primary border-primary/20">
                      Froiv Platinum
                    </span>

                    <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground w-full">
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-[#FFB800] fill-[#FFB800]" />
                        <strong className="text-foreground font-semibold">
                          {seller.rating > 0 ? Number(seller.rating).toFixed(1) : "5.0"}
                        </strong>
                      </span>
                      <span className="w-px h-3 bg-border" />
                      <span>
                        <strong className="text-foreground font-semibold">{seller.sales}</strong>{" "}vendas
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
