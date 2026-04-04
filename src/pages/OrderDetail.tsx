import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Check, MessageCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/menu/PageHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

const STEPS = [
  { label: "Pedido realizado", time: "15/03 14:22", done: true },
  { label: "Pagamento confirmado", time: "15/03 14:25", done: true },
  { label: "Dados enviados", time: "15/03 14:26", done: true },
  { label: "Verificando conta", time: "15/03 14:30", done: true },
  { label: "Escrow liberado", time: null, done: false },
];

const ACCOUNT_DATA = [
  { label: "Login", value: "fitness_50k" },
  { label: "Senha", value: "Tr0c@r#2026" },
  { label: "Email vinculado", value: "conta@email.com" },
  { label: "Código 2FA", value: "JBSWY3DPEHPK3PXP" },
];

export default function OrderDetail() {
  const { id } = useParams();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(label);
    toast.success("Copiado!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    toast.success("Pagamento liberado ao vendedor!");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader title={`Pedido #${id || "FRV-2026-001"}`} />

      <div className="px-4 pt-4 space-y-4">
        {/* Status Timeline */}
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-5">
          <h3 className="text-sm font-bold text-[#111] mb-4">Status do pedido</h3>
          <div className="relative">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-3 relative">
                {/* Line */}
                {i < STEPS.length - 1 && (
                  <div
                    className={`absolute left-[5px] top-3 w-0.5 h-full ${
                      step.done && STEPS[i + 1]?.done ? "bg-primary" : "bg-[#E8E8E8]"
                    }`}
                  />
                )}
                {/* Circle */}
                <div className="relative z-10 shrink-0">
                  {step.done ? (
                    <div className="h-3 w-3 rounded-full bg-primary" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border-2 border-[#DDD] bg-white" />
                  )}
                </div>
                {/* Content */}
                <div className="pb-5 flex-1 -mt-0.5">
                  <p className={`text-[13px] font-medium ${step.done ? "text-[#111]" : "text-[#999]"}`}>
                    {step.label}
                  </p>
                  {step.time && (
                    <p className="text-[11px] text-[#999]">{step.time}</p>
                  )}
                  {!step.time && !step.done && (
                    <p className="text-[11px] text-[#CCC]">Pendente</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Data */}
        <div className="bg-[#F0F8FF] border border-primary rounded-xl p-4">
          <h3 className="text-sm font-bold text-[#111] mb-3 flex items-center gap-2">
            📋 Dados de acesso da conta
          </h3>
          <div className="space-y-3">
            {ACCOUNT_DATA.map((field) => (
              <div key={field.label} className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-[#999] uppercase font-medium">{field.label}</p>
                  <p className="text-[14px] text-[#111] font-mono">{field.value}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopy(field.value, field.label); }}
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors"
                >
                  {copiedField === field.label ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4 text-primary" />
                  )}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 bg-[#FFF8E0] rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 text-[#FF6900] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#666]">
              Altere a senha após o acesso. Você tem <strong>24h para verificar</strong> a conta.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl text-[14px] font-bold"
          >
            <CheckCircle2 className="h-5 w-5" /> Confirmar recebimento e liberar pagamento
          </button>
          <button className="w-full flex items-center justify-center gap-2 border-2 border-destructive text-destructive py-3 rounded-xl text-[14px] font-semibold">
            <AlertTriangle className="h-4 w-4" /> Abrir disputa
          </button>
          <button className="w-full flex items-center justify-center gap-2 border border-[#DDD] text-[#555] py-3 rounded-xl text-[14px] font-medium">
            <MessageCircle className="h-4 w-4" /> Falar com vendedor
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Confirmar recebimento</DialogTitle>
            <DialogDescription>
              Você confirma que recebeu e verificou a conta?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-[#FFF8E0] rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-[#FF6900] mt-0.5 shrink-0" />
            <p className="text-[12px] text-[#666]">
              Ao confirmar, o pagamento será liberado ao vendedor e a operação <strong>não poderá ser revertida</strong>.
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-[#DDD] text-[#666] text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-bold"
            >
              Sim, confirmar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
