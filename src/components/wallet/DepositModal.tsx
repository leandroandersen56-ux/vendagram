import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Clock, ArrowDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { formatBRL } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const QUICK_AMOUNTS = [20, 50, 100, 200, 500];

const CLOUD_FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const CLOUD_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function callDepositFunction<T>(body: unknown): Promise<T> {
  const response = await fetch(`${CLOUD_FUNCTIONS_URL}/create-pix-deposit`, {
    method: "POST",
    headers: {
      apikey: CLOUD_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = { error: raw || `Erro ${response.status}` };
  }

  if (!response.ok) {
    throw new Error(data?.details || data?.error || `Erro ${response.status}`);
  }
  return data as T;
}

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DepositModal({ open, onClose }: DepositModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<"amount" | "cpf" | "qr">("amount");
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState("");
  const [cpf, setCpf] = useState("");
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(1800);
  const [loading, setLoading] = useState(false);

  // Real Pix data from Mercado Pago
  const [pixCode, setPixCode] = useState("");
  const [paymentId, setPaymentId] = useState<number | null>(null);

  // Load saved CPF from profile
  useEffect(() => {
    if (!user?.id || !open) return;
    supabase.from("profiles").select("cpf, name").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data?.cpf) setCpf(data.cpf);
    });
  }, [user?.id, open]);

  useEffect(() => {
    if (step !== "qr") return;
    setSecondsLeft(1800);
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToCpf = () => {
    const finalAmount = amount || Number(customAmount);
    if (!finalAmount || finalAmount < 5) {
      toast({ title: "Valor mínimo: R$ 5,00", variant: "destructive" });
      return;
    }
    setAmount(finalAmount);
    setStep("cpf");
  };

  const handleGeneratePix = async () => {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      toast({ title: "CPF inválido", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Create deposit_request in DB
      const depositId = crypto.randomUUID();
      const { error: dbError } = await supabase.from("deposit_requests").insert({
        id: depositId,
        user_id: user!.id,
        amount,
        status: "pending",
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });
      if (dbError) throw new Error("Erro ao criar solicitação de depósito");

      // Get user profile for name
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("user_id", user!.id)
        .maybeSingle();

      const nameParts = (profile?.name || "Cliente").split(" ");

      const data = await callDepositFunction<{
        payment_id: number;
        qr_code: string | null;
        qr_code_base64: string | null;
        status: string;
        error?: string;
      }>({
        amount,
        deposit_id: depositId,
        payer_email: user!.email || profile?.email || "cliente@froiv.com",
        payer_cpf: cleanCpf,
        payer_first_name: nameParts[0],
        payer_last_name: nameParts.slice(1).join(" ") || "",
      });

      if (data.error) throw new Error(data.error);
      if (!data.qr_code) throw new Error("QR Code não gerado. Tente novamente.");

      setPixCode(data.qr_code);
      setPaymentId(data.payment_id);

      // Update deposit_request with payment_id
      await supabase.from("deposit_requests").update({
        pix_key: String(data.payment_id),
        status: "awaiting_payment",
      }).eq("id", depositId);

      setStep("qr");
    } catch (err: any) {
      toast({ title: "Erro ao gerar Pix", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePaid = () => {
    toast({
      title: "Depósito em análise",
      description: "Seu saldo será atualizado assim que confirmarmos o pagamento via Mercado Pago.",
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep("amount");
    setAmount(0);
    setCustomAmount("");
    setCopied(false);
    setPixCode("");
    setPaymentId(null);
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
              <ArrowDown className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Depositar via Pix</h2>
          </div>

          {step === "amount" && (
            <div className="space-y-5">
              <div>
                <p className="text-sm text-muted-foreground mb-3">Selecione um valor</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((v) => (
                    <button
                      key={v}
                      onClick={() => { setAmount(v); setCustomAmount(""); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        amount === v
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/30 text-foreground hover:bg-muted/50 border border-border"
                      }`}
                    >
                      {formatBRL(v)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Ou digite um valor</p>
                <Input
                  type="number"
                  min={5}
                  placeholder="R$ 0,00"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                  className="bg-muted/30 border-border h-11"
                />
              </div>

              <Button variant="hero" className="w-full h-11" onClick={handleGoToCpf}>
                Continuar — {formatBRL(amount || Number(customAmount) || 0)}
              </Button>
            </div>
          )}

          {step === "cpf" && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-2xl font-semibold text-primary mb-2">{formatBRL(amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Informe seu CPF para gerar o Pix</p>
                <Input
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  className="bg-muted/30 border-border h-11 font-mono"
                  maxLength={14}
                />
              </div>
              <Button variant="hero" className="w-full h-11" onClick={handleGeneratePix} disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando Pix...
                  </span>
                ) : (
                  "Gerar QR Code Pix"
                )}
              </Button>
              <button onClick={() => setStep("amount")} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Voltar
              </button>
            </div>
          )}

          {step === "qr" && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-2xl font-semibold text-primary mb-4">{formatBRL(amount)}</p>
                <div className="flex flex-col items-center gap-3">
                  <svg width="80" height="28" viewBox="0 0 512 210" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M112.7 148.28l-53.45-53.45a21.94 21.94 0 010-31.02l53.78-53.78a21.94 21.94 0 0131.02 0l53.78 53.78a21.94 21.94 0 010 31.02l-53.78 53.78a21.94 21.94 0 01-31.35-.33z" fill="#32BCAD"/>
                    <path d="M166.42 53.08l-25.55-25.55a21.94 21.94 0 00-15.51-6.42h-.09a21.94 21.94 0 00-15.51 6.42L83.5 53.78l44.78 44.78 38.14-38.14z" fill="#2D9E92"/>
                    <path d="M166.42 105.5l-38.14-38.14-44.78 44.78 26.26 26.26a21.94 21.94 0 0031.02 0l25.64-25.55a7.73 7.73 0 000-7.35z" fill="#2D9E92"/>
                    <text x="220" y="140" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="120" fill="#32BCAD">Pix</text>
                  </svg>
                  <div className="bg-white p-4 rounded-xl inline-block">
                    <QRCodeSVG value={pixCode} size={180} level="M" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center text-sm">
                <Clock className="h-4 w-4 text-warning" />
                <span className="text-muted-foreground">Válido por</span>
                <span className={`font-mono font-semibold ${secondsLeft < 300 ? "text-destructive" : "text-warning"}`}>
                  {formatTime(secondsLeft)}
                </span>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Pix Copia e Cola</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted/20 border border-border rounded-lg p-3 overflow-hidden">
                    <p className="text-xs text-foreground font-mono truncate">{pixCode}</p>
                  </div>
                  <Button variant="outline" size="icon" className="shrink-0 border-border" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Após o pagamento, seu saldo será atualizado automaticamente
              </p>

              <Button variant="hero" className="w-full h-11" onClick={handlePaid}>
                Já paguei
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
