import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DollarSign, Package, Star, Eye, ClipboardList, MessageCircle,
  BarChart3, Wallet, PlusCircle, ChevronRight, Loader2
} from "lucide-react";
import PageHeader from "@/components/menu/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function SellerCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ revenue: 0, sales: 0, rating: 0, views: 0, listingCount: 0 });
  const [wallet, setWallet] = useState({ balance: 0, pending: 0 });
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    const [profileRes, txRes, listingsRes, walletRes] = await Promise.all([
      supabase.from("profiles").select("avg_rating, total_sales, total_reviews, is_verified").eq("user_id", user!.id).single(),
      supabase.from("transactions").select("amount, status, created_at").eq("seller_id", user!.id),
      supabase.from("listings").select("id, views_count").eq("seller_id", user!.id),
      supabase.from("wallets").select("balance, pending").eq("user_id", user!.id).single(),
    ]);

    const completedTx = (txRes.data || []).filter((t: any) => t.status === "completed");
    const revenue = completedTx.reduce((s: number, t: any) => s + Number(t.amount), 0);
    const views = (listingsRes.data || []).reduce((s: number, l: any) => s + (l.views_count || 0), 0);

    setMetrics({
      revenue,
      sales: completedTx.length,
      rating: profileRes.data?.avg_rating || 5.0,
    });
    setIsVerified(profileRes.data?.is_verified || false);
      views,
      listingCount: (listingsRes.data || []).length,
    });

    if (walletRes.data) setWallet({ balance: Number(walletRes.data.balance), pending: Number(walletRes.data.pending) });
    setLoading(false);
  };

  const METRICS_CARDS = [
    { icon: DollarSign, label: "Faturamento", sub: "total", value: `R$ ${metrics.revenue.toLocaleString("pt-BR")}`, color: "text-primary" },
    { icon: Package, label: "Vendas", sub: "concluídas", value: String(metrics.sales), color: "text-primary" },
    { icon: Star, label: "Avaliação", sub: "média", value: metrics.rating.toFixed(1), color: "text-[#FFB800]" },
    { icon: Eye, label: "Visualizações", sub: "nos anúncios", value: String(metrics.views), color: "text-primary" },
  ];

  const REP_SEGMENTS = [
    { color: "bg-destructive" }, { color: "bg-[#FF6900]" }, { color: "bg-[#FFB800]" },
    { color: "bg-[#7BC67E]" }, { color: "bg-success" },
  ];

  const repLevel = metrics.rating >= 4.8 ? 4 : metrics.rating >= 4.5 ? 3 : metrics.rating >= 4.0 ? 2 : 1;
  const repName = repLevel >= 4 ? "Platinum" : repLevel >= 3 ? "Gold" : repLevel >= 2 ? "Silver" : "Bronze";

  const QUICK_LINKS = [
    { icon: ClipboardList, label: "Meus anúncios", count: metrics.listingCount, path: "/painel/anuncios" },
    { icon: Star, label: "Avaliações recebidas", count: null, path: "/avaliacoes" },
    { icon: Wallet, label: "Saldo disponível", count: null, value: `R$ ${wallet.balance.toFixed(2)}`, path: "/carteira" },
    { icon: BarChart3, label: "Pendente em escrow", count: null, value: `R$ ${wallet.pending.toFixed(2)}`, path: "/carteira" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader title="Central do Vendedor" rightAction={
        <span className="text-[11px] bg-success/20 text-success font-semibold px-2 py-1 rounded-full flex items-center gap-1"><Star className="h-3 w-3 fill-current" /> {repName}</span>
      } />

      <div className="px-4 pt-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {METRICS_CARDS.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }} className="bg-white rounded-xl border border-[#E8E8E8] p-4">
                  <m.icon className={`h-5 w-5 ${m.color} mb-2`} />
                  <p className="text-2xl font-semibold text-primary">{m.value}</p>
                  <p className="text-[12px] text-[#666]">{m.label}</p>
                  <p className="text-[11px] text-[#999]">{m.sub}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-[#E8E8E8] p-4">
              <p className="text-sm font-semibold text-[#111] mb-2">
                Sua reputação: <span className="text-success">{repName}</span>
              </p>
              <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                {REP_SEGMENTS.map((seg, i) => (
                  <div key={i} className={`flex-1 ${seg.color} ${i <= repLevel ? "" : "opacity-20"}`} />
                ))}
              </div>
              <p className="text-[11px] text-[#999] mt-2">Baseado nas suas vendas e avaliações</p>
            </div>

            <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
              {QUICK_LINKS.map((link, i) => (
                <button key={i} onClick={() => navigate(link.path)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F8F8F8] transition-colors border-b border-[#F5F5F5] last:border-b-0">
                  <link.icon className="h-5 w-5 text-[#444]" strokeWidth={1.5} />
                  <span className="flex-1 text-left text-[14px] text-[#111]">{link.label}</span>
                  {link.count !== null && link.count !== undefined && <span className="text-[13px] text-[#999]">({link.count})</span>}
                  {link.value && <span className="text-[13px] text-primary font-semibold">{link.value}</span>}
                  <ChevronRight className="h-4 w-4 text-[#CCC]" />
                </button>
              ))}
            </div>

            <button onClick={() => navigate("/painel/anuncios/novo")}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl text-[14px] font-semibold">
              <PlusCircle className="h-5 w-5" /> Criar novo anúncio
            </button>
          </>
        )}
      </div>
    </div>
  );
}
