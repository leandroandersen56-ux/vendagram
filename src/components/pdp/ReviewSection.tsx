import { Star, ThumbsUp, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReviewSectionProps {
  sellerId: string;
  sellerName: string;
  rating: number;
  totalSales: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
}

const DEMO_REVIEWER_NAMES: Record<string, string> = {
  "aaaaaaaa-0001-4000-8000-000000000001": "Lucas Silva",
  "aaaaaaaa-0001-4000-8000-000000000002": "Maria Oliveira",
  "aaaaaaaa-0001-4000-8000-000000000003": "Pedro Santos",
  "aaaaaaaa-0001-4000-8000-000000000004": "Ana Costa",
  "aaaaaaaa-0001-4000-8000-000000000005": "Rafael Mendes",
  "aaaaaaaa-0001-4000-8000-000000000006": "Juliana Ferreira",
};

export default function ReviewSection({ sellerId, sellerName, rating, totalSales }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, reviewer_id")
        .eq("reviewed_id", sellerId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        const reviewerIds = [...new Set(data.map((r) => r.reviewer_id))];
        const { data: profiles } = await supabase
          .from("public_profiles")
          .select("user_id, name")
          .in("user_id", reviewerIds);

        const nameMap: Record<string, string> = {};
        profiles?.forEach((p) => { nameMap[p.user_id] = p.name || "Usuário"; });

        setReviews(data.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          reviewer_name: nameMap[r.reviewer_id] || DEMO_REVIEWER_NAMES[r.reviewer_id] || "Usuário",
        })));
      }
      setLoading(false);
    };
    fetchReviews();
  }, [sellerId]);

  // Calculate distribution from real reviews
  const totalReviews = reviews.length;
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    return { stars, pct: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0 };
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-white overflow-hidden">
      <div className="px-4 py-3.5">
        <h3 className="text-sm font-semibold text-[hsl(var(--txt-primary))] flex items-center gap-1.5">
          <User className="h-4 w-4 text-primary" /> Avaliações do vendedor
        </h3>
        <p className="text-[11px] text-[hsl(var(--txt-hint))] mt-0.5">Opiniões de compradores sobre {sellerName}</p>
      </div>

      <div className="px-4 pb-4">
        {/* Rating summary */}
        <div className="flex items-start gap-5 mb-4">
          <div className="text-center">
            <p className="text-4xl font-semibold text-[hsl(var(--txt-primary))]">{rating.toFixed(1)}</p>
            <div className="flex gap-0.5 mt-1 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-[hsl(var(--border))]"}`}
                />
              ))}
            </div>
            <p className="text-[11px] text-[hsl(var(--txt-hint))] mt-1">{totalReviews || totalSales} avaliações</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {distribution.map(({ stars, pct }) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-[11px] text-[hsl(var(--txt-hint))] w-4 text-right">{stars}★</span>
                <div className="flex-1 h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] text-[hsl(var(--txt-hint))] w-8">{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews list */}
        {loading ? (
          <p className="text-[13px] text-[hsl(var(--txt-hint))] text-center py-4">Carregando avaliações...</p>
        ) : reviews.length === 0 ? (
          <p className="text-[13px] text-[hsl(var(--txt-hint))] text-center py-4">Nenhuma avaliação ainda</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="border border-[hsl(var(--border))]/60 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                      {review.reviewer_name[0]}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[hsl(var(--txt-primary))]">{review.reviewer_name}</p>
                      <p className="text-[10px] text-[hsl(var(--txt-hint))]">{formatDate(review.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3 w-3 ${s <= review.rating ? "text-amber-400 fill-amber-400" : "text-[hsl(var(--border))]"}`}
                      />
                    ))}
                  </div>
                </div>
                <span className="inline-block text-[10px] font-semibold text-[hsl(var(--success))] bg-[hsl(var(--success-light))] px-2 py-0.5 rounded mb-1.5">
                  Compra verificada
                </span>
                {review.comment && (
                  <p className="text-[13px] text-[hsl(var(--txt-secondary))] leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}