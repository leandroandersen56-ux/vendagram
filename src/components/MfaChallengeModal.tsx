import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase-custom-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
  factorId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MfaChallengeModal({ factorId, onSuccess, onCancel }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
      if (cErr) throw cErr;

      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (vErr) throw vErr;

      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Código inválido. Tente novamente.");
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onCancel} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-[380px] bg-background border border-border rounded-2xl shadow-2xl z-10 p-6 space-y-5"
        >
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <p className="font-semibold text-[16px] text-foreground">Verificação em 2 etapas</p>
            <p className="text-[13px] text-muted-foreground">
              Digite o código de 6 dígitos do seu app autenticador.
            </p>
          </div>

          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="text-center text-2xl font-mono tracking-[0.5em] h-14 rounded-xl"
            autoFocus
          />

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              variant="hero"
              className="flex-1"
              onClick={handleVerify}
              disabled={code.length !== 6 || loading}
            >
              {loading ? "Verificando..." : "Confirmar"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
