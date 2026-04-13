import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Lock, Mail, Smartphone, ShieldCheck,
  Bell, MessageCircle, Star, Tag, Mail as MailIcon,
  CreditCard, Receipt, Clock, Monitor, Trash2, ChevronRight, Handshake
} from "lucide-react";
import DesktopPageShell from "@/components/DesktopPageShell";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase-custom-client";

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

function AnimatedToggle({ enabled, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-[26px] rounded-full transition-colors duration-200 ${
        enabled ? "bg-primary" : "bg-[#DDD]"
      }`}
    >
      <motion.div
        className="absolute top-[2px] h-[22px] w-[22px] rounded-full bg-white shadow-sm"
        animate={{ left: enabled ? 26 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  toggle?: boolean;
  enabled?: boolean;
  onToggle?: () => void;
  danger?: boolean;
  onClick?: () => void;
}

function SettingRow({ icon: Icon, label, toggle, enabled, onToggle, danger, onClick }: SettingRowProps) {
  return (
    <button
      onClick={onClick || onToggle}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F8F8F8] transition-colors"
    >
      <Icon className={`h-5 w-5 ${danger ? "text-destructive" : "text-[#444]"}`} strokeWidth={1.5} />
      <span className={`flex-1 text-left text-[14px] ${danger ? "text-destructive font-medium" : "text-[#111]"}`}>
        {label}
      </span>
      {toggle && onToggle ? (
        <AnimatedToggle enabled={!!enabled} onToggle={onToggle} />
      ) : (
        !danger && !toggle && <ChevronRight className="h-4 w-4 text-[#CCC]" />
      )}
    </button>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [toggles, setToggles] = useState({
    twoFactor: false,
    newMessages: true,
    purchaseStatus: true,
    reviews: true,
    promos: false,
    emailNotifs: true,
  });

  const toggle = (key: keyof typeof toggles) => setToggles({ ...toggles, [key]: !toggles[key] });

  const groups = [
    {
      label: "Conta",
      items: [
        { icon: User, label: "Editar perfil", onClick: () => navigate("/configuracoes/perfil") },
        { icon: Lock, label: "Alterar senha", onClick: () => navigate("/configuracoes/senha") },
        { icon: Mail, label: "Verificar email / telefone", onClick: () => navigate("/vendedor/verificacao") },
        { icon: ShieldCheck, label: "Autenticação em 2 fatores", onClick: () => navigate("/configuracoes/2fa") },
      ],
    },
    {
      label: "Notificações",
      items: [
        { icon: MessageCircle, label: "Novas mensagens", toggle: true, key: "newMessages" as const },
        { icon: Bell, label: "Status de compra", toggle: true, key: "purchaseStatus" as const },
        { icon: Star, label: "Avaliações", toggle: true, key: "reviews" as const },
        { icon: Tag, label: "Promoções e ofertas", toggle: true, key: "promos" as const },
        { icon: MailIcon, label: "Notificações por email", toggle: true, key: "emailNotifs" as const },
      ],
    },
    {
      label: "Pagamento",
      items: [
        { icon: CreditCard, label: "Chaves Pix salvas", onClick: () => navigate("/configuracoes/pix") },
        { icon: Receipt, label: "Histórico de faturas", onClick: () => navigate("/compras") },
      ],
    },
    {
      label: "Privacidade e segurança",
      items: [
        { icon: Clock, label: "Histórico de acessos", onClick: () => navigate("/configuracoes/acessos") },
        { icon: Monitor, label: "Dispositivos conectados", onClick: () => navigate("/configuracoes/acessos") },
        { icon: Trash2, label: "Excluir conta", danger: true, onClick: () => navigate("/configuracoes/excluir") },
      ],
    },
  ];

  return (
    <DesktopPageShell title="Configurações">
      <div className="space-y-0">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-[12px] text-[#999] uppercase font-semibold px-1 pt-4 pb-2">{group.label}</p>
            <div className="bg-white rounded-xl sm:rounded-2xl border border-[#F0F0F0] overflow-hidden">
              {group.items.map((item, i) => (
                <SettingRow
                  key={i}
                  icon={item.icon}
                  label={item.label}
                  toggle={item.toggle}
                  enabled={item.key ? toggles[item.key] : undefined}
                  onToggle={item.key ? () => toggle(item.key!) : undefined}
                  danger={"danger" in item ? item.danger : false}
                  onClick={"onClick" in item ? item.onClick : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </DesktopPageShell>
  );
}
