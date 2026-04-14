import { Star, MessageCircle, User, Package, ShieldCheck, Award } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Button } from "@/components/ui/button";

interface SellerCardProps {
  name: string;
  rating: number;
  sales: number;
  avatarUrl?: string;
  isVerified?: boolean;
  onMessage?: () => void;
  onViewProfile?: () => void;
}

export default function SellerCard({ name, rating, sales, avatarUrl, isVerified, onMessage, onViewProfile }: SellerCardProps) {
  const initial = name?.[0]?.toUpperCase() || "V";
  const level = isVerified ? (sales >= 20 ? "Platinum" : sales >= 10 ? "Gold" : sales >= 5 ? "Silver" : null) : null;
  const positiveRate = Math.min(98, 85 + Math.floor(sales * 0.5));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Seller info row */}
      <div className="flex items-center gap-3 mb-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-11 w-11 rounded-full object-cover" />
        ) : (
          <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground truncate">{name}</p>
            {isVerified && <VerifiedBadge size={16} />}
          </div>
          <p className="text-xs text-muted-foreground">+{sales} vendas</p>
        </div>
      </div>

      {/* Level badge */}
      {level && (
        <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border mb-3 ${
          level === "Platinum" ? "bg-primary/10 text-primary border-primary/20" :
          level === "Gold" ? "bg-amber-50 text-amber-700 border-amber-200" :
          "bg-muted text-muted-foreground border-border"
        }`}>
          <Award className="h-3 w-3" />
          Froiv {level}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 pb-3 border-b border-border">
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-[#FFB800] fill-[#FFB800]" />
          <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
        </span>
        <span>{positiveRate}% positivas</span>
      </div>

      {/* Trust signals */}
      <div className="space-y-1.5 mb-4 text-[12px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
          <span>Compra Garantida via Escrow</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-3.5 w-3.5 text-primary" />
          <span>Entrega imediata após pagamento</span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" className="text-xs rounded-lg" onClick={onMessage} aria-label="Enviar mensagem ao vendedor">
          <MessageCircle className="h-3.5 w-3.5 mr-1" /> Mensagem
        </Button>
        <Button variant="outline" size="sm" className="text-xs rounded-lg" onClick={onViewProfile} aria-label="Ver perfil do vendedor">
          <User className="h-3.5 w-3.5 mr-1" /> Ver Perfil
        </Button>
      </div>
    </div>
  );
}
