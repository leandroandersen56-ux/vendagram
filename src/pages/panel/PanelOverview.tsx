import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShoppingBag, Tag, Wallet, TrendingUp, ArrowUpRight, Plus, Star,
  Clock, ArrowDown, ArrowRight, ArrowUp, ScanLine,
  ArrowDownRight, RefreshCcw, Send, Repeat, Activity
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
  { id: "transfer", label: "Transferências" },
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

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground tracking-tight">
              Olá, {user?.name} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Aqui está um resumo da sua conta</p>
          </div>
          <Link to="/painel/anuncios/novo">
            <Button variant="hero" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Novo Anúncio
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="bg-background border border-border rounded-2xl p-5 hover:border-primary/30 transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl font-display font-bold text-foreground mt-1.5">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Wallet Section */}
        <div id="wallet-section" className="scroll-mt-20">
          <h2 className="text-base font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Wallet className="h-4.5 w-4.5 text-primary" />
            Carteira
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="bg-background border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="h-6 w-6 rounded-lg bg-success/10 flex items-center justify-center">
                  <Wallet className="h-3.5 w-3.5 text-success" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">Disponível</p>
              </div>
              <p className="text-2xl font-bold text-success">{formatBRL(balance)}</p>
            </div>
            <div className="bg-background border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="h-6 w-6 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 text-warning" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">Pendente (escrow)</p>
              </div>
              <p className="text-2xl font-bold text-warning">{formatBRL(pending)}</p>
            </div>
            <div className="bg-background border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">Total Ganho</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatBRL(totalEarned)}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Depositar", icon: ArrowDown, color: "text-success", bg: "bg-success/10", hoverBorder: "hover:border-success/30", onClick: () => setShowDeposit(true) },
              { label: "Transferir", icon: ArrowRight, color: "text-info", bg: "bg-info/10", hoverBorder: "hover:border-info/30", onClick: () => setShowTransfer(true) },
              { label: "Sacar", icon: ArrowUp, color: "text-primary", bg: "bg-primary/10", hoverBorder: "hover:border-primary/30", onClick: () => setShowWithdraw(true) },
              { label: "Pagar com QR", icon: ScanLine, color: "text-warning", bg: "bg-warning/10", hoverBorder: "hover:border-warning/30", onClick: () => setShowQR(true) },
            ].map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className={`group flex flex-col items-center gap-2.5 p-5 bg-background border border-border rounded-2xl ${action.hoverBorder} transition-all duration-200 active:scale-[0.98]`}
              >
                <div className={`h-11 w-11 rounded-xl ${action.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="text-[13px] font-medium text-foreground">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Balance Chart */}
          <div className="bg-background border border-border rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Movimentação (últimos 7 dias)
            </h3>
            <BalanceChart />
          </div>

          {/* Transaction History */}
          <div className="bg-background border border-border rounded-2xl p-5 sm:p-6">
            <h3 className="font-semibold text-foreground mb-4">Histórico</h3>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    activeFilter === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {filteredHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação encontrada</p>
              ) : (
                filteredHistory.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-3.5 bg-muted/50 hover:bg-muted rounded-xl transition-colors"
                  >
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${getIconBg(h.type)}`}>
                      {getIcon(h.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground">{h.desc}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[11px] text-muted-foreground">{h.date}</p>
                        {h.counterpart && <span className="text-[11px] text-muted-foreground/70">· {h.counterpart}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${h.amount > 0 ? "text-success" : "text-destructive"}`}>
                        {h.amount > 0 ? "+" : ""}{formatBRL(Math.abs(h.amount))}
                      </p>
                      <Badge className={`border-0 text-[10px] mt-0.5 ${getStatusColor(h.status)}`}>{h.status}</Badge>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-background border border-border rounded-2xl p-5 sm:p-6 mt-6">
          <h3 className="font-semibold text-foreground mb-4">Atividade Recente</h3>
          <div className="space-y-2">
            {[
              { text: "Conta Free Fire vendida por R$ 350", time: "2h atrás", color: "bg-success" },
              { text: "Compra de conta Instagram em andamento", time: "5h atrás", color: "bg-warning" },
              { text: "Novo anúncio publicado: TikTok 50K", time: "1d atrás", color: "bg-info" },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                <div className={`h-2.5 w-2.5 rounded-full ${a.color} shrink-0`} />
                <p className="text-[13px] text-foreground flex-1">{a.text}</p>
                <span className="text-[11px] text-muted-foreground shrink-0">{a.time}</span>
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
