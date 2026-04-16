import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Store, HelpCircle, ShoppingCart, Package, Bell, Heart, HelpCircleIcon,
  Star, Clock, Gamepad2, Smartphone, Tag, Link2, Receipt, Settings, LogOut,
  ChevronRight, Shield, Wallet, MessageCircle, Key, Crown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Badge } from "@/components/ui/badge";

interface MoreMenuProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: { text: string; color: string };
  condition?: boolean;
}

interface MenuGroup {
  label?: string;
  items: MenuItem[];
}

export default function MoreMenu({ open, onClose }: MoreMenuProps) {
  const { user, isAuthenticated, openAuth, logout } = useAuth();
  const navigate = useNavigate();

  const menuGroups: MenuGroup[] = [
    {
      items: [
        { icon: Home, label: "Início", path: "/" },
        { icon: Store, label: "Central do Vendedor", path: "/vendedor", badge: { text: "NOVO", color: "bg-primary text-white" } },
        
        
      ],
    },
    {
      label: "Minha atividade",
      items: [
        { icon: ShoppingCart, label: "Minhas Compras", path: "/compras" },
        { icon: Key, label: "Meus Acessos", path: "/meus-acessos", badge: { text: "NOVO", color: "bg-primary text-white" } },
        { icon: Package, label: "Minhas Vendas", path: "/vendedor", badge: { text: "NOVO", color: "bg-primary text-white" } },
        { icon: Bell, label: "Notificações", path: "/notificacoes", badge: { text: "1", color: "bg-destructive text-white" } },
        { icon: Heart, label: "Favoritos", path: "/favoritos" },
        { icon: HelpCircleIcon, label: "Minhas Perguntas", path: "/perguntas" },
        { icon: Star, label: "Minhas Avaliações", path: "/avaliacoes", badge: { text: "NOVO", color: "bg-primary text-white" } },
        { icon: Clock, label: "Histórico de visualizações", path: "/historico" },
      ],
    },
    {
      label: "Descubra",
      items: [
        { icon: Gamepad2, label: "Contas de Jogos", path: "/marketplace?cat=jogos" },
        { icon: Smartphone, label: "Redes Sociais", path: "/marketplace?cat=social" },
        { icon: Tag, label: "Ofertas do dia", path: "/marketplace?ofertas=1" },
        
      ],
    },
    {
      label: "Conta",
      items: [
        { icon: Receipt, label: "Faturamento / Extrato", path: "/carteira" },
        { icon: Settings, label: "Configurações", path: "/configuracoes" },
        { icon: HelpCircle, label: "Ajuda", path: "/ajuda" },
      ],
    },
  ];

  const handleNav = (path: string, opts?: { state?: any }) => {
    onClose();
    if (!isAuthenticated && !["/", "/marketplace", "/ajuda"].some(p => path.startsWith(p))) {
      openAuth(path);
      return;
    }
    navigate(path, opts);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          {/* Drawer */}
          <motion.div
            className="absolute top-0 right-0 bottom-0 w-full max-w-[340px] bg-white flex flex-col overflow-hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) onClose();
            }}
          >
            {/* Header */}
            <div
              className="bg-primary px-5 pt-[env(safe-area-inset-top)] pb-4 cursor-pointer"
              onClick={() => handleNav("/vendedor", { state: { tab: "perfil" } })}
            >
              <div className="pt-4 flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-xl shrink-0">
                  {isAuthenticated ? user?.name?.[0]?.toUpperCase() || "U" : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {isAuthenticated ? (
                    <>
                      <p className="text-white font-semibold text-base truncate flex items-center gap-1">{user?.name} {user?.isVerified && <VerifiedBadge size={16} />}</p>
                      <p className="text-white/75 text-[13px]">Meu perfil <ChevronRight className="inline h-3 w-3" /></p>
                    </>
                  ) : (
                    <p className="text-white font-semibold text-base">
                      Entrar ou cadastrar <ChevronRight className="inline h-4 w-4" />
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Escrow Balance Banner */}
            {isAuthenticated && (
              <div className="bg-primary px-4 pb-4">
                <div
                  className="bg-white/[0.12] border border-white/20 rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-pointer"
                  onClick={() => handleNav("/carteira")}
                >
                  <Shield className="h-5 w-5 text-white shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">Saldo disponível: R$ 0,00</p>
                    <p className="text-white/75 text-xs">Gerencie seus pagamentos</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/60 shrink-0" />
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto pb-safe">
              {menuGroups.map((group, gi) => (
                <div key={gi}>
                  {group.label && (
                    <p className="text-xs font-semibold text-[#999] uppercase tracking-wide px-5 pt-4 pb-2">
                      {group.label}
                    </p>
                  )}
                  {group.items.map((item, ii) => (
                    <button
                      key={ii}
                      className="w-full flex items-center gap-4 h-14 px-5 hover:bg-[#F8F8F8] active:bg-[#F0F0F0] transition-colors duration-100"
                      onClick={() => handleNav(item.path)}
                    >
                      <item.icon className="h-[22px] w-[22px] text-[#444] shrink-0" strokeWidth={1.5} />
                      <span className="flex-1 text-left text-[15px] text-[#111]">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badge.color}`}>
                          {item.badge.text}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-[#CCC] shrink-0" />
                    </button>
                  ))}
                  {/* Affiliate + Ambassador CTA after first group */}
                  {gi === 0 && (
                    <>
                      <button
                        className="w-full flex items-center gap-4 h-14 px-5 hover:bg-[#F8F8F8] active:bg-[#F0F0F0] transition-colors duration-100"
                        onClick={() => handleNav("/afiliados")}
                      >
                        <Link2 className="h-[22px] w-[22px] text-[#444] shrink-0" strokeWidth={1.5} />
                        <span className="flex-1 text-left text-[15px] text-[#111]">Programa de Afiliados</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success text-white">GANHA $</span>
                        <ChevronRight className="h-4 w-4 text-[#CCC] shrink-0" />
                      </button>
                      <div className="px-5 py-2">
                        <button
                          onClick={() => handleNav("/embaixador")}
                          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] bg-primary text-white"
                        >
                          <Crown className="h-4 w-4 text-white" />
                          Torne-se um Embaixador
                        </button>
                      </div>
                    </>
                  )}
                  {gi < menuGroups.length - 1 && <div className="h-px bg-[#F0F0F0] mx-5" />}
                </div>
              ))}

              {/* WhatsApp Support */}
              <div className="px-5 pt-3">
                <a
                  href="https://wa.me/5519988499681?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20na%20Froiv!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-white text-sm font-semibold transition-all active:scale-[0.98]"
                  onClick={onClose}
                >
                  <MessageCircle className="h-5 w-5" />
                  Fale conosco no WhatsApp
                </a>
              </div>
              <div className="border-t border-[#F0F0F0] mt-2 pt-2 px-5 pb-4">
                <button className="w-full text-left py-3 text-[13px] text-[#666]" onClick={() => handleNav("/termos")}>
                  Termos e condições
                </button>
                <button className="w-full text-left py-3 text-[13px] text-[#666]" onClick={() => handleNav("/privacidade")}>
                  Política de privacidade
                </button>
                <button className="w-full text-left py-3 text-[13px] text-[#666]" onClick={() => handleNav("/sobre")}>
                  Sobre a Froiv by Top Login
                </button>
                {isAuthenticated && (
                  <button
                    className="w-full flex items-center gap-2 py-3 text-[13px] text-destructive font-medium"
                    onClick={() => { logout(); onClose(); navigate("/"); }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair da conta
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
