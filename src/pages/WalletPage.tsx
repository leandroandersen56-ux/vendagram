import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Lock, Wallet } from "lucide-react";
import PageHeader from "@/components/menu/PageHeader";
import WithdrawModal from "@/components/wallet/WithdrawModal";

const TRANSACTIONS = [
  { id: 1, type: "in", label: "Venda - Conta Instagram 50K", date: "Hoje, 14:30", amount: 737.99, group: "Hoje" },
  { id: 2, type: "escrow", label: "Custódia - TikTok 120K", date: "Hoje, 10:15", amount: 1080, group: "Hoje" },
  { id: 3, type: "out", label: "Saque via Pix", date: "Ontem, 18:00", amount: -500, group: "Ontem" },
  { id: 4, type: "in", label: "Venda - Free Fire Nível 80", date: "15/03, 09:45", amount: 405, group: "Esta semana" },
];

export default function WalletPage() {
  const [showWithdraw, setShowWithdraw] = useState(false);

  const groups = ["Hoje", "Ontem", "Esta semana"].filter((g) => TRANSACTIONS.some((t) => t.group === g));

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader title="Minha Carteira" />

      <div className="px-4 pt-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary to-[#1A4BC4] rounded-2xl p-6 text-white">
          <p className="text-xs text-white/70">Saldo disponível</p>
          <p className="text-4xl font-black mt-1">R$ 1.240,00</p>
          <p className="text-[13px] text-white/60 mt-1 flex items-center gap-1">
            <Lock className="h-3 w-3" /> R$ 380,00 em custódia (Escrow)
          </p>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setShowWithdraw(true)}
              className="flex-1 bg-white text-primary py-2.5 rounded-xl text-sm font-bold"
            >
              Sacar →
            </button>
            <button className="flex-1 border border-white/40 text-white py-2.5 rounded-xl text-sm font-medium">
              Ver extrato
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h3 className="text-sm font-bold text-[#111] mb-3">Histórico</h3>
          {groups.map((group) => (
            <div key={group}>
              <p className="text-[12px] text-[#999] uppercase font-semibold pt-3 pb-2">{group}</p>
              <div className="space-y-2">
                {TRANSACTIONS.filter((t) => t.group === group).map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl border border-[#E8E8E8] px-4 py-3 flex items-center gap-3"
                  >
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === "in" ? "bg-success/10" : tx.type === "escrow" ? "bg-[#FF6900]/10" : "bg-destructive/10"
                    }`}>
                      {tx.type === "in" && <ArrowDown className="h-4 w-4 text-success" />}
                      {tx.type === "out" && <ArrowUp className="h-4 w-4 text-destructive" />}
                      {tx.type === "escrow" && <Lock className="h-4 w-4 text-[#FF6900]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-[#111] truncate">{tx.label}</p>
                      <p className="text-[11px] text-[#999]">{tx.date}</p>
                    </div>
                    <p className={`text-[15px] font-bold ${
                      tx.amount > 0 ? "text-success" : "text-destructive"
                    }`}>
                      {tx.amount > 0 ? "+" : ""}R$ {Math.abs(tx.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <WithdrawModal open={showWithdraw} onClose={() => setShowWithdraw(false)} balance={1240} pixKey="***.***.***-00" />
    </div>
  );
}
