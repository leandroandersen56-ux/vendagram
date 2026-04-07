import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownRight, ArrowUpRight, Wallet, Clock, Loader2, Inbox,
  ArrowDown, ArrowRight, ArrowUp, ScanLine,
  RefreshCcw, Send, Repeat
} from "lucide-react";
import { formatBRL } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DepositModal from "@/components/wallet/DepositModal";
import TransferModal from "@/components/wallet/TransferModal";
import WithdrawModal from "@/components/wallet/WithdrawModal";
import QRScannerModal from "@/components/wallet/QRScannerModal";
import BalanceChart from "@/components/wallet/BalanceChart";

type HistoryItem = {
  type: string;
  category: string;
  desc: string;
  counterpart: string | null;
  amount: number;
  date: string;
  status: string;
};

type FilterTab = "all" | "in" | "out" | "escrow" | "transfer" | "deposit" | "withdraw";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "in", label: "Entradas" },
  { id: "out", label: "Saídas" },
  { id: "escrow", label: "Escrow" },
  { id: "transfer", label: "Transferências" },
  { id: "deposit", label: "Depósitos" },
  { id: "withdraw", label: "Saques" },
];

function getIcon(type: string) {
  switch (type) {
    case "in": return <ArrowDownRight className="h-4 w-4 text-success" />;
    case "out": return <ArrowUpRight className="h-4 w-4 text-destructive" />;
    case "escrow": return <RefreshCcw className="h-4 w-4 text-warning" />;
    case "transfer": return <Send className="h-4 w-4 text-info" />;
    case "deposit": return <ArrowDown className="h-4 w-4 text-success" />;
    default: return <Repeat className="h-4 w-4 text-muted-foreground" />;
  }
}

function getIconBg(type: string) {
  switch (type) {
    case "in": case "deposit": return "bg-success/10";
    case "out": return "bg-destructive/10";
    case "escrow": return "bg-warning/10";
    case "transfer": return "bg-info/10";
    default: return "bg-muted/10";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "Concluído": case "Processado": return "bg-success/10 text-success";
    case "Pendente": return "bg-warning/10 text-warning";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function PanelWallet() {
  const { user } = useAuth();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);

  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [pixKey, setPixKey] = useState("***.***.***-00");

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    loadWalletData();
  }, [user?.id]);

  const loadWalletData = async () => {
    const uid = user!.id;

    const [walletRes, txRes, withdrawRes, depositRes, transfersInRes, transfersOutRes, profileRes] = await Promise.all([
      supabase.from("wallets").select("balance, pending, total_earned").eq("user_id", uid).single(),
      supabase.from("transactions").select("amount, status, created_at, listings(title)").or(`buyer_id.eq.${uid},seller_id.eq.${uid}`).order("created_at", { ascending: false }).limit(20),
      supabase.from("withdrawals").select("amount, status, created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(10),
      supabase.from("deposit_requests").select("amount, status, created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(10),
      supabase.from("internal_transfers").select("amount, created_at, from_user_id").eq("to_user_id", uid).order("created_at", { ascending: false }).limit(10),
      supabase.from("internal_transfers").select("amount, created_at, to_user_id").eq("from_user_id", uid).order("created_at", { ascending: false }).limit(10),
      supabase.from("profiles").select("pix_key").eq("user_id", uid).single(),
    ]);

    if (walletRes.data) {
      setBalance(Number(walletRes.data.balance));
      setPending(Number(walletRes.data.pending));
      setTotalEarned(Number(walletRes.data.total_earned));
    }

    if (profileRes.data?.pix_key) setPixKey(profileRes.data.pix_key);

    const fmt = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    const items: HistoryItem[] = [];

    (txRes.data || []).forEach((t: any) => {
      const title = t.listings?.title || "Transação";
      const isCompleted = t.status === "completed";
      const isPending = ["pending_payment", "paid", "transfer_in_progress"].includes(t.status);
      items.push({
        type: isCompleted ? "in" : isPending ? "escrow" : "out",
        category: isCompleted ? "in" : isPending ? "escrow" : "out",
        desc: title,
        counterpart: null,
        amount: isCompleted ? Number(t.amount) : isPending ? Number(t.amount) : -Number(t.amount),
        date: fmt(t.created_at),
        status: isCompleted ? "Concluído" : isPending ? "Pendente" : "Cancelado",
      });
    });

    (withdrawRes.data || []).forEach((w: any) => {
      items.push({
        type: "out", category: "withdraw", desc: "Saque Pix", counterpart: null,
        amount: -Number(w.amount), date: fmt(w.created_at),
        status: w.status === "processed" ? "Processado" : "Pendente",
      });
    });

    (depositRes.data || []).forEach((d: any) => {
      items.push({
        type: "deposit", category: "deposit", desc: "Depósito via Pix", counterpart: null,
        amount: Number(d.amount), date: fmt(d.created_at),
        status: d.status === "completed" ? "Concluído" : "Pendente",
      });
    });

    (transfersInRes.data || []).forEach((t: any) => {
      items.push({
        type: "transfer", category: "transfer", desc: "Transferência recebida", counterpart: null,
        amount: Number(t.amount), date: fmt(t.created_at), status: "Concluído",
      });
    });

    (transfersOutRes.data || []).forEach((t: any) => {
      items.push({
        type: "out", category: "transfer", desc: "Transferência enviada", counterpart: null,
        amount: -Number(t.amount), date: fmt(t.created_at), status: "Concluído",
      });
    });

    items.sort((a, b) => b.date.localeCompare(a.date));
    setHistory(items);
    setLoading(false);
  };

  const filteredHistory = history.filter((h) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "in") return h.amount > 0 && h.category === "in";
    if (activeFilter === "out") return h.amount < 0 && h.category !== "transfer";
    return h.category === activeFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-foreground mb-6">Carteira</h1>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-success" />
              <p className="text-xs text-muted-foreground">Disponível</p>
            </div>
            <p className="text-2xl font-semibold text-success">{formatBRL(balance)}</p>
          </Card>
          <Card className="bg-card border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-warning" />
              <p className="text-xs text-muted-foreground">Pendente (escrow)</p>
            </div>
            <p className="text-2xl font-semibold text-warning">{formatBRL(pending)}</p>
          </Card>
          <Card className="bg-card border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Total Ganho</p>
            </div>
            <p className="text-2xl font-semibold text-foreground">{formatBRL(totalEarned)}</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <button onClick={() => setShowDeposit(true)} className="group flex flex-col items-center gap-2.5 p-4 bg-card border border-border rounded-xl hover:border-success/40 hover:bg-success/5 transition-all">
            <div className="h-11 w-11 rounded-full bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
              <ArrowDown className="h-5 w-5 text-success" />
            </div>
            <span className="text-sm font-medium text-foreground">Depositar</span>
          </button>
          <button onClick={() => setShowTransfer(true)} className="group flex flex-col items-center gap-2.5 p-4 bg-card border border-border rounded-xl hover:border-info/40 hover:bg-info/5 transition-all">
            <div className="h-11 w-11 rounded-full bg-info/10 flex items-center justify-center group-hover:bg-info/20 transition-colors">
              <ArrowRight className="h-5 w-5 text-info" />
            </div>
            <span className="text-sm font-medium text-foreground">Transferir</span>
          </button>
          <button onClick={() => setShowWithdraw(true)} className="group flex flex-col items-center gap-2.5 p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all">
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ArrowUp className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">Sacar</span>
          </button>
          <button onClick={() => setShowQR(true)} className="group flex flex-col items-center gap-2.5 p-4 bg-card border border-border rounded-xl hover:border-warning/40 hover:bg-warning/5 transition-all">
            <div className="h-11 w-11 rounded-full bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
              <ScanLine className="h-5 w-5 text-warning" />
            </div>
            <span className="text-sm font-medium text-foreground">Pagar com QR</span>
          </button>
        </div>

        {/* Transaction History */}
        <Card className="bg-card border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Histórico</h3>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeFilter === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma movimentação ainda</p>
              </div>
            ) : (
              filteredHistory.map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${getIconBg(h.type)}`}>
                    {getIcon(h.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{h.desc}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{h.date}</p>
                      {h.counterpart && <span className="text-xs text-muted-foreground">· {h.counterpart}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${h.amount > 0 ? "text-success" : "text-destructive"}`}>
                      {h.amount > 0 ? "+" : ""}{formatBRL(Math.abs(h.amount))}
                    </p>
                    <Badge className={`border-0 text-[10px] ${getStatusColor(h.status)}`}>{h.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </motion.div>

      <DepositModal open={showDeposit} onClose={() => setShowDeposit(false)} />
      <TransferModal open={showTransfer} onClose={() => setShowTransfer(false)} balance={balance} />
      <WithdrawModal open={showWithdraw} onClose={() => setShowWithdraw(false)} balance={balance} pixKey={pixKey} />
      <QRScannerModal open={showQR} onClose={() => setShowQR(false)} balance={balance} />
    </>
  );
}
