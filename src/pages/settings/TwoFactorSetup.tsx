import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Copy, Check, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/menu/PageHeader";
import { toast } from "sonner";
import QRCode from "react-qr-code";

type Step = "loading" | "already_active" | "enroll" | "verify" | "done";

export default function TwoFactorSetup() {
  const [step, setStep] = useState<Step>("loading");
  const [qrUri, setQrUri] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkExistingFactors();
  }, []);

  async function checkExistingFactors() {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      toast.error("Erro ao verificar 2FA");
      setStep("enroll");
      return;
    }
    const totp = data.totp.find((f) => f.status === "verified");
    if (totp) {
      setFactorId(totp.id);
      setStep("already_active");
    } else {
      await startEnroll();
    }
  }

  async function startEnroll() {
    // Unenroll any unverified factors first
    const { data: existing } = await supabase.auth.mfa.listFactors();
    if (existing?.totp) {
      for (const f of existing.totp.filter((t) => t.status === "unverified")) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Froiv App",
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setQrUri(data.totp.uri);
    setSecret(data.totp.secret);
    setFactorId(data.id);
    setStep("enroll");
  }

  async function handleVerify() {
    if (code.length !== 6) return;
    setVerifying(true);
    try {
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
      if (cErr) throw cErr;

      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (vErr) throw vErr;

      setStep("done");
      toast.success("2FA ativado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Código inválido");
    } finally {
      setVerifying(false);
    }
  }

  async function handleDisable() {
    setUnenrolling(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      toast.success("2FA desativado");
      setStep("enroll");
      setCode("");
      await startEnroll();
    } catch (err: any) {
      toast.error(err.message || "Erro ao desativar");
    } finally {
      setUnenrolling(false);
    }
  }

  function copySecret() {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pb-20">
        <PageHeader title="Autenticação 2FA" />
        <div className="flex items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader title="Autenticação 2FA" />

      <div className="p-4 space-y-4">
        <AnimatePresence mode="wait">
          {step === "already_active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-[15px] text-[#111]">2FA está ativo</p>
                  <p className="text-[13px] text-[#888]">
                    Sua conta está protegida com autenticação de dois fatores.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[12px] text-amber-800">
                  Desativar o 2FA torna sua conta menos segura. Só desative se necessário.
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full border-destructive text-destructive hover:bg-destructive/10"
                onClick={handleDisable}
                disabled={unenrolling}
              >
                {unenrolling ? "Desativando..." : "Desativar 2FA"}
              </Button>
            </motion.div>
          )}

          {step === "enroll" && qrUri && (
            <motion.div
              key="enroll"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl p-6 space-y-5"
            >
              <div className="text-center space-y-1">
                <ShieldCheck className="h-8 w-8 text-primary mx-auto" />
                <p className="font-semibold text-[15px] text-[#111]">Configurar 2FA</p>
                <p className="text-[13px] text-[#888]">
                  Escaneie o QR Code com o Google Authenticator ou outro app TOTP.
                </p>
              </div>

              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl border border-[#EEE]">
                  <QRCode value={qrUri} size={180} />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-[#999] uppercase font-semibold">Chave manual</p>
                <button
                  onClick={copySecret}
                  className="w-full flex items-center gap-2 bg-[#F5F5F5] rounded-xl px-3 py-2.5 text-left"
                >
                  <code className="flex-1 text-[13px] font-mono text-[#333] break-all">{secret}</code>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                  ) : (
                    <Copy className="h-4 w-4 text-[#999] shrink-0" />
                  )}
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[13px] font-medium text-[#333]">
                  Digite o código de 6 dígitos do app:
                </p>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="text-center text-xl font-mono tracking-[0.5em] h-12 rounded-xl"
                />
              </div>

              <Button
                variant="hero"
                className="w-full h-11"
                onClick={handleVerify}
                disabled={code.length !== 6 || verifying}
              >
                {verifying ? "Verificando..." : "Ativar 2FA"}
              </Button>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 text-center space-y-4"
            >
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <ShieldCheck className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-[16px] text-[#111]">2FA Ativado!</p>
                <p className="text-[13px] text-[#888] mt-1">
                  A partir de agora, você precisará do código do autenticador para fazer login.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.history.back()}
              >
                Voltar para Configurações
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
