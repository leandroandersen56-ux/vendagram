
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Lock, Loader2 } from "lucide-react";
import PageHeader from "@/components/menu/PageHeader";
import WithdrawModal from "@/components/wallet/WithdrawModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WalletData {
  balance: number;
  pending: number;
  total_earned: number;
}

interface TransactionItem {
  id: string;
  type: "in" | "out" | "escrow";
  label: string;
  date: string;
  amount: number;
  group: string;
}

export default function WalletPage() {
  const { user } = useAuth();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, pending: 0, total_earned: 0 });
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pixKey, setPixKey] = useState("");

  useEffect(() => {
    if (user?.id) loadWalletData();
  }, [user?.id]);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      // Load wallet
      const { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (walletData) {
        setWallet({
          balance: Number(walletData.balance),
          pending: Number(walletData.pending),
          total_earned: Number(walletData.total_earned),
        });
      }

      // Load pix key from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("pix_key")
        .eq("user_id", user!.id)
        .single();

      if (profile?.pix_key) setPixKey(profile.pix_key);

      // Load recent transactions (completed sales + withdrawals)
      const txItems: TransactionItem[] = [];

      // Completed sales (seller)
      const { data: sales } = await supabase
        .from("transactions")
        .select("id, amount, seller_receives, completed_at, status, listings(title)")
        .eq("seller_id", user!.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(10);

      sales?.forEach((s: any) => {
        const d = new Date(s.completed_at);
        txItems.push({
          id: s.id,
          type: "in",
          label: `Venda - ${s.listings?.title || "Conta"}`,
          date: formatRelativeDate(d),
          amount: Number(s.seller_receives),
          group: getGroup(d),
        });
      });

      // Pending transactions (escrow)
      const { data: pending } = await supabase
        .from("transactions")
        .select("id, amount, created_at, listings(title)")
        .eq("seller_id", user!.id)
        .in("status", ["paid", "transfer_in_progress"])
        .order("created_at", { ascending: false })
        .limit(5);

      pending?.forEach((p: any) => {
        const d = new Date(p.created_at);
        txItems.push({
          id: p.id,
          type: "escrow",
          label: `Custódia - ${p.listings?.title || "Conta"}`,
          date: formatRelativeDate(d),
          amount: Number(p.amount),
          group: getGroup(d),
        });
      });

      // Withdrawals
      const { data: withdrawals } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);

      withdrawals?.forEach((w: any) => {
        const d = new Date(w.created_at);
        txItems.push({
          id: w.id,
          type: "out",
          label: `Saque via Pix${w.status === "pending" ? " (pendente)" : ""}`,
          date: formatRelativeDate(d),
          amount: -Number(w.amount),
          group: getGroup(d),
        });
      });

      // Sort by most recent
      txItems.sort((a, b) => {
        const order = ["Hoje", "Ontem", "Esta semana", "Anteriores"];
        return order.indexOf(a.group) - order.indexOf(b.group);
      });

      setTransactions(txItems);
    } catch (err) {
      console.error("Error loading wallet:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeDate = (d: Date) => {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Agora";
    if (hours < 24) return `Hoje, ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    if (hours < 48) return `Ontem, ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + `, ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const getGroup = (d: Date) => {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return "Hoje";
    if (hours < 48) return "Ontem";
    if (hours < 168) return "Esta semana";
    return "Anteriores";
  };

  const groups = ["Hoje", "Ontem", "Esta semana", "Anteriores"].filter((g) =>
    transactions.some((t) => t.group === g)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pb-20">
        <PageHeader title="Minha Carteira" />
        <div className="flex items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader title="Minha Carteira" />

      <div className="px-4 pt-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary to-[#1A4BC4] rounded-2xl p-6 text-white">
          <p className="text-xs text-white/70">Saldo disponível</p>
          <p className="text-4xl font-semibold mt-1">
            R$ {wallet.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          {wallet.pending > 0 && (
            <p className="text-[13px] text-white/60 mt-1 flex items-center gap-1">
              <Lock className="h-3 w-3" /> R$ {wallet.pending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em custódia (Escrow)
            </p>
          )}
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setShowWithdraw(true)}
              className="flex-1 bg-white text-primary py-2.5 rounded-xl text-sm font-semibold"
            >
              Sacar →
            </button>
            <button className="flex-1 border border-white/40 text-white py-2.5 rounded-xl text-sm font-medium">
              Ver extrato
            </button>
          </div>
        </div>

        {/* Transaction History */}
        {transactions.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-[#111] mb-3">Histórico</h3>
            {groups.map((group) => (
              <div key={group}>
                <p className="text-[12px] text-[#999] uppercase font-semibold pt-3 pb-2">{group}</p>
                <div className="space-y-2">
                  {transactions
                    .filter((t) => t.group === group)
                    .map((tx) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl border border-[#E8E8E8] px-4 py-3 flex items-center gap-3"
                      >
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                            tx.type === "in"
                              ? "bg-success/10"
                              : tx.type === "escrow"
                                ? "bg-[#FF6900]/10"
                                : "bg-destructive/10"
                          }`}
                        >
                          {tx.type === "in" && <ArrowDown className="h-4 w-4 text-success" />}
                          {tx.type === "out" && <ArrowUp className="h-4 w-4 text-destructive" />}
                          {tx.type === "escrow" && <Lock className="h-4 w-4 text-[#FF6900]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] text-[#111] truncate">{tx.label}</p>
                          <p className="text-[11px] text-[#999]">{tx.date}</p>
                        </div>
                        <p
                          className={`text-[15px] font-semibold ${
                            tx.amount > 0 ? "text-success" : "text-destructive"
                          }`}
                        >
                          {tx.amount > 0 ? "+" : ""}R${" "}
                          {Math.abs(tx.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </motion.div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#999] text-sm">Nenhuma transação ainda</p>
          </div>
        )}
      </div>

      <WithdrawModal
        open={showWithdraw}
        onClose={() => { setShowWithdraw(false); loadWalletData(); }}
        balance={wallet.balance}
        pixKey={pixKey}
      />
    </div>
  );
}
