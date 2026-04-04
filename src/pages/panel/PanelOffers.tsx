import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2, Inbox } from "lucide-react";
import { useSellerOffers } from "@/hooks/useOffer";
import SellerOfferCard from "@/components/offers/SellerOfferCard";

type FilterId = "todas" | "pendentes" | "aceitas" | "recusadas" | "expiradas";

const FILTERS: { id: FilterId; label: string; statuses: string[] }[] = [
  { id: "todas", label: "Todas", statuses: [] },
  { id: "pendentes", label: "Pendentes", statuses: ["pending"] },
  { id: "aceitas", label: "Aceitas", statuses: ["accepted", "paid"] },
  { id: "recusadas", label: "Recusadas", statuses: ["rejected"] },
  { id: "expiradas", label: "Expiradas", statuses: ["expired", "cancelled"] },
];

export default function PanelOffers() {
  const { offers, loading, refetch } = useSellerOffers();
  const [filter, setFilter] = useState<FilterId>("todas");

  const filtered = useMemo(() => {
    const f = FILTERS.find((fi) => fi.id === filter);
    if (!f || f.statuses.length === 0) return offers;
    return offers.filter((o) => f.statuses.includes(o.status));
  }, [offers, filter]);

  const pendingCount = offers.filter((o) => o.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[18px] font-bold text-[#111]">Ofertas recebidas</h2>
          {pendingCount > 0 && (
            <p className="text-[13px] text-[#FF8C00] font-medium">{pendingCount} aguardando resposta</p>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-colors ${
              filter === f.id
                ? "bg-[#7c3aed] text-white"
                : "bg-[#F5F5F5] text-[#666] border border-[#E8E8E8]"
            }`}
          >
            {f.label}
            {f.id === "pendentes" && pendingCount > 0 && (
              <span className="ml-1 bg-white/30 rounded-full px-1.5 text-[10px]">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Offers list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-[#DDD] mx-auto mb-3" strokeWidth={1} />
          <p className="text-[14px] text-[#888]">
            {filter === "todas" ? "Nenhuma oferta recebida ainda" : "Nenhuma oferta neste filtro"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((offer) => (
            <SellerOfferCard key={offer.id} offer={offer} onUpdate={refetch} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
