import { Star, ThumbsUp } from "lucide-react";

interface ReviewSectionProps {
  rating: number;
  totalSales: number;
}

export default function ReviewSection({ rating, totalSales }: ReviewSectionProps) {
  // Mock review distribution
  const distribution = [
    { stars: 5, pct: 82 },
    { stars: 4, pct: 10 },
    { stars: 3, pct: 5 },
    { stars: 2, pct: 2 },
    { stars: 1, pct: 1 },
  ];

  const reviews = [
    { name: "Lucas M.", stars: 5, date: "28 mar 2026", text: "Conta exatamente como descrito! Transferência rápida e segura.", verified: true },
    { name: "Ana P.", stars: 5, date: "15 mar 2026", text: "Super recomendo, vendedor atencioso e processo pelo Escrow foi tranquilo.", verified: true },
    { name: "Rafael S.", stars: 4, date: "02 mar 2026", text: "Tudo certo com a conta. Demorou um pouco mais que o esperado mas funcionou.", verified: true },
  ];

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-white overflow-hidden">
      <div className="px-4 py-3.5">
        <h3 className="text-sm font-bold text-[hsl(var(--txt-primary))]">⭐ Opiniões de compradores</h3>
      </div>

      {/* Rating summary */}
      <div className="px-4 pb-4">
        <div className="flex items-start gap-5 mb-4">
          <div className="text-center">
            <p className="text-4xl font-black text-[hsl(var(--txt-primary))]">{rating.toFixed(1)}</p>
            <div className="flex gap-0.5 mt-1 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-[hsl(var(--border))]"}`}
                />
              ))}
            </div>
            <p className="text-[11px] text-[hsl(var(--txt-hint))] mt-1">{totalSales} avaliações</p>
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

        {/* Reviews */}
        <div className="space-y-3">
          {reviews.map((review, i) => (
            <div key={i} className="border border-[hsl(var(--border))]/60 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[hsl(var(--txt-primary))]">{review.name}</p>
                    <p className="text-[10px] text-[hsl(var(--txt-hint))]">{review.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3 w-3 ${s <= review.stars ? "text-amber-400 fill-amber-400" : "text-[hsl(var(--border))]"}`}
                    />
                  ))}
                </div>
              </div>
              {review.verified && (
                <span className="inline-block text-[10px] font-semibold text-[hsl(var(--success))] bg-[hsl(var(--success-light))] px-2 py-0.5 rounded mb-1.5">
                  Compra verificada
                </span>
              )}
              <p className="text-[13px] text-[hsl(var(--txt-secondary))] leading-relaxed">{review.text}</p>
              <button className="flex items-center gap-1 text-[11px] text-[hsl(var(--txt-hint))] mt-2 hover:text-primary">
                <ThumbsUp className="h-3 w-3" /> Útil
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
