import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Loader2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatBRL } from "@/lib/mock-data";
import { useCurrencyMask } from "@/hooks/useCurrencyMask";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  listing: { id: string; title: string; price: number; seller_id: string; screenshots?: string[]; category?: string };
  onSent: () => void;
}

export default function OfferBottomSheet({ open, onClose, listing, onSent }: Props) {
  const { user } = useAuth();
  const mask = useCurrencyMask(0);
  const [showMsg, setShowMsg] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmLow, setConfirmLow] = useState(false);

  const price = Number(listing.price);
  const discount = mask.value > 0 ? Math.round((1 - mask.value / price) * 100) : 0;
  const savings = price - mask.value;
  const fee = mask.value * 0.10;
  const total = mask.value;
  const isValid = mask.value > 0 && mask.value < price;
  const isLowOffer = discount > 40;

  const quickOffers = [10, 20, 30].map((pct) => ({
    label: `${pct}% off`,
    value: Math.round(price * (1 - pct / 100) * 100),
  }));

  const submit = async () => {
    if (!user?.id || !isValid) return;

    if (isLowOffer && !confirmLow) {
      setConfirmLow(true);
      return;
    }

    setSending(true);

    // Check existing pending offer
    const { count } = await supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", listing.id)
      .eq("buyer_id", user.id)
      .eq("status", "pending");

    if ((count ?? 0) > 0) {
      toast.error("Você já tem uma oferta pendente neste anúncio");
      setSending(false);
      return;
    }

    const { error } = await supabase.from("offers").insert({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      original_price: price,
      offered_price: mask.value,
      buyer_message: message.trim() || null,
    } as any);

    if (error) {
      toast.error(error.message || "Erro ao enviar oferta");
    } else {
      // Notify seller
      await supabase.from("notifications").insert({
        user_id: listing.seller_id,
        title: "💰 Nova oferta recebida!",
        body: `${user.name || "Comprador"} ofereceu ${formatBRL(mask.value)} pelo "${listing.title}"`,
        link: `/vendedor?tab=ofertas`,
      } as any);

      toast.success("Oferta enviada! O vendedor tem 24h para responder.");
      mask.reset();
      setMessage("");
      onSent();
      onClose();
    }
    setSending(false);
    setConfirmLow(false);
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
          className="relative w-full max-w-lg bg-white rounded-t-[24px] max-h-[90vh] overflow-y-auto"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Handle */}
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
                <p className="text-[13px] text-[#999] line-through">{formatBRL(price)}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F5F5F5]">
                <X className="w-4 h-4 text-[#999]" />
              </button>
            </div>

            {/* Input */}
            <div className="mt-4">
              <label className="text-[13px] font-semibold text-[#333] mb-2 block">Sua oferta</label>
              <div className="flex items-center bg-[#F8F8F8] rounded-[14px] px-5 py-4 border-2 border-[#E8E8E8] focus-within:border-[#7c3aed] transition-colors">
                <span className="text-[22px] text-[#999] mr-2">R$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={mask.display === "0,00" ? "" : mask.display}
                  onChange={(e) => mask.handleChange(e.target.value)}
                  placeholder="0,00"
                  className="flex-1 bg-transparent text-[28px] font-black text-[#111] outline-none placeholder:text-[#CCC]"
                />
              </div>
            </div>

            {/* Quick offers */}
            <div className="flex gap-2 mt-3">
              {quickOffers.map((q) => (
                <button
                  key={q.label}
                  onClick={() => mask.setCents(q.value)}
                  className="border border-[#E8E8E8] rounded-full px-3.5 py-1.5 text-[12px] text-[#666] hover:bg-[#F5F5F5] transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Live feedback */}
            {mask.value > 0 && (
              <div className="bg-[#F8FAFF] rounded-xl p-3.5 mt-3 space-y-1.5">
                {mask.value >= price ? (
                  <p className="text-[13px] text-[#FF8C00] font-medium">⚠️ Valor acima do preço. Use Comprar Agora.</p>
                ) : (
                  <>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#888]">Desconto</span>
                      <span className="text-[#111] font-semibold">{discount}% ({formatBRL(savings)})</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#888]">Você economiza</span>
                      <span className="text-[#00A650] font-bold">{formatBRL(savings)}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#888]"><span className="text-[#888]"><span className="text-[#888]"><span className="text-[#888]">Taxa Froiv (10%)</span></span></span></span>
                      <span className="text-[#111]">{formatBRL(fee)}</span>
                    </div>
                    <div className="h-px bg-[#E8E8E8] my-1" />
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#888] font-semibold">Total a pagar</span>
                      <span className="text-[#111] font-bold">{formatBRL(total)}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Message toggle */}
            <button
              onClick={() => setShowMsg(!showMsg)}
              className="flex items-center gap-1.5 text-[13px] text-primary font-medium mt-3 hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {showMsg ? "Remover mensagem" : "Adicionar mensagem"}
            </button>

            {showMsg && (
              <div className="mt-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 150))}
                  placeholder="Ex: Posso pagar agora via Pix. Topas?"
                  className="w-full bg-[#F8F8F8] rounded-xl p-3 text-[13px] border border-[#E8E8E8] resize-none h-20 focus:outline-none focus:border-[#7c3aed]"
                />
                <p className="text-[11px] text-[#999] text-right">{message.length}/150</p>
              </div>
            )}

            {/* Escrow notice */}
            <div className="flex items-start gap-2 bg-[#E8F8EF] rounded-[10px] p-3 mt-3">
              <Shield className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#059669]">
                Segurança garantida: se o vendedor aceitar, o pagamento fica protegido pelo Escrow até você verificar a conta.
              </p>
            </div>

            {/* Low offer warning */}
            <AnimatePresence>
              {confirmLow && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-[#FFF8E0] border border-[#FFD700] rounded-xl p-3.5 mt-3"
                >
                  <p className="text-[13px] font-medium text-[#111] mb-3">
                    Você está oferecendo {discount}% abaixo do preço. Ofertas muito baixas tendem a ser recusadas.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmLow(false)}
                      className="flex-1 h-9 rounded-lg border border-[#E0E0E0] text-[13px] font-semibold text-[#666]"
                    >
                      Ajustar valor
                    </button>
                    <button
                      onClick={() => { setConfirmLow(false); submit(); }}
                      className="flex-1 h-9 rounded-lg bg-[#7c3aed] text-white text-[13px] font-semibold"
                    >
                      Enviar mesmo assim
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            {!confirmLow && (
              <button
                onClick={submit}
                disabled={!isValid || sending}
                className="w-full h-[52px] rounded-[14px] mt-4 text-[16px] font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: isValid ? "#7c3aed" : "#CCC" }}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  `Enviar oferta de ${mask.value > 0 ? formatBRL(mask.value) : "R$ 0,00"}`
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
