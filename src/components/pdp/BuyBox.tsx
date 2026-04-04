import { motion } from "framer-motion";
import { ShoppingCart, MessageCircle, Shield, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/mock-data";

interface BuyBoxProps {
  price: number;
  originalPrice?: string;
  onBuy: () => void;
  onOffer?: () => void;
  inline?: boolean;
}

export default function BuyBox({ price, originalPrice, onBuy, onOffer, inline }: BuyBoxProps) {
  const discount = originalPrice
    ? Math.round((1 - price / parseFloat(originalPrice.replace(/\./g, "").replace(",", "."))) * 100)
    : 0;

  const installment = (price / 6).toFixed(2).replace(".", ",");
  const pixPrice = formatBRL(price * 0.95);

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-white p-4 sm:p-5">
      {/* Price hierarchy */}
      <div className="mb-4">
        {originalPrice && (
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm text-[hsl(var(--txt-hint))] line-through">R$ {originalPrice}</span>
            {discount > 0 && (
              <span className="bg-[hsl(var(--warning))] text-[hsl(var(--txt-primary))] text-xs font-extrabold px-2 py-0.5 rounded">
                {discount}% OFF
              </span>
            )}
          </div>
        )}

        <p className="text-[28px] font-semibold text-[hsl(var(--txt-primary))] leading-tight tracking-tight">
          {formatBRL(price)}
        </p>

        <p className="text-[13px] text-[hsl(var(--txt-secondary))] mt-1">
          em <span className="font-semibold">6x</span> de <span className="font-semibold">R$ {installment}</span> sem juros
        </p>

        <div className="flex items-center gap-1.5 mt-2 text-[13px] text-[hsl(var(--success))] font-semibold">
          <span>🏷️</span>
          <span>5% OFF no Pix → {pixPrice}</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <motion.div whileTap={{ scale: 0.97 }}>
        <Button
          className="w-full h-[52px] text-base font-bold rounded-xl bg-primary text-white shadow-[0_4px_14px_rgba(45,111,240,0.4)] hover:bg-primary-dark hover:shadow-[0_6px_20px_rgba(45,111,240,0.5)] active:scale-[0.98] transition-all"
          onClick={onBuy}
          aria-label="Comprar agora com proteção Escrow"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          COMPRAR AGORA
        </Button>
      </motion.div>

      <Button
        variant="outline"
        className="w-full h-[52px] text-base font-bold rounded-xl border-2 border-primary text-primary hover:bg-primary/5 mt-2.5"
        onClick={onOffer}
        aria-label="Fazer uma oferta ao vendedor"
      >
        <MessageCircle className="h-5 w-5 mr-2" />
        FAZER OFERTA
      </Button>

      {/* Trust signals */}
      <div className="flex justify-around mt-5 pt-4 border-t border-[hsl(var(--border))]">
        {[
          { icon: Shield, label: "Escrow seguro", color: "text-[hsl(var(--escrow))]" },
          { icon: Zap, label: "Entrega imediata", color: "text-[hsl(var(--success))]" },
          { icon: Clock, label: "Garantia 24h", color: "text-primary" },
        ].map(({ icon: Icon, label, color }) => (
          <span key={label} className="flex flex-col items-center gap-1.5">
            <Icon className={`h-5 w-5 ${color}`} />
            <span className="text-[10px] text-[hsl(var(--txt-hint))] font-medium">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
