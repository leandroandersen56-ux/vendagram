import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ScanLine, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
}

export default function QRScannerModal({ open, onClose, balance }: QRScannerModalProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<"scan" | "paste" | "confirm">("scan");
  const [pastedCode, setPastedCode] = useState("");
  const [parsedData, setParsedData] = useState<{ name: string; amount: number; description: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const parsePixCode = (code: string) => {
    // Simple mock parsing
    setParsedData({
      name: "LOJA EXEMPLO LTDA",
      amount: 89.90,
      description: "Pagamento via QR Code",
    });
    setMode("confirm");
  };

  const handlePay = () => {
    if (!parsedData) return;
    if (parsedData.amount > balance) {
      toast({ title: "Saldo insuficiente", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    toast({ title: "Pagamento realizado!", description: `${formatBRL(parsedData.amount)} debitado do seu saldo.` });
    setSubmitting(false);
    resetAndClose();
  };

  const resetAndClose = () => {
    setMode("scan");
    setPastedCode("");
    setParsedData(null);
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
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={resetAndClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl z-10"
        >
          <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-muted-foreground" onClick={resetAndClose}>
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ScanLine className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Pagar com QR Code</h2>
          </div>

          {(mode === "scan" || mode === "paste") && (
            <div className="space-y-5">
              {/* Camera placeholder */}
              <div className="aspect-square max-h-[240px] bg-muted/20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3">
                <Camera className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center px-4">
                  Câmera indisponível no navegador.<br />Cole o código Pix abaixo.
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Pix Copia e Cola</p>
                <Input
                  value={pastedCode}
                  onChange={(e) => setPastedCode(e.target.value)}
                  placeholder="Cole o código Pix aqui..."
                  className="bg-muted/30 border-border h-11 font-mono text-xs"
                />
              </div>

              <Button
                variant="hero"
                className="w-full h-11"
                onClick={() => parsePixCode(pastedCode)}
                disabled={!pastedCode.trim()}
              >
                Ler Código
              </Button>
            </div>
          )}

          {mode === "confirm" && parsedData && (
            <div className="space-y-5">
              <div className="bg-muted/20 border border-border rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Destinatário</span>
                  <span className="text-foreground font-medium">{parsedData.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="text-primary font-bold text-lg">{formatBRL(parsedData.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descrição</span>
                  <span className="text-foreground">{parsedData.description}</span>
                </div>
              </div>

              {parsedData.amount > balance && (
                <div className="flex items-center gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">Saldo insuficiente ({formatBRL(balance)} disponível)</p>
                </div>
              )}

              <Button
                variant="hero"
                className="w-full h-11"
                onClick={handlePay}
                disabled={submitting || parsedData.amount > balance}
              >
                Pagar {formatBRL(parsedData.amount)} com meu saldo
              </Button>

              <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={() => setMode("scan")}>
                Voltar
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
