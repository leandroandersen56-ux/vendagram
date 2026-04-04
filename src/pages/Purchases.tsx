import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star, ShoppingCart, ArrowRight } from "lucide-react";
import PageHeader from "@/components/menu/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  pending_payment: { label: "Aguardando pagamento", color: "text-[#FF6900] bg-[#FF6900]/10", icon: "⏳" },
  paid: { label: "Pagamento confirmado", color: "text-success bg-success/10", icon: "✅" },
  transfer_in_progress: { label: "Em verificação", color: "text-primary bg-primary/10", icon: "🔍" },
  completed: { label: "Conta Liberada", color: "text-success bg-success/10 font-bold", icon: "✅" },
  disputed: { label: "Disputa aberta", color: "text-[#FF6900] bg-[#FF6900]/10", icon: "⚠️" },
  refunded: { label: "Reembolsado", color: "text-[#888] bg-[#888]/10", icon: "↩️" },
  cancelled: { label: "Cancelado", color: "text-[#888] bg-[#888]/10", icon: "✖️" },
};

const FILTERS = ["Todos", "Em andamento", "Concluídos", "Disputas"];

const MOCK_PURCHASES = [
  {
    id: "FRV-2026-001",
    title: "Instagram 50K - Fitness",
    thumb: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&h=128&fit=crop",
    status: "completed",
    date: "15 de março de 2026",
    receivedDate: "15 de março",
    price: 819.99,
    qty: 1,
    rated: false,
  },
  {
    id: "FRV-2026-002",
    title: "TikTok 120K - Nicho Humor",
    thumb: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=128&h=128&fit=crop",
    status: "transfer_in_progress",
    date: "18 de março de 2026",
    receivedDate: null,
    price: 1200,
    qty: 1,
    rated: false,
  },
  {
    id: "FRV-2026-003",
    title: "Free Fire Nível 80 - Full Skin",
    thumb: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=128&h=128&fit=crop",
    status: "pending_payment",
    date: "20 de março de 2026",
    receivedDate: null,
    price: 450,
    qty: 1,
    rated: false,
  },
];

export default function Purchases() {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = MOCK_PURCHASES.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "Em andamento") return ["pending_payment", "paid", "transfer_in_progress"].includes(p.status);
    if (filter === "Concluídos") return p.status === "completed";
    if (filter === "Disputas") return p.status === "disputed";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader title="Minhas Compras" />

      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Busque por conta, plataforma..."
            className="w-full h-10 pl-10 pr-4 rounded-full border border-[#DDD] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-white border border-[#E0E0E0] text-[#555]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Incentive banner */}
      <div className="mx-4 mb-3 bg-gradient-to-r from-[#FF6900] to-[#FFB800] rounded-xl p-4 flex items-center gap-3 cursor-pointer">
        <Star className="h-6 w-6 text-white shrink-0" fill="white" />
        <p className="text-white text-[13px] font-semibold flex-1">Avalie suas compras e ajude a comunidade!</p>
        <ArrowRight className="h-4 w-4 text-white/80 shrink-0" />
      </div>

      {/* Purchase cards */}
      <div className="px-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-[#DDD] mx-auto mb-3" strokeWidth={1} />
            <p className="text-[#333] font-semibold">Você ainda não comprou nada</p>
            <p className="text-[#999] text-sm mt-1">Explore o marketplace e encontre a conta ideal</p>
            <button
              onClick={() => navigate("/marketplace")}
              className="mt-4 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold"
            >
              Ver ofertas
            </button>
          </div>
        ) : (
          filtered.map((purchase, i) => {
            const status = STATUS_MAP[purchase.status];
            return (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-[#E8E8E8] p-4 cursor-pointer active:bg-[#FAFAFA] transition-colors"
                onClick={() => navigate(`/compras/${purchase.id}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] text-[#999]">{purchase.date}</span>
                  <span className="text-[13px] text-primary font-semibold flex items-center gap-1">
                    Comprar novamente <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <div className="flex gap-3">
                  <img
                    src={purchase.thumb}
                    alt={purchase.title}
                    className="h-16 w-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.icon} {status.label}
                    </span>
                    {purchase.receivedDate && (
                      <p className="text-[11px] text-[#999] mt-0.5">Recebida em {purchase.receivedDate}</p>
                    )}
                    <p className="text-[14px] text-[#111] font-medium truncate mt-0.5">{purchase.title}</p>
                    <p className="text-[13px] text-[#666]">{purchase.qty} conta · R$ {purchase.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                {purchase.status === "completed" && !purchase.rated && (
                  <button className="mt-3 w-full flex items-center justify-center gap-1.5 bg-[#FF6900] text-white py-2 rounded-lg text-[13px] font-semibold">
                    <Star className="h-3.5 w-3.5" fill="white" /> Avaliar e ganhar recompensas
                  </button>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
