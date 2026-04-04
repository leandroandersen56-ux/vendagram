import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, ShoppingCart, Loader2, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/mock-data";
import { toast } from "sonner";
import type { Offer } from "@/hooks/useOffer";

interface Props {
  open: boolean;
  onClose: () => void;
  offer: Offer;
  listing: { id: string; title: string; price: number; screenshots?: string[] };
  onRespond: () => void;
}

export default function CounterOfferSheet({ open, onClose, offer, listing, onRespond }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const savings = Number(listing.price) - (offer.counter_price ?? 0);
  const discountPct = Math.round((savings / Number(listing.price)) * 100);

  const acceptCounter = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("offers")
      .update({
        status: "accepted",
        final_price: offer.counter_price,
        responded_at: new Date().toISOString(),
      } as any)
      .eq("id", offer.id);

    if (error) {
      toast.error("Erro ao aceitar contraproposta");
    } else {
      toast.success("Contraproposta aceita! Finalize o pagamento.");
      // Notify seller
      await supabase.from("notifications").insert({
        user_id: offer.seller_id,
        title: "✅ Contraproposta aceita!",
        body: `O comprador aceitou ${formatBRL(offer.counter_price!)}. Aguardando pagamento.`,
        link: `/vendedor?tab=ofertas`,
      } as any);
      onRespond();
      onClose();
      navigate(`/checkout/${listing.id}?offer=${offer.id}`);
    }
    setLoading(false);
  };

  const rejectCounter = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("offers")
      .update({ status: "rejected", responded_at: new Date().toISOString() } as any)
      .eq("id", offer.id);

    if (!error) {
      toast("Contraproposta recusada. Faça uma nova oferta.");
      onRespond();
      onClose();
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          className="relative w-full max-w-lg bg-white rounded-t-[24px] max-h-[85vh] overflow-y-auto"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#E0E0E0]" />
          </div>

          <div className="px-5 pb-8">
            {/* Header */}
            <div className="flex items-center gap-3 py-3 border-b border-[#F0F0F0]">
              {listing.screenshots?.[0] ? (
                <img src={listing.screenshots[0]} className="w-12 h-12 rounded-lg object-cover" alt="" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[#F5F5F5]" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#111] truncate">{listing.title}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F5F5F5]">
                <X className="w-4 h-4 text-[#999]" />
              </button>
            </div>

            {/* Timeline */}
            <div className="mt-5 space-y-3">
              <TimelineStep step={1} label="Sua oferta" value={formatBRL(offer.offered_price)} color="#2D6FF0" />
              <TimelineStep step={2} label="Contraproposta" value={formatBRL(offer.counter_price!)} color="#7c3aed" highlight />
              <TimelineStep step={3} label="Preço original" value={formatBRL(offer.original_price)} color="#999" strikethrough />
            </div>

            {/* Seller message */}
            {offer.seller_message && (
              <div className="bg-[#F3E8FF] rounded-xl p-3.5 mt-4 flex gap-2">
                <Quote className="w-4 h-4 text-[#7c3aed] shrink-0 mt-0.5" />
                <p className="text-[14px] italic text-[#555]">{offer.seller_message}</p>
              </div>
            )}

            {/* Savings */}
            <div className="bg-[#E8F8EF] rounded-xl p-3 mt-3 text-center">
              <p className="text-[13px] text-[#059669] font-medium">
                Você ainda economiza {formatBRL(savings)} ({discountPct}% de desconto)
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 mt-5">
              <button
                onClick={acceptCounter}
                disabled={loading}
                className="w-full h-[52px] rounded-[14px] bg-[#00A650] text-white text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-[#009040] transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Aceitar {formatBRL(offer.counter_price!)} e pagar agora
              </button>

              <button
                onClick={rejectCounter}
                disabled={loading}
                className="w-full h-[48px] rounded-[14px] border-[1.5px] border-[#E8E8E8] text-[#666] text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Recusar e fazer nova oferta
              </button>

              <button
                onClick={() => { onClose(); }}
                className="w-full text-center text-primary text-[13px] font-medium py-2 hover:underline flex items-center justify-center gap-1"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Comprar pelo preço original ({formatBRL(listing.price)})
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function TimelineStep({
  step, label, value, color, highlight, strikethrough,
}: {
  step: number; label: string; value: string; color: string; highlight?: boolean; strikethrough?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
        style={{ backgroundColor: color }}
      >
        {step}
      </div>
      <div className="flex-1">
        <span className="text-[12px] text-[#888]">{label}</span>
      </div>
      <span
        className={`text-[16px] font-bold ${strikethrough ? "line-through text-[#999]" : ""}`}
        style={{ color: strikethrough ? "#999" : color }}
      >
        {value}
      </span>
    </div>
  );
}
