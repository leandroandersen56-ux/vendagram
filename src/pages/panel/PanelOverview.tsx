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
    { label: "Compras", value: "2", icon: ShoppingBag, change: "+1 este mês", accent: "text-primary" },
    { label: "Anúncios Ativos", value: "3", icon: Tag, change: "1 vendido", accent: "text-primary" },
    { label: "Avaliação", value: "4.8", icon: Star, change: "12 avaliações", accent: "text-primary" },
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
    { label: "QR Code", icon: ScanLine, color: "text-warning", bg: "bg-warning/10", onClick: () => setShowQR(true) },
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
        {/* Header compacto */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-display font-bold text-foreground tracking-tight truncate">
              Olá, {user?.name} 👋
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Resumo da sua conta</p>
          </div>
          <Link to="/painel/anuncios/novo" className="shrink-0">
            <Button variant="hero" size="sm" className="gap-1 text-xs h-8 px-3">
              <Plus className="h-3.5 w-3.5" /> Novo Anúncio
            </Button>
          </Link>
        </div>

        {/* Stats - horizontal scroll no mobile */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:mx-0 sm:px-0">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="min-w-[140px] flex-1 sm:min-w-0"
            >
              <div className="bg-background border border-border rounded-2xl p-4 sm:p-5 h-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    <p className="text-xl sm:text-2xl font-display font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{stat.change}</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Carteira - saldo principal destacado */}
        <div id="wallet-section" className="scroll-mt-20">
          <h2 className="text-sm sm:text-base font-display font-bold text-foreground mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Carteira
          </h2>

          {/* Saldo principal + ações rápidas inline */}
          <div className="bg-background border border-border rounded-2xl p-4 sm:p-5 mb-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Disponível</p>
                <p className="text-2xl sm:text-3xl font-bold text-success mt-0.5">{formatBRL(balance)}</p>
              </div>
            </div>

            {/* Ações rápidas inline */}
            <div className="grid grid-cols-4 gap-2">
              {walletActions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl hover:bg-muted transition-all active:scale-95"
                >
                  <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full ${action.bg} flex items-center justify-center`}>
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pendente e Total lado a lado */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <div className="bg-background border border-border rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="h-3.5 w-3.5 text-warning" />
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Pendente</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-warning">{formatBRL(pending)}</p>
            </div>
            <div className="bg-background border border-border rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Total Ganho</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">{formatBRL(totalEarned)}</p>
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-background border border-border rounded-2xl p-4 sm:p-5 mb-5">
            <h3 className="font-semibold text-foreground text-xs sm:text-sm mb-3 flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Movimentação (7 dias)
            </h3>
            <BalanceChart />
          </div>

          {/* Histórico */}
          <div className="bg-background border border-border rounded-2xl p-4 sm:p-5">
            <h3 className="font-semibold text-foreground text-sm mb-3">Histórico</h3>
            
            {/* Filtros com scroll horizontal */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                    activeFilter === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              {filteredHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Nenhuma transação encontrada</p>
              ) : (
                filteredHistory.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-2.5 p-3 bg-muted/50 hover:bg-muted rounded-xl transition-colors"
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${getIconBg(h.type)}`}>
                      {getIcon(h.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-[13px] font-medium text-foreground truncate">{h.desc}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {h.date}{h.counterpart ? ` · ${h.counterpart}` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs sm:text-sm font-bold ${h.amount > 0 ? "text-success" : "text-destructive"}`}>
                        {h.amount > 0 ? "+" : ""}{formatBRL(Math.abs(h.amount))}
                      </p>
                      <Badge className={`border-0 text-[9px] sm:text-[10px] mt-0.5 ${getStatusColor(h.status)}`}>{h.status}</Badge>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="bg-background border border-border rounded-2xl p-4 sm:p-5">
          <h3 className="font-semibold text-foreground text-sm mb-3">Atividade Recente</h3>
          <div className="space-y-1.5">
            {[
              { text: "Conta Free Fire vendida por R$ 350", time: "2h atrás", color: "bg-success" },
              { text: "Compra de conta Instagram em andamento", time: "5h atrás", color: "bg-warning" },
              { text: "Novo anúncio publicado: TikTok 50K", time: "1d atrás", color: "bg-info" },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-2.5 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                <div className={`h-2 w-2 rounded-full ${a.color} shrink-0`} />
                <p className="text-xs sm:text-[13px] text-foreground flex-1 min-w-0">{a.text}</p>
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
