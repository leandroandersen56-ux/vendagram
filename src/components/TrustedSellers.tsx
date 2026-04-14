import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ShieldCheck, Award } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { supabase } from "@/integrations/supabase/client";
import { getSellerProfilePath } from "@/lib/getSellerProfilePath";
import defaultAvatar from "@/assets/default-avatar.png";
import { TRUSTED_SELLER_LIST, getTrustedSellerByEmail } from "@/lib/trusted-sellers";

interface TrustedSeller {
  name: string;
  username: string | null;
  userId: string | null;
  email: string;
  avatar: string | null;
  sales: number;
  rating: number;
  profileIdentifier: string;
}

const SUPERADMIN_EMAIL = "sparckonmeta@gmail.com";

const STATIC_PARTNERS: TrustedSeller[] = TRUSTED_SELLER_LIST.map((seller) => ({
  name: seller.name,
  username: seller.username,
  userId: seller.userId,
  email: seller.email,
  avatar: seller.avatarUrl,
  sales: seller.sales,
  rating: seller.rating,
  profileIdentifier: seller.slug,
}));

function normalizeTrustedSeller(
  seller: Partial<TrustedSeller> & { email?: string; name?: string },
  fallback?: TrustedSeller
): TrustedSeller {
  const safeEmail = seller.email || fallback?.email || "parceiro@froiv.com";
  const emailUsername = safeEmail.split("@")[0] || "parceiro";

  return {
    name: seller.name || fallback?.name || "Vendedor confiável",
    username: seller.username || fallback?.username || emailUsername,
    userId: seller.userId || fallback?.userId || null,
    email: safeEmail,
    avatar: seller.avatar || fallback?.avatar || null,
    sales: typeof seller.sales === "number" ? seller.sales : (fallback?.sales ?? 0),
    rating:
      typeof seller.rating === "number" && seller.rating > 0
        ? seller.rating
        : (fallback?.rating ?? 4.8),
    profileIdentifier: seller.profileIdentifier || fallback?.profileIdentifier || seller.userId || seller.username || safeEmail,
  };
}

function TrustedSellerAvatar({ src, alt }: { src: string | null; alt: string }) {
  const [avatarSrc, setAvatarSrc] = useState(src || defaultAvatar);

  useEffect(() => {
    setAvatarSrc(src || defaultAvatar);
  }, [src]);

  return (
    <img
      src={avatarSrc}
      alt={alt}
      className="h-full w-full rounded-full object-cover"
      loading="lazy"
      onError={() => {
        if (avatarSrc !== defaultAvatar) setAvatarSrc(defaultAvatar);
      }}
    />
  );
}

export default function TrustedSellers() {
  const [sellers, setSellers] = useState<TrustedSeller[]>(STATIC_PARTNERS);
  const lastStableSellersRef = useRef<TrustedSeller[]>(STATIC_PARTNERS);

  useEffect(() => {
    let cancelled = false;

    console.log("[TrustedSellers] fallback ativado no primeiro render", STATIC_PARTNERS);

    async function load() {
      try {
        const CLOUD_URL = import.meta.env.VITE_SUPABASE_URL;
        const CLOUD_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        const { data: partnersData, error: partnersError } = await supabase
          .from("partners")
          .select("name, email")
          .eq("is_active", true);

        if (partnersError) {
          console.log("[TrustedSellers] erro ao buscar partners via client:", partnersError.message);
        }

        const activePartners = Array.isArray(partnersData)
          ? partnersData.filter(
              (p) => typeof p.email === "string" && p.email.toLowerCase() !== SUPERADMIN_EMAIL
            )
          : [];

        const partnerList = activePartners.length > 0
          ? activePartners
          : STATIC_PARTNERS.map((p) => ({ name: p.name, email: p.email }));

        console.log("[TrustedSellers] partners encontrados:", partnerList.length);

        const enrichedSellers = await Promise.all(
          partnerList.map(async (partner: { name?: string; email: string }) => {
            const knownSeller = getTrustedSellerByEmail(partner.email);

            if (knownSeller) {
              console.log("[TrustedSellers] fallback estável aplicado:", knownSeller.slug);
              return normalizeTrustedSeller(
                {
                  name: knownSeller.name,
                  username: knownSeller.username,
                  userId: knownSeller.userId,
                  email: knownSeller.email,
                  avatar: knownSeller.avatarUrl,
                  sales: knownSeller.sales,
                  rating: knownSeller.rating,
                  profileIdentifier: knownSeller.slug,
                },
                undefined
              );
            }

            try {
              const profileResponse = await fetch(`${CLOUD_URL}/functions/v1/admin-create-listing`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${CLOUD_KEY}`,
                },
                body: JSON.stringify({
                  action: "query",
                  table: "profiles",
                  filters: { email: partner.email },
                  select: "user_id,username,name,avatar_url,total_sales,avg_rating,email",
                }),
              });

              if (!profileResponse.ok) {
                throw new Error(`profile fetch failed: ${profileResponse.status}`);
              }

              const profileJson = await profileResponse.json();
              const profile = Array.isArray(profileJson.data) ? profileJson.data[0] : null;

              return normalizeTrustedSeller({
                name: profile?.name || partner.name,
                username: typeof profile?.username === "string" ? profile.username.trim() : null,
                userId: profile?.user_id || null,
                email: profile?.email || partner.email,
                avatar: profile?.avatar_url || null,
                sales: Number(profile?.total_sales || 0),
                rating: Number(profile?.avg_rating || 0),
                profileIdentifier: (typeof profile?.username === "string" && profile.username.trim()) || profile?.user_id || partner.email,
              });
            } catch (error) {
              console.log("[TrustedSellers] fallback por parceiro desconhecido", partner.email, error);
              return normalizeTrustedSeller({
                name: partner.name,
                email: partner.email,
              });
            }
          })
        );

        const safeSellers = enrichedSellers.filter(
          (seller) => Boolean(seller.email || seller.username || seller.userId)
        );

        if (!safeSellers.length) {
          console.log("[TrustedSellers] lista vazia após enrich; mantendo fallback atual");
          return;
        }

        console.log("[TrustedSellers] sellers carregados", safeSellers);
        lastStableSellersRef.current = safeSellers;

        if (!cancelled) {
          setSellers(safeSellers);
        }
      } catch (error) {
        console.error("[TrustedSellers] erro no fetch; mantendo estado atual", error);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleSellers = useMemo(() => {
    if (Array.isArray(sellers) && sellers.length > 0) {
      return sellers;
    }

    if (lastStableSellersRef.current.length > 0) {
      return lastStableSellersRef.current;
    }

    return STATIC_PARTNERS;
  }, [sellers]);

  return (
    <section className="py-4">
      <div className="container mx-auto">
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-txt-primary">
              <ShieldCheck className="h-4 w-4 text-primary" /> Vendedores Verificados
            </h2>
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              <Award className="h-3 w-3" /> Confiáveis
            </span>
          </div>

          <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {visibleSellers.map((seller, index) => {
              const stableKey = seller.userId || seller.username || seller.email || `trusted-seller-${index}`;
              const profileLink = getSellerProfilePath(seller.profileIdentifier) || "/marketplace";

              return (
                <Link
                  key={stableKey}
                  to={profileLink}
                  className="group w-[160px] flex-shrink-0 snap-start sm:w-auto"
                >
                  <div className="flex flex-col items-center rounded-xl border border-border bg-background p-4 text-center transition-all hover:border-primary/30 hover:shadow-sm">
                    <div className="relative mb-2.5">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-muted text-lg font-semibold text-foreground transition-colors group-hover:border-primary/40">
                        <img
                          src={seller.avatar || defaultAvatar}
                          alt={seller.name}
                          className="h-full w-full rounded-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <div className="mb-0.5 flex items-center gap-1">
                      <span className="max-w-[100px] truncate text-sm font-semibold text-foreground">
                        {seller.name}
                      </span>
                      <VerifiedBadge size={14} />
                    </div>
                    <span className="mb-2 text-[11px] text-muted-foreground">
                      @{seller.username || seller.email.split("@")[0]}
                    </span>

                    <span className="mb-2.5 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Froiv Platinum
                    </span>

                    <div className="flex w-full items-center justify-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-[#FFB800] text-[#FFB800]" />
                        <strong className="font-semibold text-foreground">
                          {seller.rating > 0 ? Number(seller.rating).toFixed(1) : "5.0"}
                        </strong>
                      </span>
                      <span className="h-3 w-px bg-border" />
                      <span>
                        <strong className="font-semibold text-foreground">{seller.sales}</strong> vendas
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
