import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, CheckCircle, MessageCircle, Star, Package,
  AlertTriangle, Wallet, Tag, Bell, Loader2
} from "lucide-react";
import DesktopPageShell from "@/components/DesktopPageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const NOTIF_ICONS: Record<string, { icon: React.ElementType; bg: string }> = {
  purchase: { icon: ShoppingBag, bg: "bg-[#E8F0FF]" },
  payment: { icon: CheckCircle, bg: "bg-[#E8F8EF]" },
  message: { icon: MessageCircle, bg: "bg-[#F0F8FF]" },
  review: { icon: Star, bg: "bg-[#FFF8E0]" },
  listing: { icon: Package, bg: "bg-[#F3F0FF]" },
  dispute: { icon: AlertTriangle, bg: "bg-[#FFF3E0]" },
  wallet: { icon: Wallet, bg: "bg-[#E8F8EF]" },
  deal: { icon: Tag, bg: "bg-[#FFF0F0]" },
  default: { icon: Bell, bg: "bg-muted" },
};

function getGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 1) return "Hoje";
  if (diffDays < 7) return "Esta semana";
  return "Anteriores";
}

function guessType(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("compra") || t.includes("pedido")) return "purchase";
  if (t.includes("pagamento") || t.includes("liberado")) return "payment";
  if (t.includes("mensagem") || t.includes("chat")) return "message";
  if (t.includes("avali") || t.includes("review")) return "review";
  if (t.includes("anúncio") || t.includes("listagem")) return "listing";
  if (t.includes("disputa") || t.includes("reembolso")) return "dispute";
  if (t.includes("saldo") || t.includes("saque") || t.includes("carteira")) return "wallet";
  if (t.includes("oferta") || t.includes("desconto")) return "deal";
  return "default";
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadNotifications();
  }, [user?.id]);

  const loadNotifications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setNotifs(data || []);
    setLoading(false);
  };

  const markAllRead = async () => {
    const unreadIds = notifs.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
  };

  const groups = ["Hoje", "Esta semana", "Anteriores"].filter((g) =>
    notifs.some((n) => getGroup(n.created_at) === g)
  );

  return (
    <DesktopPageShell
      title="Notificações"
      rightAction={
        notifs.some((n) => !n.read) ? (
          <button onClick={markAllRead} className="text-[13px] text-white/80 hover:text-white sm:hidden">
            Marcar todas como lidas
          </button>
        ) : undefined
      }
    >
      <div className="space-y-2">
        {notifs.some((n) => !n.read) && (
          <div className="hidden sm:flex justify-end mb-2">
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">Marcar todas como lidas</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center pt-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Bell className="h-16 w-16 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1} />
            <p className="text-foreground font-semibold">Sem notificações</p>
            <p className="text-muted-foreground text-sm mt-1">Quando algo acontecer, você verá aqui</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group}>
              <p className="text-[12px] text-muted-foreground uppercase font-semibold pt-4 pb-2">{group}</p>
              <AnimatePresence>
                {notifs
                  .filter((n) => getGroup(n.created_at) === group)
                  .map((notif) => {
                    const typeName = guessType(notif.title);
                    const type = NOTIF_ICONS[typeName] || NOTIF_ICONS.default;
                    const Icon = type.icon;
                    return (
                      <motion.div
                        key={notif.id}
                        layout
                        exit={{ opacity: 0, x: -100 }}
                        className={`flex items-start gap-3 p-3.5 rounded-xl mb-2 transition-colors ${
                          notif.read ? "bg-card" : "bg-primary/5 border-l-[3px] border-primary"
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-full ${type.bg} flex items-center justify-center shrink-0`}>
                          <Icon className="h-5 w-5 text-foreground/60" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[14px] ${notif.read ? "text-foreground/80" : "text-foreground font-semibold"}`}>{notif.title}</p>
                          <p className="text-[13px] text-muted-foreground truncate">{notif.body}</p>
                          <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                            {formatDistanceToNow(new Date(notif.created_at), { locale: ptBR, addSuffix: true })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </DesktopPageShell>
  );
}
