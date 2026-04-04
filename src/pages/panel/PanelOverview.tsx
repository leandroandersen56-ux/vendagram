import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShoppingBag, Tag, Wallet, TrendingUp, ArrowUpRight, Plus, Star,
  Clock, ArrowDown, ArrowRight, ArrowUp, ScanLine,
  ArrowDownRight, RefreshCcw, Send, Repeat, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { formatBRL } from "@/lib/mock-data";
import DepositModal from "@/components/wallet/DepositModal";
import TransferModal from "@/components/wallet/TransferModal";
import WithdrawModal from "@/components/wallet/WithdrawModal";
import QRScannerModal from "@/components/wallet/QRScannerModal";
import BalanceChart from "@/components/wallet/BalanceChart";

type FilterTab = "all" | "in" | "out" | "escrow" | "transfer" | "deposit" | "withdraw";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "in", label: "Entradas" },
  { id: "out", label: "Saídas" },
  { id: "escrow", label: "Escrow" },
  { id: "transfer", label: "Transf." },
  { id: "deposit", label: "Depósitos" },
  { id: "withdraw", label: "Saques" },
];

const HISTORY = [
  { type: "in", category: "in", desc: "Venda: Conta Free Fire", counterpart: "GameBuyer01", amount: 315, date: "20/03 14:32", status: "Concluído" },
  { type: "deposit", category: "deposit", desc: "Depósito via Pix", counterpart: null, amount: 200, date: "19/03 10:15", status: "Concluído" },
  { type: "in", category: "in", desc: "Venda: Facebook Marketplace", counterpart: "SocialBuyer", amount: 135, date: "18/03 09:41", status: "Concluído" },
  { type: "transfer", category: "transfer", desc: "Transferência recebida", counterpart: "@joao_silva", amount: 50, date: "17/03 16:20", status: "Concluído" },
  { type: "out", category: "withdraw", desc: "Saque Pix", counterpart: null, amount: -500, date: "15/03 11:00", status: "Processado" },
  { type: "escrow", category: "escrow", desc: "Escrow: Conta Valorant", counterpart: "ValBuyer99", amount: 720, date: "14/03 08:50", status: "Pendente" },
];

function getIcon(type: string) {
  switch (type) {
    case "in": return <ArrowDownRight className="h-3.5 w-3.5 text-success" />;
    case "out": return <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />;
    case "escrow": return <RefreshCcw className="h-3.5 w-3.5 text-warning" />;
    case "transfer": return <Send className="h-3.5 w-3.5 text-info" />;
    case "deposit": return <ArrowDown className="h-3.5 w-3.5 text-success" />;
    default: return <Repeat className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function getIconBg(type: string) {
  switch (type) {
    case "in": case "deposit": return "bg-success/10";
    case "out": return "bg-destructive/10";
    case "escrow": return "bg-warning/10";
    case "transfer": return "bg-info/10";
    default: return "bg-muted";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "Concluído": case "Processado": return "bg-success/10 text-success";
    case "Pendente": return "bg-warning/10 text-warning";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function PanelOverview() {
  const { user } = useAuth();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const balance = 890;
  const pending = 1200;
  const totalEarned = 4560;

  const stats = [
    { label: "COMPRAS", value: "2", icon: ShoppingBag, sub: "+1 este mês" },
    { label: "ANÚNCIOS ATIVOS", value: "3", icon: Tag, sub: "1 vendido" },
    { label: "AVALIAÇÃO", value: "4.8", icon: Star, sub: "12 reviews" },
  ];

  const filteredHistory = HISTORY.filter((h) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "in") return h.amount > 0 && h.category === "in";
    if (activeFilter === "out") return h.amount < 0 && h.category !== "transfer";
    return h.category === activeFilter;
  });

  const walletActions = [
    { label: "Depositar", icon: ArrowDown, color: "text-success", bg: "bg-success/10", onClick: () => setShowDeposit(true) },
    { label: "Transferir", icon: ArrowRight, color: "text-info", bg: "bg-info/10", onClick: () => setShowTransfer(true) },
    { label: "Sacar", icon: ArrowUp, color: "text-primary", bg: "bg-primary/10", onClick: () => setShowWithdraw(true) },
  ];

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
          <Link to="/painel/anuncios/novo" className="shrink-0">
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
              <p className="text-[9px] text-muted-foreground mt-0.5">{stat.sub}</p>
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

        {/* Gráfico */}
        <div className="bg-background border border-border rounded-2xl p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-primary" />
            Movimentação (7 dias)
          </h3>
          <BalanceChart />
        </div>

        {/* Histórico */}
        <div className="bg-background border border-border rounded-2xl p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Histórico</h3>

          {/* Filtros - wrap instead of scroll */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                  activeFilter === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            {filteredHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Nenhuma transação encontrada</p>
            ) : (
              filteredHistory.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-muted/60 transition-colors"
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${getIconBg(h.type)}`}>
                    {getIcon(h.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{h.desc}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {h.date}{h.counterpart ? ` · ${h.counterpart}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0 pl-1">
                    <p className={`text-xs font-semibold tabular-nums ${h.amount > 0 ? "text-success" : "text-destructive"}`}>
                      {h.amount > 0 ? "+" : ""}{formatBRL(Math.abs(h.amount))}
                    </p>
                    <Badge className={`border-0 text-[9px] px-1.5 py-0 mt-0.5 ${getStatusColor(h.status)}`}>{h.status}</Badge>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="bg-background border border-border rounded-2xl p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Atividade Recente</h3>
          <div className="space-y-1">
            {[
              { text: "Conta Free Fire vendida por R$ 350", time: "2h atrás", color: "bg-success" },
              { text: "Compra de conta Instagram em andamento", time: "5h atrás", color: "bg-warning" },
              { text: "Novo anúncio publicado: TikTok 50K", time: "1d atrás", color: "bg-info" },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-muted/60 transition-colors">
                <div className={`h-1.5 w-1.5 rounded-full ${a.color} shrink-0`} />
                <p className="text-xs text-foreground flex-1 min-w-0 truncate">{a.text}</p>
                <span className="text-[10px] text-muted-foreground shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <DepositModal open={showDeposit} onClose={() => setShowDeposit(false)} />
      <TransferModal open={showTransfer} onClose={() => setShowTransfer(false)} balance={balance} />
      <WithdrawModal open={showWithdraw} onClose={() => setShowWithdraw(false)} balance={balance} pixKey="***.***.***-00" />
      <QRScannerModal open={showQR} onClose={() => setShowQR(false)} balance={balance} />
    </>
  );
}
