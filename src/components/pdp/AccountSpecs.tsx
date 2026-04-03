import { useState } from "react";
import { ChevronDown, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AccountSpecsProps {
  infoFields: [string, any][];
  featureFlags: [string, any][];
}

export default function AccountSpecs({ infoFields, featureFlags }: AccountSpecsProps) {
  const [open, setOpen] = useState(false);
  const filteredFields = infoFields.filter(([k]) => k !== "Preço original" && k !== "Itens");
  const allSpecs = [...filteredFields];

  if (allSpecs.length === 0 && featureFlags.length === 0) return null;

  const showToggle = allSpecs.length > 6;
  const visibleSpecs = open ? allSpecs : allSpecs.slice(0, 6);

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-[hsl(var(--txt-primary))]">📊 Detalhes da conta</span>
        <ChevronDown className={`h-4 w-4 text-[hsl(var(--txt-hint))] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {(open || !showToggle) && (
          <motion.div
            initial={showToggle ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={showToggle ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* Specs table */}
              <div className="divide-y divide-[hsl(var(--border))]/60">
                {visibleSpecs.map(([key, value], i) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between py-3 ${i % 2 === 1 ? "bg-[hsl(var(--muted))]/30" : ""}`}
                  >
                    <span className="text-[13px] text-[hsl(var(--txt-secondary))]">{key}</span>
                    <span className="text-[13px] font-semibold text-[hsl(var(--txt-primary))]">{String(value)}</span>
                  </div>
                ))}
              </div>

              {/* Feature flags */}
              {featureFlags.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[hsl(var(--border))]/60">
                  {featureFlags.map(([key]) => (
                    <div key={key} className="flex items-center gap-1.5 text-[12px] text-[hsl(var(--success))] font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {key}
                    </div>
                  ))}
                </div>
              )}

              {showToggle && !open && (
                <button
                  onClick={() => setOpen(true)}
                  className="text-[13px] text-primary font-semibold mt-3 hover:underline"
                >
                  Ver mais detalhes
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
