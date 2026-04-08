import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag, Tag, Star, ArrowDown, ArrowRight, ArrowUp,
  PlusCircle, Loader2, Clock, TrendingUp, Wallet
} from "lucide-react";
import PageHeader from "@/components/menu/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import WithdrawModal from "@/components/wallet/WithdrawModal";
import DepositModal from "@/components/wallet/DepositModal";
import TransferModal from "@/components/wallet/TransferModal";

export default function SellerCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ purchases: 0, activeListings: 0, rating: 0, totalReviews: 0 });
  const [wallet, setWallet] = useState({ balance: 0, pending: 0, totalEarned: 0 });
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [pixKey, setPixKey] = useState("");
  const [userName, setUserName] = useState("Vendedor");

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    const [profileRes, purchasesRes, listingsRes, walletRes] = await Promise.all([
      supabase.from("profiles").select("avg_rating, total_reviews, pix_key").eq("user_id", user!.id).single(),
      supabase.from("transactions").select("id").eq("buyer_id", user!.id).eq("status", "completed"),
      supabase.from("listings").select("id").eq("seller_id", user!.id).eq("status", "active"),
      supabase.from("wallets").select("balance, pending, total_earned").eq("user_id", user!.id).single(),
    ]);

    setMetrics({
      purchases: (purchasesRes.data || []).length,
      activeListings: (listingsRes.data || []).length,
      rating: profileRes.data?.avg_rating || 0,
      totalReviews: profileRes.data?.total_reviews || 0,
    });

    if (profileRes.data?.pix_key) setPixKey(profileRes.data.pix_key);
    if (walletRes.data) setWallet({
      balance: Number(walletRes.data.balance),
      pending: Number(walletRes.data.pending),
      totalEarned: Number(walletRes.data.total_earned),
    });
    setLoading(false);
  };

  const STATS = [
    { icon: ShoppingBag, label: "COMPRAS", value: String(metrics.purchases) },
    { icon: Tag, label: "ANÚNCIOS ATIVOS", value: String(metrics.activeListings) },
    {
      icon: Star,
      label: "AVALIAÇÃO",
      value: metrics.totalReviews > 0 ? metrics.rating.toFixed(1) : "—",
      sub: metrics.totalReviews > 0 ? `${metrics.totalReviews} avaliações` : "sem avaliações",
    },
  ];

  const WALLET_ACTIONS = [
    { icon: ArrowDown, label: "Depositar", color: "text-success bg-success/10", action: () => setShowDeposit(true) },
    { icon: ArrowRight, label: "Transferir", color: "text-foreground bg-muted", action: () => setShowTransfer(true) },
    { icon: ArrowUp, label: "Sacar", color: "text-primary bg-primary/10", action: () => setShowWithdraw(true) },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Central do Vendedor" rightAction={
        <button onClick={() => navigate("/carteira")} className="text-primary-foreground">
          <Wallet className="h-5 w-5" />
        </button>
      } />

      <div className="px-4 pt-5 space-y-5">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Greeting */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">Olá, {userName} 👋</h1>
                <p className="text-sm text-muted-foreground">Resumo da sua conta</p>
              </div>
              <button
                onClick={() => navigate("/vendedor/novo")}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
              >
                <PlusCircle className="h-4 w-4" /> Anúncio
              </button>
            </div>

            {/* Stats Grid — 3 columns */}
            <div className="grid grid-cols-3 gap-3">
              {STATS.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card rounded-2xl border border-border p-4 flex flex-col items-center text-center"
                >
                  <s.icon className="h-5 w-5 text-primary mb-2.5" strokeWidth={1.5} />
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wide uppercase mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground leading-none">{s.value}</p>
                  {s.sub && <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>}
                </motion.div>
              ))}
            </div>

            {/* Wallet Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="h-4.5 w-4.5 text-foreground" strokeWidth={1.5} />
                <h2 className="text-base font-bold text-foreground">Carteira</h2>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                {/* Balance */}
                <div className="px-5 pt-5 pb-4">
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Disponível</p>
                  <p className="text-3xl font-bold text-primary mt-1">
                    R$ {wallet.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="border-t border-border" />

                {/* Actions */}
                <div className="flex items-center justify-around py-4 px-4">
                  {WALLET_ACTIONS.map((a, i) => (
                    <button key={i} onClick={a.action} className="flex flex-col items-center gap-1.5">
                      <div className={`h-11 w-11 rounded-full flex items-center justify-center ${a.color}`}>
                        <a.icon className="h-5 w-5" strokeWidth={2} />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{a.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Pending + Total Earned */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-2xl border border-border p-4"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="h-3.5 w-3.5 text-[#FF6900]" />
                    <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Pendente</p>
                  </div>
                  <p className="text-lg font-bold text-[#FF6900]">
                    R$ {wallet.pending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-card rounded-2xl border border-border p-4"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-foreground" />
                    <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Total Ganho</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    R$ {wallet.totalEarned.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Activity */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl border border-border p-5"
            >
              <h3 className="text-sm font-bold text-foreground mb-3">Atividade Recente</h3>
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma atividade recente</p>
            </motion.div>
          </>
        )}
      </div>

      <WithdrawModal open={showWithdraw} onClose={() => { setShowWithdraw(false); loadData(); }} balance={wallet.balance} pixKey={pixKey} />
      <DepositModal open={showDeposit} onClose={() => setShowDeposit(false)} />
      <TransferModal open={showTransfer} onClose={() => setShowTransfer(false)} balance={wallet.balance} />
    </div>
  );
}
