import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShoppingBag, Tag, Wallet, TrendingUp, ArrowUpRight, Plus, Star,
  Clock, ArrowDown, ArrowRight, ArrowUp, ScanLine,
  ArrowDownRight, RefreshCcw, Send, Repeat, Activity, Loader2, Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { formatBRL } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import DepositModal from "@/components/wallet/DepositModal";
import TransferModal from "@/components/wallet/TransferModal";
import WithdrawModal from "@/components/wallet/WithdrawModal";
import QRScannerModal from "@/components/wallet/QRScannerModal";
import BalanceChart from "@/components/wallet/BalanceChart";

export default function PanelOverview() {
  const { user } = useAuth();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);

  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [purchases, setPurchases] = useState(0);
  const [activeListings, setActiveListings] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [recentActivity, setRecentActivity] = useState<{ text: string; time: string; color: string }[]>([]);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    const uid = user!.id;
    const [walletRes, profileRes, listingsRes, txBuyerRes, txSellerRes] = await Promise.all([
      supabase.from("wallets").select("balance, pending, total_earned").eq("user_id", uid).single(),
      supabase.from("profiles").select("avg_rating, total_reviews, total_purchases").eq("user_id", uid).single(),
      supabase.from("listings").select("id").eq("seller_id", uid).eq("status", "active"),
      supabase.from("transactions").select("id").eq("buyer_id", uid),
      supabase.from("transactions").select("id, amount, status, created_at, listings(title)").or(`buyer_id.eq.${uid},seller_id.eq.${uid}`).order("created_at", { ascending: false }).limit(5),
    ]);

    if (walletRes.data) {
      setBalance(Number(walletRes.data.balance));
      setPending(Number(walletRes.data.pending));
      setTotalEarned(Number(walletRes.data.total_earned));
    }
    if (profileRes.data) {
      setAvgRating(Number(profileRes.data.avg_rating));
      setTotalReviews(profileRes.data.total_reviews);
      setPurchases(profileRes.data.total_purchases);
    }
    setActiveListings((listingsRes.data || []).length);

    // Build recent activity from real transactions
    const activity = (txSellerRes.data || []).map((t: any) => {
      const title = t.listings?.title || "Transação";
      const date = new Date(t.created_at);
      const diff = Date.now() - date.getTime();
      const hours = Math.floor(diff / 3600000);
      const time = hours < 1 ? "agora" : hours < 24 ? `${hours}h atrás` : `${Math.floor(hours / 24)}d atrás`;
      const color = t.status === "completed" ? "bg-success" : t.status === "cancelled" ? "bg-destructive" : "bg-warning";
      return { text: `${title} — ${t.status === "completed" ? "concluída" : t.status === "paid" ? "paga" : "em andamento"}`, time, color };
    });
    setRecentActivity(activity);
    setLoading(false);
  };

  const stats = [
    { label: "COMPRAS", value: String(purchases), icon: ShoppingBag, sub: "" },
    { label: "ANÚNCIOS ATIVOS", value: String(activeListings), icon: Tag, sub: "" },
    { label: "AVALIAÇÃO", value: avgRating > 0 ? avgRating.toFixed(1) : "—", icon: Star, sub: totalReviews > 0 ? `${totalReviews} reviews` : "sem avaliações" },
  ];

  const walletActions = [
    { label: "Depositar", icon: ArrowDown, color: "text-success", bg: "bg-success/10", onClick: () => setShowDeposit(true) },
    { label: "Transferir", icon: ArrowRight, color: "text-info", bg: "bg-info/10", onClick: () => setShowTransfer(true) },
    { label: "Sacar", icon: ArrowUp, color: "text-primary", bg: "bg-primary/10", onClick: () => setShowWithdraw(true) },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-4 w-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight truncate">
              Olá, {user?.name} 👋
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">Resumo da sua conta</p>
          </div>
          <Link to="/vendedor/novo" className="shrink-0">
            <Button size="sm" className="gap-1.5 text-xs h-8 px-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5" /> Anúncio
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-background border border-border rounded-2xl p-3 flex flex-col items-center text-center"
            >
              <div className="h-8 w-8 rounded-xl bg-primary/8 flex items-center justify-center mb-1.5">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-[8px] font-semibold text-muted-foreground tracking-widest leading-none">{stat.label}</p>
              <p className="text-xl font-semibold text-foreground mt-1">{stat.value}</p>
              {stat.sub && <p className="text-[9px] text-muted-foreground mt-0.5">{stat.sub}</p>}
            </motion.div>
          ))}
        </div>

        {/* Carteira */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-primary" />
            Carteira
          </h2>

          <div className="bg-background border border-border rounded-2xl p-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Disponível</p>
            <p className="text-2xl font-semibold text-success mt-0.5 tabular-nums">{formatBRL(balance)}</p>

            <div className="flex items-center justify-around mt-4 pt-3 border-t border-border">
              {walletActions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
                >
                  <div className={`h-10 w-10 rounded-full ${action.bg} flex items-center justify-center`}>
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pendente + Total */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-background border border-border rounded-2xl p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <Clock className="h-3 w-3 text-warning shrink-0" />
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Pendente</span>
              </div>
              <p className="text-base font-semibold text-warning tabular-nums truncate">{formatBRL(pending)}</p>
            </div>
            <div className="bg-background border border-border rounded-2xl p-3">
              <div className="flex items-center gap-1 mb-0.5">
                <TrendingUp className="h-3 w-3 text-primary shrink-0" />
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total Ganho</span>
              </div>
              <p className="text-base font-semibold text-foreground tabular-nums truncate">{formatBRL(totalEarned)}</p>
            </div>
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="bg-background border border-border rounded-2xl p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Atividade Recente</h3>
          {recentActivity.length === 0 ? (
            <div className="text-center py-6">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Nenhuma atividade ainda</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-muted/60 transition-colors">
                  <div className={`h-1.5 w-1.5 rounded-full ${a.color} shrink-0`} />
                  <p className="text-xs text-foreground flex-1 min-w-0 truncate">{a.text}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <DepositModal open={showDeposit} onClose={() => setShowDeposit(false)} />
      <TransferModal open={showTransfer} onClose={() => setShowTransfer(false)} balance={balance} />
      <WithdrawModal open={showWithdraw} onClose={() => setShowWithdraw(false)} balance={balance} pixKey="***.***.***-00" />
      <QRScannerModal open={showQR} onClose={() => setShowQR(false)} balance={balance} />
    </>
  );
}
