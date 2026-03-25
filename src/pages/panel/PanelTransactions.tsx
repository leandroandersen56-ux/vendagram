import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { formatBRL } from "@/lib/mock-data";

const mockTransactions = [
  { id: "tx1", title: "Conta Free Fire Nível 75", role: "comprador", amount: 350, status: "completed", date: "20/03/2024" },
  { id: "tx2", title: "Instagram 50K Seguidores", role: "vendedor", amount: 1200, status: "transfer_in_progress", date: "21/03/2024" },
  { id: "tx3", title: "TikTok 100K Humor", role: "comprador", amount: 2500, status: "credentials_pending", date: "22/03/2024" },
];

const statusMap: Record<string, { label: string; className: string }> = {
  pending_payment: { label: "Aguardando Pagamento", className: "bg-muted text-muted-foreground" },
  credentials_pending: { label: "Aguardando Credenciais", className: "bg-info/10 text-info" },
  transfer_in_progress: { label: "Em Transferência", className: "bg-warning/10 text-warning" },
  completed: { label: "Concluída", className: "bg-success/10 text-success" },
  disputed: { label: "Disputa", className: "bg-destructive/10 text-destructive" },
};

export default function PanelTransactions() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-xl font-bold text-foreground mb-6">Minhas Transações</h1>

      <div className="space-y-3">
        {mockTransactions.map((tx) => {
          const st = statusMap[tx.status] || statusMap.pending_payment;
          return (
            <Card key={tx.id} className="bg-card border-border p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{tx.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${st.className} border-0 text-[10px]`}>{st.label}</Badge>
                    <Badge className="bg-muted text-muted-foreground border-0 text-[10px] capitalize">{tx.role}</Badge>
                    <span className="text-xs text-muted-foreground">{tx.date}</span>
                  </div>
                </div>
                <p className="text-lg font-bold text-primary shrink-0">{formatBRL(tx.amount)}</p>
                <Link to={`/transaction/${tx.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3 w-3" /></Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
