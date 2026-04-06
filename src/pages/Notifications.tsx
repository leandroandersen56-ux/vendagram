import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, CheckCircle, MessageCircle, Star, Package,
  AlertTriangle, Wallet, Tag
} from "lucide-react";
import { Bell } from "lucide-react";
import DesktopPageShell from "@/components/DesktopPageShell";

const NOTIF_TYPES: Record<string, { icon: React.ElementType; bg: string }> = {
  purchase: { icon: ShoppingBag, bg: "bg-[#E8F0FF]" },
  payment: { icon: CheckCircle, bg: "bg-[#E8F8EF]" },
  message: { icon: MessageCircle, bg: "bg-[#F0F8FF]" },
  review: { icon: Star, bg: "bg-[#FFF8E0]" },
  listing: { icon: Package, bg: "bg-[#F3F0FF]" },
  dispute: { icon: AlertTriangle, bg: "bg-[#FFF3E0]" },
  wallet: { icon: Wallet, bg: "bg-[#E8F8EF]" },
  deal: { icon: Tag, bg: "bg-[#FFF0F0]" },
};

const MOCK = [
  { id: 1, type: "purchase", title: "Sua compra foi confirmada", desc: "Conta Instagram 50K - Fitness", time: "há 2h", read: false, group: "Hoje" },
  { id: 2, type: "payment", title: "Pagamento liberado ao vendedor", desc: "Pedido #FRV-2026-001", time: "há 4h", read: false, group: "Hoje" },
  { id: 3, type: "review", title: "Avalie sua compra", desc: "Conte como foi sua experiência", time: "há 1d", read: true, group: "Esta semana" },
  { id: 4, type: "deal", title: "Conta com desconto nos seus favoritos", desc: "TikTok 120K agora com 15% OFF", time: "há 3d", read: true, group: "Esta semana" },
  { id: 5, type: "wallet", title: "Saldo disponível para saque", desc: "R$ 820,00 prontos para retirar", time: "há 5d", read: true, group: "Anteriores" },
  { id: 6, type: "dispute", title: "Disputa resolvida", desc: "Reembolso de R$ 200,00 creditado", time: "há 7d", read: true, group: "Anteriores" },
];

export default function Notifications() {
  const [notifs, setNotifs] = useState(MOCK);

  const markAllRead = () => setNotifs(notifs.map((n) => ({ ...n, read: true })));
  const groups = ["Hoje", "Esta semana", "Anteriores"].filter((g) => notifs.some((n) => n.group === g));

  return (
    <DesktopPageShell
      title="Notificações"
      rightAction={
        <button onClick={markAllRead} className="text-[13px] text-white/80 hover:text-white sm:hidden">
          Marcar todas como lidas
        </button>
      }
    >
      <div className="space-y-2">
        {/* Desktop mark all read */}
        <div className="hidden sm:flex justify-end mb-2">
          <button onClick={markAllRead} className="text-xs text-primary hover:underline">Marcar todas como lidas</button>
        </div>

        {notifs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Bell className="h-16 w-16 text-[#DDD] mx-auto mb-3" strokeWidth={1} />
            <p className="text-[#333] font-semibold">Sem notificações</p>
            <p className="text-[#999] text-sm mt-1">Quando algo acontecer, você verá aqui</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group}>
              <p className="text-[12px] text-[#999] uppercase font-semibold pt-4 pb-2">{group}</p>
              <AnimatePresence>
                {notifs
                  .filter((n) => n.group === group)
                  .map((notif) => {
                    const type = NOTIF_TYPES[notif.type] || NOTIF_TYPES.purchase;
                    const Icon = type.icon;
                    return (
                      <motion.div
                        key={notif.id}
                        layout
                        exit={{ opacity: 0, x: -100 }}
                        className={`flex items-start gap-3 p-3.5 rounded-xl mb-2 transition-colors ${
                          notif.read ? "bg-white" : "bg-[#F0F6FF] border-l-[3px] border-primary"
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-full ${type.bg} flex items-center justify-center shrink-0`}>
                          <Icon className="h-5 w-5 text-[#444]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[14px] ${notif.read ? "text-[#333]" : "text-[#111] font-semibold"}`}>{notif.title}</p>
                          <p className="text-[13px] text-[#666] truncate">{notif.desc}</p>
                          <p className="text-[11px] text-[#999] mt-0.5">{notif.time}</p>
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
