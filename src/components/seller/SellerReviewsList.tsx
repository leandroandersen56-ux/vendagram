import { Star, Package } from "lucide-react";

interface Props {
  reviews: any[];
}

export default function SellerReviewsList({ reviews }: Props) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Star className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="font-medium">Nenhuma avaliação ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r: any) => (
        <div key={r.id} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground">
              {(r.profiles as any)?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{(r.profiles as any)?.name || "Comprador"}</p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "text-[#FFB800] fill-[#FFB800]" : "text-muted-foreground/30"}`} />
                ))}
              </div>
            </div>
            <span className="ml-auto text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleDateString("pt-BR")}
            </span>
          </div>
          {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
        </div>
      ))}
    </div>
  );
}
