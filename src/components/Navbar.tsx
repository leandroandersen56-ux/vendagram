import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Bell, User, LogOut, LayoutDashboard, ShoppingBag, ShoppingCart, Loader2, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { formatBRL } from "@/lib/mock-data";
import logoFroiv from "@/assets/logo-froiv.png";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuth, logout } = useAuth();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    if (!user) return;
    setNotifLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setNotifications(data);
    setNotifLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotifClick = (notif: Notification) => {
    markAsRead(notif.id);
    setNotifOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const handleSell = () => {
    if (isAuthenticated) navigate("/painel/anuncios/novo");
    else openAuth("/painel/anuncios/novo");
  };

  // Close notif dropdown on route change
  useEffect(() => {
    setNotifOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary" style={{ height: '56px' }}>
        <div className="container mx-auto flex items-center h-full gap-3">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img src={logoFroiv} alt="Froiv" className="h-7 md:h-8 brightness-0 invert" />
          </Link>

          {/* Search bar */}
          <div className="flex-1">
            <div className="relative w-full">
              <Input
                placeholder="Buscar contas, jogos, redes sociais..."
                className="w-full bg-white border-0 h-9 pl-3 pr-10 text-[13px] text-[#111] placeholder:text-txt-hint rounded-[24px] shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <button className="absolute right-0.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary-light flex items-center justify-center hover:bg-primary/10 transition-colors">
                <Search className="h-4 w-4 text-primary" />
              </button>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 text-[13px]">
                <ShoppingBag className="h-4 w-4" /> Explorar
              </Button>
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Notification bell (desktop) */}
            <div className="relative">
              <button
                className="relative h-9 w-9 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                aria-label="Notificações"
                onClick={() => {
                  if (!isAuthenticated) { openAuth(); return; }
                  setNotifOpen(!notifOpen);
                  if (!notifOpen) fetchNotifications();
                }}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-[hsl(var(--danger))] text-white text-[9px] font-semibold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <NotifDropdown
                    notifications={notifications}
                    loading={notifLoading}
                    onClose={() => setNotifOpen(false)}
                    onClick={handleNotifClick}
                    onMarkAllRead={markAllRead}
                    timeAgo={timeAgo}
                  />
                )}
              </AnimatePresence>
            </div>
            {/* Cart */}
            <Link to="/cart" className="relative h-9 w-9 flex items-center justify-center text-white/80 hover:text-white transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold hover:bg-white/30 transition-colors">
                    {user?.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  <DropdownMenuItem asChild>
                    <Link to="/painel" className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" /> Meu Painel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/painel/perfil" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" /> Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-danger" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAuth()}
                  className="text-white hover:bg-white/10 text-[13px] font-semibold"
                >
                  Entrar
                </Button>
                <Button
                  size="sm"
                  onClick={() => openAuth()}
                  className="bg-white text-primary hover:bg-white/90 rounded-lg text-[13px] font-semibold px-4 shadow-sm"
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </div>

          {/* Mobile right icons */}
          <div className="flex items-center gap-0.5 md:hidden shrink-0">
            <div className="relative">
              <button
                className="h-9 w-9 flex items-center justify-center text-white/80"
                aria-label="Notificações"
                onClick={() => {
                  if (!isAuthenticated) { openAuth(); return; }
                  setNotifOpen(!notifOpen);
                  if (!notifOpen) fetchNotifications();
                }}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-[hsl(var(--danger))] text-white text-[9px] font-semibold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <NotifDropdown
                    notifications={notifications}
                    loading={notifLoading}
                    onClose={() => setNotifOpen(false)}
                    onClick={handleNotifClick}
                    onMarkAllRead={markAllRead}
                    timeAgo={timeAgo}
                    mobile
                  />
                )}
              </AnimatePresence>
            </div>

            {!isAuthenticated ? (
              <button
                onClick={() => openAuth()}
                className="h-9 w-9 flex items-center justify-center text-white/80"
                aria-label="Entrar"
              >
                <User className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold"
              >
                {user?.name?.[0]?.toUpperCase() || "U"}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-14 right-4 z-50 bg-card rounded-lg shadow-card-hover border border-border w-56"
            >
              <div className="flex flex-col p-2">
                <Link to="/painel" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-txt-primary hover:bg-muted rounded-md transition-colors">
                    <LayoutDashboard className="h-4 w-4" /> Meu Painel
                  </button>
                </Link>
                <Link to="/painel/perfil" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-txt-primary hover:bg-muted rounded-md transition-colors">
                    <User className="h-4 w-4" /> Meu Perfil
                  </button>
                </Link>
                <div className="h-px bg-border my-1" />
                <button
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-danger hover:bg-danger-light rounded-md transition-colors"
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                >
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notif overlay backdrop (mobile) */}
      <AnimatePresence>
        {notifOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setNotifOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Notification Dropdown ── */
function NotifDropdown({
  notifications,
  loading,
  onClose,
  onClick,
  onMarkAllRead,
  timeAgo,
  mobile,
}: {
  notifications: Notification[];
  loading: boolean;
  onClose: () => void;
  onClick: (n: Notification) => void;
  onMarkAllRead: () => void;
  timeAgo: (d: string) => string;
  mobile?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={`absolute z-50 bg-white rounded-xl shadow-lg border border-[hsl(var(--border))] overflow-hidden ${
        mobile ? "right-[-8px] top-11 w-[calc(100vw-32px)] max-w-sm" : "right-0 top-11 w-80"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
        <h3 className="text-sm font-semibold text-[hsl(var(--txt-primary))]">Notificações</h3>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={onMarkAllRead}
            className="text-[11px] text-primary font-semibold hover:underline"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Bell className="h-8 w-8 text-[hsl(var(--border))] mx-auto mb-2" />
            <p className="text-[13px] text-[hsl(var(--txt-hint))]">Nenhuma notificação</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => onClick(notif)}
              className={`w-full text-left px-4 py-3 border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--muted))] transition-colors ${
                !notif.read ? "bg-primary/[0.03]" : ""
              }`}
            >
              <div className="flex items-start gap-2.5">
                {!notif.read && (
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                )}
                <div className={`flex-1 min-w-0 ${notif.read ? "ml-[18px]" : ""}`}>
                  <p className={`text-[13px] leading-snug ${!notif.read ? "font-semibold text-[hsl(var(--txt-primary))]" : "text-[hsl(var(--txt-secondary))]"}`}>
                    {notif.title}
                  </p>
                  <p className="text-[12px] text-[hsl(var(--txt-hint))] mt-0.5 line-clamp-2">{notif.body}</p>
                  <p className="text-[10px] text-[hsl(var(--txt-hint))] mt-1">{timeAgo(notif.created_at)}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <Link
          to="/painel/notificacoes"
          onClick={onClose}
          className="block text-center py-2.5 text-[12px] text-primary font-semibold hover:bg-[hsl(var(--muted))] transition-colors border-t border-[hsl(var(--border))]"
        >
          Ver todas as notificações
        </Link>
      )}
    </motion.div>
  );
}
