import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, ClipboardList } from "lucide-react";
import { formatBRL } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TransactionRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  platform_fee: number;
  seller_receives: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  completed_at: string | null;
  listing_title?: string;
};

const statusMap: Record<string, { label: string; className: string }> = {
  pending_payment: { label: "Aguardando Pagamento", className: "bg-muted text-muted-foreground" },
  paid: { label: "Pago", className: "bg-info/10 text-info" },
  transfer_in_progress: { label: "Em Transferência", className: "bg-warning/10 text-warning" },
  completed: { label: "Concluída", className: "bg-success/10 text-success" },
  disputed: { label: "Disputa", className: "bg-destructive/10 text-destructive" },
  cancelled: { label: "Cancelada", className: "bg-muted text-muted-foreground" },
  refunded: { label: "Reembolsada", className: "bg-muted text-muted-foreground" },
};

export default function PanelTransactions() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<TransactionRow | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("transactions")
        .select("*, listings(title)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setTransactions(data.map((t: any) => ({
          ...t,
          listing_title: t.listings?.title || "Anúncio",
        })));
      }
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("pt-BR");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-xl font-semibold text-foreground mb-6">Minhas Transações</h1>

      {transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const st = statusMap[tx.status] || statusMap.pending_payment;
            const role = currentUserId === tx.buyer_id ? "Comprador" : currentUserId === tx.seller_id ? "Vendedor" : "—";
            return (
              <Card key={tx.id} className="bg-card border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{tx.listing_title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${st.className} border-0 text-[10px]`}>{st.label}</Badge>
                      <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">{role}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</span>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-primary shrink-0">{formatBRL(tx.amount)}</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedTx(tx)}>
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-card border-border p-12 text-center">
          <ClipboardList className="h-8 w-8 text-primary mx-auto mb-3" />
          <p className="font-medium text-foreground mb-2">Nenhuma transação</p>
          <p className="text-sm text-muted-foreground">Suas compras e vendas aparecerão aqui</p>
        </Card>
      )}

      <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalhes da Transação</DialogTitle>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Anúncio</p>
                <p className="font-medium text-foreground">{selectedTx.listing_title}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={`${(statusMap[selectedTx.status] || statusMap.pending_payment).className} border-0 text-xs mt-1`}>
                    {(statusMap[selectedTx.status] || statusMap.pending_payment).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seu papel</p>
                  <p className="text-sm font-medium text-foreground">
                    {currentUserId === selectedTx.buyer_id ? "Comprador" : "Vendedor"}
                  </p>
                </div>
              </div>
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor total</span>
                  <span className="text-foreground font-medium">{formatBRL(selectedTx.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa (5%)</span>
                  <span className="text-muted-foreground">{formatBRL(selectedTx.platform_fee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vendedor recebe</span>
                  <span className="text-primary font-semibold">{formatBRL(selectedTx.seller_receives)}</span>
                </div>
              </div>
              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Criada em</span>
                  <span className="text-foreground">{formatDate(selectedTx.created_at)}</span>
                </div>
                {selectedTx.paid_at && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Pago em</span>
                    <span className="text-foreground">{formatDate(selectedTx.paid_at)}</span>
                  </div>
                )}
                {selectedTx.completed_at && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Concluída em</span>
                    <span className="text-foreground">{formatDate(selectedTx.completed_at)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
