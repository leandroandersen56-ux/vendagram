import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Clock, CheckCircle, ArrowLeftRight, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatBRL } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import type { Offer } from "@/hooks/useOffer";
import OfferBottomSheet from "./OfferBottomSheet";
import CounterOfferSheet from "./CounterOfferSheet";

interface Props {
  listing: { id: string; title: string; price: number; seller_id: string; screenshots?: string[]; category?: string; accepts_offers?: boolean };
  offer: Offer | null;
  offerLoading: boolean;
  onRefetch: () => void;
}

export default function OfferButton({ listing, offer, offerLoading, onRefetch }: Props) {
  const { user, isAuthenticated, openAuth } = useAuth();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [counterOpen, setCounterOpen] = useState(false);

  if (offerLoading) return <div className="h-[52px] rounded-xl bg-[#F5F5F5] animate-pulse" />;

  // Don't show if seller is viewing own listing
  if (user?.id === listing.seller_id) return null;

  // Don't show if listing doesn't accept offers
  if (listing.accepts_offers === false) return null;

  const handleClick = () => {
    if (!isAuthenticated) {
      openAuth(window.location.pathname);
      return;
    }

    if (!offer || offer.status === "rejected" || offer.status === "expired" || offer.status === "cancelled") {
      setSheetOpen(true);
    } else if (offer.status === "pending") {
      // Already pending — could show details
    } else if (offer.status === "accepted") {
      navigate(`/checkout/${listing.id}?offer=${offer.id}`);
    } else if (offer.status === "countered") {
      setCounterOpen(true);
    }
  };

  // State 1 — No offer or closed offer
  if (!offer || ["rejected", "expired", "cancelled"].includes(offer.status)) {
    const isRejected = offer?.status === "rejected";
    return (
      <>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleClick}
          className={`w-full h-[52px] rounded-xl text-[16px] font-bold border-2 flex items-center justify-center gap-2 transition-colors ${
            isRejected
              ? "bg-[#FFF0F0] border-[#E53935] text-[#E53935]"
              : "bg-transparent border-primary text-primary hover:bg-primary/5"
          }`}
        >
          {isRejected ? (
            <>
              <XCircle className="w-5 h-5" />
              Oferta recusada — Fazer nova oferta
            </>
          ) : (
            <>
              <MessageCircle className="w-5 h-5" />
              FAZER OFERTA
            </>
          )}
        </motion.button>

        <OfferBottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          listing={listing}
          onSent={onRefetch}
        />
      </>
    );
  }

  // State 2 — Pending
  if (offer.status === "pending") {
    return (
      <button className="w-full h-[52px] rounded-xl text-[14px] font-bold border-2 bg-[#FFF8E0] border-[#FF8C00] text-[#FF8C00] flex items-center justify-center gap-2 cursor-default">
        <Clock className="w-5 h-5" />
        Oferta enviada: {formatBRL(offer.offered_price)} — Aguardando...
      </button>
    );
  }

  // State 3 — Accepted
  if (offer.status === "accepted") {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleClick}
        className="w-full h-[52px] rounded-xl text-[15px] font-bold border-2 bg-[#E8F8EF] border-[#00A650] text-[#00A650] flex items-center justify-center gap-2"
      >
        <CheckCircle className="w-5 h-5" />
        Oferta aceita! Pagar {formatBRL(offer.final_price || offer.offered_price)} →
      </motion.button>
    );
  }

  // State 4 — Countered
  if (offer.status === "countered") {
    return (
      <>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleClick}
          className="relative w-full h-[52px] rounded-xl text-[14px] font-bold border-2 bg-[#F3E8FF] border-[#7c3aed] text-[#7c3aed] flex items-center justify-center gap-2"
        >
          <ArrowLeftRight className="w-5 h-5" />
          Contraproposta: {formatBRL(offer.counter_price!)} — Ver →
          <span className="absolute -top-1.5 -right-1.5 bg-[#E53935] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
            NOVO
          </span>
        </motion.button>

        <CounterOfferSheet
          open={counterOpen}
          onClose={() => setCounterOpen(false)}
          offer={offer}
          listing={listing}
          onRespond={onRefetch}
        />
      </>
    );
  }

  return null;
}
