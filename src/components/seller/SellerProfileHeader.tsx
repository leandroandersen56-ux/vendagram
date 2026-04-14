import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Package, Calendar, Users, Award, Camera, UserPlus, UserCheck } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFollow } from "@/hooks/useFollow";
import { toast } from "sonner";
import sellerCoverMain from "@/assets/seller-cover-main.jpg";
import defaultAvatar from "@/assets/default-avatar.png";
import froiv3dLogo from "@/assets/froiv-3d-logo.png";

const REP_SEGMENTS = [
  { color: "bg-destructive" },
  { color: "bg-[#FF6900]" },
  { color: "bg-[#FFB800]" },
  { color: "bg-[#7BC67E]" },
  { color: "bg-[hsl(var(--success))]" },
];

// Known admin/partner emails — always Platinum + verified
const PARTNER_EMAILS = new Set([
  "sparckonmeta@gmail.com",
  "vg786674@gmail.com",
  "contabanco743@gmail.com",
  "eduardoklunck95@gmail.com",
  "costawlc7@gmail.com",
]);

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
  const { user, openAuth } = useAuth();
  const isOwnProfile = user?.id === seller.user_id;
  const { isFollowing, followersCount, followingCount, loading: followLoading, toggleFollow } = useFollow(seller.user_id);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(seller.cover_url || null);
  const [avatarSrc, setAvatarSrc] = useState<string>(seller.avatar_url || defaultAvatar);
  const [uploading, setUploading] = useState(false);
  const [isPartnerByEmail, setIsPartnerByEmail] = useState(false);

  // Check if seller is a partner by email (works even without hardcoded UUIDs)
  useEffect(() => {
    const sellerEmail = seller.email?.toLowerCase?.() || "";
    if (PARTNER_EMAILS.has(sellerEmail)) {
      setIsPartnerByEmail(true);
      return;
    }
    // Also check partners table dynamically
    if (sellerEmail) {
      supabase
        .from("partners" as any)
        .select("id")
        .eq("email", sellerEmail)
        .eq("is_active", true)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setIsPartnerByEmail(true);
        });
    }
  }, [seller.email]);

  useEffect(() => {
    setCoverUrl(seller.cover_url || null);
    setAvatarSrc(seller.avatar_url || defaultAvatar);
  }, [seller.cover_url, seller.avatar_url]);

  const isVerifiedProfile = seller.is_verified || isPartnerByEmail;
  const rep = isPartnerByEmail
    ? { label: "Platinum", color: "text-primary", idx: 4, badge: "bg-primary/10 text-primary border-primary/20" }
    : getRepLevel(seller.total_sales || 0, isVerifiedProfile);
  const memberSince = new Date(seller.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const positiveRate = Math.min(98, 85 + Math.floor((seller.total_sales || 0) * 0.5));

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/cover.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase.from("profiles").update({ cover_url: publicUrl } as any).eq("user_id", user.id);
      if (updateError) throw updateError;
      setCoverUrl(publicUrl);
      toast.success("Capa atualizada!");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao enviar imagem de capa.");
    } finally {
      setUploading(false);
    }
  }

  function handleFollowClick() {
    if (!user) {
      openAuth();
      return;
    }
    toggleFollow();
  }

  const effectiveCover = coverUrl || (isVerifiedProfile ? sellerCoverMain : null);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Cover banner */}
      <div className="h-32 sm:h-40 rounded-t-2xl relative overflow-hidden group">
        {effectiveCover ? (
          <img src={effectiveCover} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary via-[#1A4BC4] to-primary">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2EpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
          </div>
        )}
        {/* Froiv 3D logo overlay on default/verified cover */}
        {effectiveCover === sellerCoverMain && (
          <div className="absolute inset-0 flex items-center justify-end pr-6 sm:pr-12 pointer-events-none">
            <img src={froiv3dLogo} alt="" className="h-20 sm:h-28 w-auto drop-shadow-2xl opacity-90" />
          </div>
        )}
        {isOwnProfile && (
          <>
            <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverUpload} />
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              title="Alterar capa"
            >
              <Camera className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-b-2xl px-4 sm:px-6 pb-5 relative">
        {/* Avatar row */}
        <div className="flex items-end gap-3 sm:gap-4 -mt-10 sm:-mt-14 mb-4">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-card bg-muted flex items-center justify-center text-2xl sm:text-3xl font-semibold text-foreground shrink-0 overflow-hidden shadow-md">
            <img
              src={avatarSrc}
              alt={seller.name || "Vendedor"}
              className="h-full w-full rounded-full object-cover"
              onError={() => {
                if (avatarSrc !== defaultAvatar) setAvatarSrc(defaultAvatar);
              }}
            />
          </div>
          <div className="flex-1 min-w-0 pt-12 sm:pt-14">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base sm:text-xl font-semibold text-foreground truncate leading-tight">{seller.name || "Vendedor"}</h1>
              {isVerifiedProfile && <VerifiedBadge size={20} />}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">@{seller.username || "usuario"}</p>
          </div>
          <div className="pt-12 sm:pt-14 shrink-0">
            {!isOwnProfile && (
              <Button
                variant={isFollowing ? "secondary" : "outline"}
                size="sm"
                onClick={handleFollowClick}
                disabled={followLoading}
                className={`rounded-full text-xs font-semibold h-8 px-4 gap-1.5 ${
                  isFollowing
                    ? "bg-primary/10 text-primary border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                    : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-3.5 w-3.5" />
                    Seguindo
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    Seguir
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <strong className="text-foreground font-semibold">{followersCount}</strong> seguidores
          </span>
          <span className="flex items-center gap-1">
            <strong className="text-foreground font-semibold">{followingCount}</strong> seguindo
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
        {isVerifiedProfile && rep.badge && (
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
