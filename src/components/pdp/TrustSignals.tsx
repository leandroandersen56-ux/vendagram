import { useState } from "react";
import { Zap, Shield, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TrustSignals({ inline }: { inline?: boolean }) {
  const [showEscrowModal, setShowEscrowModal] = useState(false);

  return (
    <>
      <div className={inline ? "space-y-3" : "rounded-xl border border-[hsl(var(--success))]/30 bg-[hsl(var(--success-light))] p-4 space-y-3"}>
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-[hsl(var(--success))] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-[hsl(var(--txt-primary))]">Entrega Imediata</p>
            <p className="text-[13px] text-[hsl(var(--txt-secondary))]">Receba os dados da conta em instantes</p>
          </div>
        </div>

        <div className="border-t border-[hsl(var(--success))]/20 pt-3 flex items-start gap-3">
          <Shield className="h-5 w-5 text-[hsl(var(--escrow))] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-[hsl(var(--txt-primary))]">Proteção Escrow</p>
            <p className="text-[13px] text-[hsl(var(--txt-secondary))]">
              Pague com segurança. Liberamos o pagamento só após você verificar a conta
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowEscrowModal(true)}
          className="flex items-center gap-1 text-[13px] text-primary font-semibold hover:underline mt-1 ml-8"
        >
          📋 Como funciona o Escrow? <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Escrow Modal */}
      <AnimatePresence>
        {showEscrowModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-[4px]"
              onClick={() => setShowEscrowModal(false)}
            />
            <motion.div
              className="relative bg-white rounded-t-[20px] sm:rounded-[20px] w-full sm:max-w-md p-6 pb-8 sm:mx-4"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
            >
              {/* Handle */}
              <div className="sm:hidden w-10 h-1 bg-[hsl(var(--border))] rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[hsl(var(--txt-primary))]">Como funciona o Escrow</h3>
                <button onClick={() => setShowEscrowModal(false)} className="p-1" aria-label="Fechar">
                  <X className="h-5 w-5 text-[hsl(var(--txt-hint))]" />
                </button>
              </div>

              <div className="space-y-0">
                {[
                  { emoji: "🛒", title: "Compre a conta", desc: "Escolha a conta e realize o pagamento normalmente." },
                  { emoji: "🔒", title: "Pagamento em custódia", desc: "Seu dinheiro fica seguro conosco, não vai direto ao vendedor." },
                  { emoji: "✅", title: "Você verifica a conta", desc: "Acesse a conta, confira tudo e confirme que está tudo certo." },
                  { emoji: "💰", title: "Pagamento liberado", desc: "Só depois da sua confirmação, liberamos o pagamento ao vendedor." },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                        {step.emoji}
                      </div>
                      {i < 3 && <div className="w-0.5 h-full bg-primary/20 my-1" />}
                    </div>
                    <div className="pb-5">
                      <p className="text-sm font-bold text-[hsl(var(--txt-primary))]">{step.title}</p>
                      <p className="text-[13px] text-[hsl(var(--txt-secondary))] mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
