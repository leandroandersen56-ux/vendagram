import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, ShoppingBag, AlertTriangle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const notifications = [
  { id: 1, icon: ShoppingBag, title: "Nova compra!", body: "Buyer003 comprou sua conta Free Fire.", time: "2h atrás", read: false, color: "text-success" },
  { id: 2, icon: CheckCircle2, title: "Passo confirmado", body: "O comprador confirmou o passo 3/9 do checklist.", time: "5h atrás", read: false, color: "text-info" },
  { id: 3, icon: DollarSign, title: "Pagamento liberado!", body: "R$ 315,00 foram adicionados à sua carteira.", time: "1d atrás", read: false, color: "text-primary" },
  { id: 4, icon: AlertTriangle, title: "Disputa aberta", body: "O comprador abriu uma disputa na transação TX003.", time: "2d atrás", read: true, color: "text-destructive" },
  { id: 5, icon: CheckCircle2, title: "Transação concluída", body: "A transação TX001 foi finalizada com sucesso.", time: "3d atrás", read: true, color: "text-success" },
];

export default function PanelNotifications() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">Notificações</h1>
        <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">Marcar todas como lidas</Button>
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <Card key={n.id} className={`bg-card border-border p-4 ${!n.read ? "border-l-2 border-l-primary" : ""}`}>
            <div className="flex items-start gap-3">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${n.color === "text-success" ? "bg-success/10" : n.color === "text-info" ? "bg-info/10" : n.color === "text-primary" ? "bg-primary/10" : "bg-destructive/10"}`}>
                <n.icon className={`h-4 w-4 ${n.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  {!n.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
