import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeftRight, X, Clock, Loader2, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, PLATFORMS } from "@/lib/mock-data";
import { useCurrencyMask } from "@/hooks/useCurrencyMask";
import PlatformIcon from "@/components/PlatformIcon";
import { toast } from "sonner";
import type { Offer } from "@/hooks/useOffer";

interface Props {
  offer: Offer & { listing_title?: string; listing_screenshots?: string[]; listing_category?: string; buyer_name?: string };
  onUpdate: () => void;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `há ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  return `há ${Math.floor(hrs / 24)}d`;
}

function expiresIn(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return "Expirada";
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 2) return `${Math.floor(diff / 60000)}min`;
  return `${hrs}h`;
}

export default function SellerOfferCard({ offer, onUpdate }: Props) {
  const [showAccept, setShowAccept] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);
  const mask = useCurrencyMask(0);
  const [counterMsg, setCounterMsg] = useState("");

  const discountPct = Math.round((1 - offer.offered_price / offer.original_price) * 100);
  const thumb = offer.listing_screenshots?.[0];
  const isPending = offer.status === "pending";
  const exp = expiresIn(offer.expires_at);
  const isUrgent = new Date(offer.expires_at).getTime() - Date.now() < 2 * 3600000;

  const accept = async () => {
    setLoading(true);
    const fee = offer.offered_price * 0.10;
    const net = offer.offered_price - fee;

    const { error } = await supabase
      .from("offers")
      .update({
        status: "accepted",
        final_price: offer.offered_price,
        responded_at: new Date().toISOString(),
      } as any)
      .eq("id", offer.id);

    if (!error) {
      await supabase.from("notifications").insert({
        user_id: offer.buyer_id,
        title: "✅ Sua oferta foi aceita!",
        body: `O vendedor aceitou ${formatBRL(offer.offered_price)}. Finalize a compra agora!`,
        link: `/listing/${offer.listing_id}`,
      } as any);
      toast.success("Oferta aceita!");
      onUpdate();
    }
    setLoading(false);
    setShowAccept(false);
  };

  const counter = async () => {
    if (mask.value <= 0 || mask.value >= offer.original_price) return;
    setLoading(true);

    const { error } = await supabase
      .from("offers")
      .update({
        status: "countered",
        counter_price: mask.value,
        seller_message: counterMsg.trim() || null,
        responded_at: new Date().toISOString(),
      } as any)
      .eq("id", offer.id);

    if (!error) {
      await supabase.from("notifications").insert({
        user_id: offer.buyer_id,
        title: "↩️ Contraproposta recebida!",
        body: `O vendedor propõe ${formatBRL(mask.value)} pelo "${offer.listing_title}"`,
        link: `/listing/${offer.listing_id}`,
      } as any);
      toast.success("Contraproposta enviada!");
      onUpdate();
    }
    setLoading(false);
    setShowCounter(false);
  };

  const reject = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("offers")
      .update({ status: "rejected", responded_at: new Date().toISOString() } as any)
      .eq("id", offer.id);

    if (!error) {
      await supabase.from("notifications").insert({
        user_id: offer.buyer_id,
        title: "❌ Sua oferta foi recusada",
        body: `Que tal tentar outro valor para "${offer.listing_title}"?`,
        link: `/listing/${offer.listing_id}`,
      } as any);
      toast("Oferta recusada");
      onUpdate();
    }
    setLoading(false);
    setShowReject(false);
  };

  const statusBadge: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pendente", color: "#FF8C00", bg: "#FFF8E0" },
    accepted: { label: "Aceita", color: "#00A650", bg: "#E8F8EF" },
    rejected: { label: "Recusada", color: "#E53935", bg: "#FFF0F0" },
    countered: { label: "Contraproposta", color: "#7c3aed", bg: "#F3E8FF" },
    expired: { label: "Expirada", color: "#888", bg: "#F5F5F5" },
    cancelled: { label: "Cancelada", color: "#888", bg: "#F5F5F5" },
    paid: { label: "Paga", color: "#00A650", bg: "#E8F8EF" },
  };

  const badge = statusBadge[offer.status] || statusBadge.pending;

  return (
    <motion.div layout className="bg-white rounded-[14px] border border-[#E8E8E8] overflow-hidden" style={{ borderLeft: `4px solid ${isPending ? "#7c3aed" : badge.color}` }}>
      <div className={`p-4 ${isPending ? "bg-[#FAF7FF]" : ""}`}>
        {/* Header */}
        <div className="flex gap-3">
          {thumb ? (
            <img src={thumb} className="w-14 h-14 rounded-lg object-cover shrink-0" alt="" />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-[#F5F5F5] flex items-center justify-center shrink-0">
              <PlatformIcon platformId={offer.listing_category || "other"} size={28} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#111] line-clamp-1">{offer.listing_title || "Anúncio"}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[12px] text-[#999] line-through">{formatBRL(offer.original_price)}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: badge.bg, color: badge.color }}>
                {badge.label}
              </span>
            </div>
            <p className="text-[18px] font-black text-[#7c3aed] mt-1">
              {formatBRL(offer.offered_price)}
              <span className="text-[12px] font-bold text-[#7c3aed] ml-1.5 bg-[#F3E8FF] px-1.5 py-0.5 rounded">
                -{discountPct}%
              </span>
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#999]">
          <span>{offer.buyer_name || "Comprador"}</span>
          <span>·</span>
          <span>{timeAgo(offer.created_at)}</span>
          {isPending && (
            <>
              <span>·</span>
              <span className={`flex items-center gap-0.5 ${isUrgent ? "text-[#E53935]" : "text-[#FF8C00]"}`}>
                <Clock className="w-3 h-3" /> Expira em {exp}
              </span>
            </>
          )}
        </div>

        {/* Message */}
        {offer.buyer_message && (
          <div className="flex items-start gap-1.5 mt-2 text-[13px] italic text-[#666]">
            <Quote className="w-3 h-3 shrink-0 mt-0.5 text-[#CCC]" />
            "{offer.buyer_message}"
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-[#F0F0F0]">
            <button
              onClick={() => setShowAccept(true)}
              className="flex-1 h-9 rounded-[10px] bg-[#00A650] text-white text-[13px] font-bold flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Aceitar
            </button>
            <button
              onClick={() => { mask.setCents(Math.round(offer.offered_price * 1.15 * 100)); setShowCounter(true); }}
              className="flex-1 h-9 rounded-[10px] bg-[#7c3aed] text-white text-[13px] font-bold flex items-center justify-center gap-1"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" /> Contrapropor
            </button>
            <button
              onClick={() => setShowReject(true)}
              className="w-9 h-9 rounded-[10px] border border-[#E53935] text-[#E53935] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Accept confirmation */}
      <AnimatePresence>
        {showAccept && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-[#F0F0F0]"
          >
            <div className="p-4 bg-[#F8FAFF]">
              <p className="text-[14px] font-bold text-[#111] mb-2">Aceitar oferta de {formatBRL(offer.offered_price)}?</p>
              <div className="space-y-1 text-[13px] mb-3">
                <div className="flex justify-between"><span className="text-[#888]">Valor da oferta</span><span className="text-[#111] font-semibold">{formatBRL(offer.offered_price)}</span></div>
                <div className="flex justify-between"><span className="text-[#888]">Taxa Froiv (5%)</span><span className="text-[#111]">-{formatBRL(offer.offered_price * 0.05)}</span></div>
                <div className="h-px bg-[#E8E8E8] my-1" />
                <div className="flex justify-between"><span className="text-[#888] font-semibold">Você receberá</span><span className="text-[#00A650] font-bold">{formatBRL(offer.offered_price * 0.95)}</span></div>
              </div>
              <p className="text-[11px] text-[#999] mb-3">O comprador tem 24h para realizar o pagamento após aceite.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowAccept(false)} className="flex-1 h-10 rounded-xl border border-[#E0E0E0] text-[13px] font-semibold text-[#666]">Cancelar</button>
                <button onClick={accept} disabled={loading} className="flex-1 h-10 rounded-xl bg-[#00A650] text-white text-[13px] font-bold flex items-center justify-center gap-1 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar e aceitar"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Counter offer */}
      <AnimatePresence>
        {showCounter && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-[#F0F0F0]"
          >
            <div className="p-4 bg-[#FAF7FF]">
              <p className="text-[14px] font-bold text-[#111] mb-2">Fazer contraproposta</p>
              <p className="text-[12px] text-[#888] mb-3">Oferta do comprador: {formatBRL(offer.offered_price)}</p>
              <div className="flex items-center bg-[#F8F8F8] rounded-xl px-4 py-3 border-2 border-[#E8E8E8] focus-within:border-[#7c3aed] transition-colors mb-2">
                <span className="text-[18px] text-[#999] mr-2">R$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={mask.display === "0,00" ? "" : mask.display}
                  onChange={(e) => mask.handleChange(e.target.value)}
                  placeholder="0,00"
                  className="flex-1 bg-transparent text-[22px] font-black text-[#111] outline-none placeholder:text-[#CCC]"
                />
              </div>
              <textarea
                value={counterMsg}
                onChange={(e) => setCounterMsg(e.target.value.slice(0, 150))}
                placeholder="Mensagem opcional..."
                className="w-full bg-[#F8F8F8] rounded-xl p-3 text-[13px] border border-[#E8E8E8] resize-none h-16 focus:outline-none focus:border-[#7c3aed] mb-3"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowCounter(false)} className="flex-1 h-10 rounded-xl border border-[#E0E0E0] text-[13px] font-semibold text-[#666]">Cancelar</button>
                <button onClick={counter} disabled={loading || mask.value <= 0 || mask.value >= offer.original_price} className="flex-1 h-10 rounded-xl bg-[#7c3aed] text-white text-[13px] font-bold flex items-center justify-center gap-1 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar contraproposta"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject confirmation */}
      <AnimatePresence>
        {showReject && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-[#F0F0F0]"
          >
            <div className="p-4 bg-[#FFF8F8]">
              <p className="text-[14px] font-bold text-[#111] mb-3">Recusar esta oferta?</p>
              <div className="flex gap-2">
                <button onClick={() => setShowReject(false)} className="flex-1 h-10 rounded-xl border border-[#E0E0E0] text-[13px] font-semibold text-[#666]">Cancelar</button>
                <button onClick={reject} disabled={loading} className="flex-1 h-10 rounded-xl bg-[#E53935] text-white text-[13px] font-bold flex items-center justify-center gap-1 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar recusa"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
