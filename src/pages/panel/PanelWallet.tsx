import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, Wallet, Clock } from "lucide-react";
import { formatBRL } from "@/lib/mock-data";

export default function PanelWallet() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-xl font-bold text-foreground mb-6">Carteira</h1>

      {/* Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-success" />
            <p className="text-xs text-muted-foreground">Disponível</p>
          </div>
          <p className="text-2xl font-bold text-success">{formatBRL(890)}</p>
        </Card>
        <Card className="bg-card border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-warning" />
            <p className="text-xs text-muted-foreground">Pendente (escrow)</p>
          </div>
          <p className="text-2xl font-bold text-warning">{formatBRL(1200)}</p>
        </Card>
        <Card className="bg-card border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Total Ganho</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatBRL(4560)}</p>
        </Card>
      </div>

      {/* Withdraw */}
      <Card className="bg-card border-border p-6 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Solicitar Saque via Pix</h3>
        <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg mb-4">
          <p className="text-sm text-muted-foreground">Chave Pix:</p>
          <p className="text-sm text-foreground font-mono">***.***.***-00</p>
        </div>
        <Button variant="hero" disabled>
          Solicitar Saque — {formatBRL(890)}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">Processamento em até 24h úteis</p>
      </Card>

      {/* History */}
      <Card className="bg-card border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">Histórico</h3>
        <div className="space-y-3">
          {[
            { type: "in", desc: "Venda: Conta Free Fire", amount: 315, date: "20/03", status: "Concluído" },
            { type: "in", desc: "Venda: Facebook Marketplace", amount: 135, date: "18/03", status: "Concluído" },
            { type: "out", desc: "Saque Pix", amount: -500, date: "15/03", status: "Processado" },
            { type: "in", desc: "Venda: Valorant Imortal", amount: 720, date: "10/03", status: "Concluído" },
          ].map((h, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${h.type === "in" ? "bg-success/10" : "bg-destructive/10"}`}>
                {h.type === "in" ? <ArrowDownRight className="h-4 w-4 text-success" /> : <ArrowUpRight className="h-4 w-4 text-destructive" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{h.desc}</p>
                <p className="text-xs text-muted-foreground">{h.date}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${h.type === "in" ? "text-success" : "text-destructive"}`}>
                  {h.type === "in" ? "+" : ""}{formatBRL(Math.abs(h.amount))}
                </p>
                <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">{h.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
