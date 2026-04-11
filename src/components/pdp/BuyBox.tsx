import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Shield, Zap, Clock, Tag, Minus, Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/mock-data";

interface BuyBoxProps {
  price: number;
  originalPrice?: string;
  stock?: number;
  onBuy: (quantity: number) => void;
  onOffer?: () => void;
  inline?: boolean;
}

export default function BuyBox({ price, originalPrice, stock = 1, onBuy, onOffer, inline }: BuyBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const isMultiStock = stock > 1;

  const discount = originalPrice
    ? Math.round((1 - price / parseFloat(originalPrice.replace(/\./g, "").replace(",", "."))) * 100)
    : 0;

  const totalPrice = price * quantity;
  const installment = (totalPrice / 6).toFixed(2).replace(".", ",");
  const pixPrice = formatBRL(totalPrice * 0.95);

  return (
    <div className={inline ? "" : "rounded-xl border border-[hsl(var(--border))] bg-white p-4 sm:p-5"}>
      {/* Price hierarchy */}
      <div className="mb-4">
        {originalPrice && (
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm text-[hsl(var(--txt-hint))] line-through">R$ {originalPrice}</span>
            {discount > 0 && (
              <span className="bg-[hsl(var(--warning))] text-[hsl(var(--txt-primary))] text-xs font-semibold px-2 py-0.5 rounded">
                {discount}% OFF
              </span>
            )}
          </div>
        )}

        <p className="text-[28px] font-semibold text-[hsl(var(--txt-primary))] leading-tight tracking-tight">
          {formatBRL(totalPrice)}
        </p>
        {isMultiStock && quantity > 1 && (
          <p className="text-[12px] text-[hsl(var(--txt-hint))] mt-0.5">{formatBRL(price)} cada</p>
        )}

        <p className="text-[13px] text-[hsl(var(--txt-secondary))] mt-1">
          em <span className="font-semibold">6x</span> de <span className="font-semibold">R$ {installment}</span> sem juros
        </p>

        <div className="flex items-center gap-1.5 mt-2 text-[13px] text-[hsl(var(--success))] font-semibold">
          <Tag className="h-3.5 w-3.5" />
          <span>5% OFF no Pix → {pixPrice}</span>
        </div>
      </div>

      {/* Quantity selector for multi-stock items */}
      {isMultiStock && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-[hsl(var(--txt-secondary))]">Quantidade</p>
            <p className="text-[11px] text-[hsl(var(--txt-hint))]">{stock} disponíveis</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="h-8 w-8 rounded-lg border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--muted))] disabled:opacity-30 transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-[16px] font-semibold w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(stock, quantity + 1))}
              disabled={quantity >= stock}
              className="h-8 w-8 rounded-lg border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--muted))] disabled:opacity-30 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <motion.div whileTap={{ scale: 0.97 }}>
        <Button
          className="w-full h-[52px] text-base font-semibold rounded-xl bg-primary text-white shadow-[0_4px_14px_rgba(45,111,240,0.4)] hover:bg-primary-dark hover:shadow-[0_6px_20px_rgba(45,111,240,0.5)] active:scale-[0.98] transition-all"
          onClick={() => onBuy(quantity)}
          aria-label="Comprar agora com proteção Escrow"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          COMPRAR AGORA
        </Button>
      </motion.div>

      {!inline && (
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
      )}

    </div>
  );
}
