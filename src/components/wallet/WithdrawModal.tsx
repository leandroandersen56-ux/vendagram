
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/mock-data";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PIX_KEY_TYPES = [
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "email", label: "Email" },
  { value: "telefone", label: "Telefone" },
  { value: "chave", label: "Chave aleatória" },
];

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
  pixKey: string;
}

export default function WithdrawModal({ open, onClose, balance, pixKey }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [pixKeyValue, setPixKeyValue] = useState(pixKey || "");
  const [pixKeyType, setPixKeyType] = useState("cpf");
  const [submitting, setSubmitting] = useState(false);

  const handleWithdraw = async () => {
    const value = Number(amount);
    if (!value || value < 20) {
      toast.error("Valor mínimo para saque é R$ 20,00");
      return;
    }
    if (value > balance) {
      toast.error("Saldo insuficiente");
      return;
    }
    if (!pixKeyValue.trim()) {
      toast.error("Informe a chave Pix");
      return;
    }

    setSubmitting(true);
    try {
      const res = await supabase.functions.invoke("process-withdrawal", {
        body: { amount: value, pix_key: pixKeyValue.trim(), pix_key_type: pixKeyType },
      });

      if (res.error) throw new Error(res.error.message);

      toast.success(`Saque de ${formatBRL(value)} solicitado! Processamento em até 24h úteis.`);
      setAmount("");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao solicitar saque");
    } finally {
      setSubmitting(false);
    }
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
            <h2 className="text-lg font-semibold text-foreground">Solicitar Saque</h2>
          </div>

          <div className="space-y-4">
            {/* Pix key type */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Tipo de chave Pix</p>
              <select
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PIX_KEY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Pix key value */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Chave Pix</p>
              <Input
                value={pixKeyValue}
                onChange={(e) => setPixKeyValue(e.target.value)}
                placeholder={pixKeyType === "email" ? "email@exemplo.com" : pixKeyType === "telefone" ? "(11) 99999-9999" : "Sua chave Pix"}
                className="bg-muted/30 border-border h-11"
              />
            </div>

            {/* Amount */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Valor do saque</p>
              <Input
                type="number"
                min={20}
                max={balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="R$ 0,00"
                className="bg-muted/30 border-border h-11"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-muted-foreground">Mínimo R$ 20,00 · Disponível: {formatBRL(balance)}</p>
                <button className="text-xs text-primary hover:underline" onClick={() => setAmount(String(balance))}>
                  Sacar tudo
                </button>
              </div>
            </div>

            {Number(amount) >= 20 && (
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  Você receberá <strong className="text-foreground">{formatBRL(Number(amount))}</strong> em até 1 dia útil via Pix.
                </p>
              </div>
            )}

            <Button
              variant="hero"
              className="w-full h-11"
              onClick={handleWithdraw}
              disabled={submitting || Number(amount) < 20}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Solicitar Saque — ${formatBRL(Number(amount) || 0)}`
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
