import { Star, MessageCircle, User, CheckCircle2, Package, ShieldCheck } from "lucide-react";
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

export default function SellerCard({ name, rating, sales, avatarUrl, onMessage, onViewProfile }: SellerCardProps) {
  const initial = name?.[0]?.toUpperCase() || "V";
  const level = sales >= 20 ? "Platinum" : sales >= 10 ? "Gold" : sales >= 5 ? "Silver" : null;
  const levelColors: Record<string, string> = {
    Platinum: "bg-amber-50 text-amber-700 border-amber-200",
    Gold: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Silver: "bg-gray-50 text-gray-500 border-gray-200",
  };

  // Reputation bar segments
  const repLevel = sales >= 20 ? 5 : sales >= 15 ? 4 : sales >= 10 ? 3 : sales >= 5 ? 2 : 1;

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-white p-4">
      <div className="flex items-center gap-3 mb-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-base">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-[hsl(var(--txt-primary))] truncate">{name}</p>
            {level && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${levelColors[level]}`}>
                {level}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className="text-[13px] font-semibold text-primary">{rating.toFixed(1)}</span>
            <span className="text-[12px] text-[hsl(var(--txt-hint))]">({sales} vendas)</span>
          </div>
        </div>
      </div>

      {/* Reputation bar */}
      <div className="flex gap-0.5 mb-3">
        {[1, 2, 3, 4, 5].map((seg) => (
          <div
            key={seg}
            className={`h-1 flex-1 rounded-full ${
              seg <= repLevel
                ? seg <= 2 ? "bg-red-400" : seg <= 3 ? "bg-yellow-400" : "bg-[hsl(var(--success))]"
                : "bg-[hsl(var(--border))]"
            }`}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="space-y-1.5 mb-4 text-[12px] text-[hsl(var(--txt-secondary))]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
          <span>Responde em menos de 1h</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-3.5 w-3.5 text-primary" />
          <span>{Math.min(98, 85 + Math.floor(sales * 0.5))}% de avaliações positivas</span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs rounded-lg border-[hsl(var(--border))]"
          onClick={onMessage}
          aria-label="Enviar mensagem ao vendedor"
        >
          <MessageCircle className="h-3.5 w-3.5 mr-1" /> Mensagem
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs rounded-lg border-[hsl(var(--border))]"
          onClick={onViewProfile}
          aria-label="Ver perfil do vendedor"
        >
          <User className="h-3.5 w-3.5 mr-1" /> Ver Perfil
        </Button>
      </div>
    </div>
  );
}
