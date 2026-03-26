import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
  pixKey: string;
}

export default function WithdrawModal({ open, onClose, balance, pixKey }: WithdrawModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleWithdraw = () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast({ title: "Informe um valor válido", variant: "destructive" });
      return;
    }
    if (value > balance) {
      toast({ title: "Saldo insuficiente", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    toast({ title: "Saque solicitado!", description: `${formatBRL(value)} será enviado para sua chave Pix em até 24h úteis.` });
    setSubmitting(false);
    setAmount("");
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl z-10"
        >
          <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-muted-foreground" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowUp className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Solicitar Saque</h2>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">Chave Pix:</p>
              <p className="text-sm text-foreground font-mono">{pixKey || "***.***.***-00"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Valor do saque</p>
              <Input
                type="number"
                min={1}
                max={balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="R$ 0,00"
                className="bg-muted/30 border-border h-11"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-muted-foreground">Disponível: {formatBRL(balance)}</p>
                <button className="text-xs text-primary hover:underline" onClick={() => setAmount(String(balance))}>
                  Sacar tudo
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Processamento em até 24h úteis</p>

            <Button variant="hero" className="w-full h-11" onClick={handleWithdraw} disabled={submitting}>
              Solicitar Saque — {formatBRL(Number(amount) || 0)}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
