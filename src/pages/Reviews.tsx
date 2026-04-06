import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import DesktopPageShell from "@/components/DesktopPageShell";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Reviews() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"pending" | "done">("pending");
  const [pending, setPending] = useState<any[]>([]);
  const [done, setDone] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) loadReviews();
  }, [user?.id]);

  const loadReviews = async () => {
    setLoading(true);
    const { data: transactions } = await supabase
      .from("transactions")
      .select("*, listings(title, screenshots, category)")
      .eq("buyer_id", user!.id)
      .eq("status", "completed");

    const { data: existingReviews } = await supabase
      .from("reviews")
      .select("*, transactions(listings(title, screenshots, category))")
      .eq("reviewer_id", user!.id);

    const reviewedTxIds = new Set((existingReviews || []).map((r: any) => r.transaction_id));
    setPending((transactions || []).filter((t: any) => !reviewedTxIds.has(t.id)));
    setDone(existingReviews || []);
    setLoading(false);
  };

  const handlePublish = async (tx: any) => {
    const rating = selectedRating[tx.id];
    if (!rating) { toast.error("Selecione uma avaliação"); return; }
    setSubmitting(tx.id);
    const { error } = await supabase.from("reviews").insert({
      transaction_id: tx.id, reviewer_id: user!.id, reviewed_id: tx.seller_id,
      rating, comment: comments[tx.id] || null,
    });
    if (error) toast.error("Erro ao publicar avaliação");
    else { toast.success("Avaliação publicada! 🎉"); loadReviews(); }
    setSubmitting(null);
  };

  const getThumb = (item: any) => {
    const listing = item.listings || item.transactions?.listings;
    return listing?.screenshots?.[0] || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=96&h=96&fit=crop";
  };

  const getTitle = (item: any) => item.listings?.title || item.transactions?.listings?.title || "Produto";

  return (
    <DesktopPageShell title="Minhas Avaliações">
      <div>
        <div className="flex gap-0 bg-white rounded-xl border border-[#E8E8E8] overflow-hidden mb-4">
          <button onClick={() => setTab("pending")}
            className={`flex-1 py-2.5 text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5 ${tab === "pending" ? "bg-primary text-white" : "text-[#666]"}`}>
            Para avaliar
            {pending.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === "pending" ? "bg-white/20" : "bg-destructive text-white"}`}>
                {pending.length}
              </span>
            )}
          </button>
          <button onClick={() => setTab("done")}
            className={`flex-1 py-2.5 text-[13px] font-medium transition-colors ${tab === "done" ? "bg-primary text-white" : "text-[#666]"}`}>
            Avaliadas ({done.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center pt-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : tab === "pending" ? (
          <div className="space-y-3">
            {pending.length === 0 ? (
              <div className="text-center pt-12">
                <CheckCircle2 className="h-10 w-10 text-success/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">Tudo avaliado! 🎉</p>
                <p className="text-xs text-muted-foreground mt-1">Você não tem avaliações pendentes</p>
              </div>
            ) : pending.map((tx: any) => (
              <div key={tx.id} className="bg-white rounded-xl border border-[#E8E8E8] p-4">
                <div className="flex gap-3 items-start">
                  <img src={getThumb(tx)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-[#111]">{getTitle(tx)}</p>
                    <p className="text-[11px] text-[#999]">Concluído em {new Date(tx.completed_at || tx.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setSelectedRating({ ...selectedRating, [tx.id]: s })}>
                      <Star className={`h-7 w-7 transition-colors ${(selectedRating[tx.id] || 0) >= s ? "text-[#FFB800] fill-[#FFB800]" : "text-[#DDD]"}`} />
                    </button>
                  ))}
                </div>
                {selectedRating[tx.id] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 space-y-2">
                    <textarea
                      placeholder="Conte sua experiência..."
                      value={comments[tx.id] || ""}
                      onChange={(e) => setComments({ ...comments, [tx.id]: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#E0E0E0] text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={() => handlePublish(tx)}
                      disabled={submitting === tx.id}
                      className="w-full py-2.5 bg-primary text-white rounded-xl text-[13px] font-semibold disabled:opacity-50"
                    >
                      {submitting === tx.id ? "Publicando..." : "Publicar avaliação"}
                    </button>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {done.length === 0 ? (
              <div className="text-center pt-12">
                <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">Nenhuma avaliação ainda</p>
              </div>
            ) : done.map((r: any) => (
              <div key={r.id} className="bg-white rounded-xl border border-[#E8E8E8] p-4">
                <div className="flex gap-3 items-start">
                  <img src={getThumb(r)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-[#111]">{getTitle(r)}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-4 w-4 ${s <= r.rating ? "text-[#FFB800] fill-[#FFB800]" : "text-[#DDD]"}`} />
                      ))}
                    </div>
                    {r.comment && <p className="text-[13px] text-[#555] mt-1">{r.comment}</p>}
                    <p className="text-[11px] text-[#999] mt-1">{new Date(r.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DesktopPageShell>
  );
}
