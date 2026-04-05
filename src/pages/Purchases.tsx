
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star, ShoppingCart, ArrowRight, Loader2, Clock, CheckCircle2, Eye, AlertTriangle, RotateCcw, XCircle } from "lucide-react";
import PageHeader from "@/components/menu/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getListingImage, handleListingImageError } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  pending_payment: { label: "Aguardando pagamento", color: "text-[#FF6900] bg-[#FF6900]/10", Icon: Clock },
  paid: { label: "Pagamento confirmado", color: "text-success bg-success/10", Icon: CheckCircle2 },
  transfer_in_progress: { label: "Em verificação", color: "text-primary bg-primary/10", Icon: Eye },
  completed: { label: "Conta Liberada", color: "text-success bg-success/10 font-semibold", Icon: CheckCircle2 },
  disputed: { label: "Disputa aberta", color: "text-[#FF6900] bg-[#FF6900]/10", Icon: AlertTriangle },
  refunded: { label: "Reembolsado", color: "text-[#888] bg-[#888]/10", Icon: RotateCcw },
  cancelled: { label: "Cancelado", color: "text-[#888] bg-[#888]/10", Icon: XCircle },
};

const FILTERS = ["Todos", "Em andamento", "Concluídos", "Disputas"];

export default function Purchases() {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) loadPurchases();
  }, [user?.id]);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*, listings(title, category, screenshots)")
        .eq("buyer_id", user!.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPurchases(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = purchases.filter((p) => {
    const title = p.listings?.title || "";
    if (search && !title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "Em andamento") return ["pending_payment", "paid", "transfer_in_progress"].includes(p.status);
    if (filter === "Concluídos") return p.status === "completed";
    if (filter === "Disputas") return p.status === "disputed";
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  };

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
                filter === f ? "bg-primary text-white" : "bg-white border border-[#E0E0E0] text-[#555]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-4 mb-3 bg-gradient-to-r from-[#FF6900] to-[#FFB800] rounded-xl p-4 flex items-center gap-3 cursor-pointer">
        <Star className="h-6 w-6 text-white shrink-0" fill="white" />
        <p className="text-white text-[13px] font-semibold flex-1">Avalie suas compras e ajude a comunidade!</p>
        <ArrowRight className="h-4 w-4 text-white/80 shrink-0" />
      </div>

      <div className="px-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
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
            const status = STATUS_MAP[purchase.status] || STATUS_MAP.pending_payment;
            const listing = purchase.listings;
            const thumb = getListingImage(listing?.category, listing?.screenshots);
            const title = listing?.title || "Conta";

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
                  <span className="text-[12px] text-[#999]">{formatDate(purchase.created_at)}</span>
                </div>
                <div className="flex gap-3">
                  <img
                    src={thumb}
                    alt={title}
                    className="h-16 w-16 rounded-lg object-cover shrink-0"
                    loading="lazy"
                    onError={(event) => handleListingImageError(event, listing?.category)}
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full ${status.color}`}>
                      <status.Icon className="h-3 w-3" /> {status.label}
                    </span>
                    {purchase.completed_at && (
                      <p className="text-[11px] text-[#999] mt-0.5">
                        Concluída em {formatDate(purchase.completed_at)}
                      </p>
                    )}
                    <p className="text-[14px] text-[#111] font-medium truncate mt-0.5">{title}</p>
                    <p className="text-[13px] text-[#666]">
                      R$ {Number(purchase.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                {purchase.status === "completed" && (
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
