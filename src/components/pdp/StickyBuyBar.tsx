import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/mock-data";

interface StickyBuyBarProps {
  price: number;
  originalPrice?: string;
  onBuy: () => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

export default function StickyBuyBar({ price, originalPrice, onBuy, triggerRef }: StickyBuyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerRef]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[hsl(var(--border))] sm:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          initial={{ y: 64 }}
          animate={{ y: 0 }}
          exit={{ y: 64 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3 px-4 py-2.5">
            <div className="flex-1 min-w-0">
              {originalPrice && (
                <p className="text-[10px] text-[hsl(var(--txt-hint))] line-through leading-none">R$ {originalPrice}</p>
              )}
              <p className="text-lg font-semibold text-[hsl(var(--txt-primary))] leading-tight">{formatBRL(price)}</p>
              <p className="text-[10px] text-[hsl(var(--success))] font-medium flex items-center gap-0.5 mt-0.5">
                <Shield className="h-3 w-3" /> Compra protegida
              </p>
            </div>
            <Button
              className="px-6 h-11 text-sm font-semibold rounded-xl bg-primary text-white shadow-[0_4px_14px_rgba(45,111,240,0.4)] active:scale-[0.97]"
              onClick={onBuy}
              aria-label="Comprar agora"
            >
              Comprar
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
