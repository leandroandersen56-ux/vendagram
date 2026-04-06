import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Bell, User, LogOut, LayoutDashboard, ShoppingBag, ShoppingCart, Loader2, Heart, Wallet, Settings, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { formatBRL, PLATFORM_COVERS } from "@/lib/mock-data";
import { getListingImage } from "@/lib/utils";
import logoFroiv from "@/assets/logo-froiv.png";
import logoFroivWhite from "@/assets/logo-froiv-white.svg";
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
  
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuth, logout } = useAuth();
  const { favorites, loading: favLoading, fetchFavorites: fetchFavs } = useFavorites();
  const [favOpen, setFavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; price: number; category: string; screenshots: string[] | null }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    setSearchLoading(true);
    setSearchOpen(true);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, title, price, category, screenshots")
        .eq("status", "active")
        .ilike("title", `%${searchQuery.trim()}%`)
        .limit(6);
      setSearchResults(data || []);
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


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
    if (isAuthenticated) navigate("/vendedor/novo");
    else openAuth("/vendedor/novo");
  };

  // Close notif dropdown on route change
  useEffect(() => {
    setNotifOpen(false);
    setFavOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary" style={{ height: '56px' }}>
        <div className="container mx-auto flex items-center h-full gap-3">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img src={logoFroivWhite} alt="Froiv" className="h-7 md:h-8" />
          </Link>

          {/* Search bar */}
          <div className="flex-1" ref={searchRef}>
            <div className="relative w-full">
              <Input
                placeholder="Buscar contas, jogos, redes sociais..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery.trim().length >= 2 && searchResults.length > 0) setSearchOpen(true); }}
                onKeyDown={(e) => { if (e.key === "Enter" && searchQuery.trim()) { setSearchOpen(false); navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`); } }}
                className="w-full bg-white border-0 h-9 pl-3 pr-10 text-[13px] text-[#111] placeholder:text-txt-hint rounded-[24px] shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <button
                onClick={() => { if (searchQuery.trim()) { setSearchOpen(false); navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`); } }}
                className="absolute right-0.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary-light flex items-center justify-center hover:bg-primary/10 transition-colors"
              >
                <Search className="h-4 w-4 text-primary" />
              </button>

              {/* Live search dropdown */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-[hsl(var(--border))] overflow-hidden z-50"
                  >
                    {searchLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-[360px] overflow-y-auto">
                        {searchResults.map((item) => (
                          <Link
                            key={item.id}
                            to={`/anuncio/${item.id}`}
                            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-[hsl(var(--muted))] transition-colors border-b border-[hsl(var(--border))]/40 last:border-0"
                          >
                            <img
                              src={getListingImage(item.category, item.screenshots)}
                              alt={item.title}
                              className="h-11 w-11 rounded-lg object-cover shrink-0 bg-muted"
                              onError={(e) => { (e.target as HTMLImageElement).src = PLATFORM_COVERS[item.category] || "/placeholder.svg"; }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-[hsl(var(--txt-primary))] truncate">{item.title}</p>
                              <p className="text-[12px] font-semibold text-primary">{formatBRL(item.price)}</p>
                            </div>
                          </Link>
                        ))}
                        <Link
                          to={`/busca?q=${encodeURIComponent(searchQuery.trim())}`}
                          onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                          className="block text-center py-2.5 text-[12px] font-semibold text-primary hover:bg-[hsl(var(--muted))] transition-colors"
                        >
                          Ver todos os resultados →
                        </Link>
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-[13px] text-[hsl(var(--txt-hint))]">Nenhum resultado para "{searchQuery}"</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
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

            {/* Favorites (desktop) */}
            <div className="relative">
              <button
                className="relative h-9 w-9 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                aria-label="Favoritos"
                onClick={() => {
                  if (!isAuthenticated) { openAuth(); return; }
                  setFavOpen(!favOpen);
                  if (!favOpen) fetchFavs();
                }}
              >
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-[hsl(var(--danger))] text-white text-[9px] font-semibold flex items-center justify-center">
                    {favorites.length > 9 ? "9+" : favorites.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {favOpen && (
                  <FavDropdown
                    favorites={favorites}
                    loading={favLoading}
                    onClose={() => setFavOpen(false)}
                    navigate={navigate}
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
                <DropdownMenuContent align="end" className="w-64 bg-card border-border p-0 rounded-xl shadow-lg">
                  {/* Profile header */}
                  <div className="bg-gradient-to-br from-primary to-[#1A4BC4] rounded-t-xl px-4 py-3 text-white">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-base font-semibold">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{user?.name || "Usuário"}</p>
                        <p className="text-[11px] text-white/70 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-1">
                    <DropdownMenuItem asChild><Link to="/vendedor" className="cursor-pointer gap-2"><LayoutDashboard className="h-4 w-4" /> Meu Painel</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/vendedor" className="cursor-pointer gap-2"><User className="h-4 w-4" /> Meu Perfil</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/compras" className="cursor-pointer gap-2"><ShoppingCart className="h-4 w-4" /> Minhas Compras</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/vendedor" className="cursor-pointer gap-2"><ShoppingBag className="h-4 w-4" /> Central do Vendedor</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/carteira" className="cursor-pointer gap-2"><Wallet className="h-4 w-4" /> Minha Carteira</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to="/configuracoes" className="cursor-pointer gap-2"><Settings className="h-4 w-4" /> Configurações</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/ajuda" className="cursor-pointer gap-2"><HelpCircle className="h-4 w-4" /> Ajuda</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive gap-2" onClick={logout}>
                      <LogOut className="h-4 w-4" /> Sair da conta
                    </DropdownMenuItem>
                  </div>
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
          <div className="flex items-center gap-0 md:hidden shrink-0">

            {/* Cart (mobile) */}
            <Link to="/cart" className="relative h-8 w-8 flex items-center justify-center text-white/80">
              <ShoppingCart className="h-[18px] w-[18px]" />
            </Link>

            {!isAuthenticated ? (
              <button
                onClick={() => openAuth()}
                className="h-8 w-8 flex items-center justify-center text-white/80"
                aria-label="Entrar"
              >
                <User className="h-[18px] w-[18px]" />
              </button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] font-semibold ml-0.5">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-card border-border p-0 rounded-xl shadow-lg">
                  <div className="bg-gradient-to-br from-primary to-[#1A4BC4] rounded-t-xl px-4 py-3 text-white">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-base font-semibold">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{user?.name || "Usuário"}</p>
                        <p className="text-[11px] text-white/70 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-1">
                    <DropdownMenuItem asChild><Link to="/vendedor" className="cursor-pointer gap-2"><LayoutDashboard className="h-4 w-4" /> Meu Painel</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/vendedor" className="cursor-pointer gap-2"><User className="h-4 w-4" /> Meu Perfil</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/compras" className="cursor-pointer gap-2"><ShoppingCart className="h-4 w-4" /> Minhas Compras</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/favoritos" className="cursor-pointer gap-2"><Heart className="h-4 w-4" /> Favoritos</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/carteira" className="cursor-pointer gap-2"><Wallet className="h-4 w-4" /> Minha Carteira</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to="/configuracoes" className="cursor-pointer gap-2"><Settings className="h-4 w-4" /> Configurações</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/ajuda" className="cursor-pointer gap-2"><HelpCircle className="h-4 w-4" /> Ajuda</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive gap-2" onClick={logout}>
                      <LogOut className="h-4 w-4" /> Sair da conta
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </nav>


      {/* Overlay backdrop for dropdowns */}
      <AnimatePresence>
        {(notifOpen || favOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => { setNotifOpen(false); setFavOpen(false); }}
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
          to="/notificacoes"
          onClick={onClose}
          className="block text-center py-2.5 text-[12px] text-primary font-semibold hover:bg-[hsl(var(--muted))] transition-colors border-t border-[hsl(var(--border))]"
        >
          Ver todas as notificações
        </Link>
      )}
    </motion.div>
  );
}

/* ── Favorites Dropdown ── */
function FavDropdown({
  favorites,
  loading,
  onClose,
  navigate,
}: {
  favorites: import("@/hooks/useFavorites").FavoriteWithListing[];
  loading: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute z-50 bg-white rounded-xl shadow-lg border border-[hsl(var(--border))] overflow-hidden right-0 top-11 w-80"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
        <h3 className="text-sm font-semibold text-[hsl(var(--txt-primary))]">Favoritos</h3>
        <span className="text-[11px] text-[hsl(var(--txt-hint))]">{favorites.length} itens</span>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Heart className="h-8 w-8 text-[hsl(var(--border))] mx-auto mb-2" />
            <p className="text-[13px] text-[hsl(var(--txt-hint))]">Nenhum favorito</p>
          </div>
        ) : (
          favorites.slice(0, 5).map((fav) => {
            const listing = fav.listing;
            if (!listing) return null;
            const thumb = listing.screenshots?.[0] || PLATFORM_COVERS[listing.category as keyof typeof PLATFORM_COVERS];
            return (
              <button
                key={fav.id}
                onClick={() => { onClose(); navigate(`/listing/${listing.id}`); }}
                className="w-full text-left px-4 py-3 border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--muted))] transition-colors flex items-center gap-3"
              >
                {thumb ? (
                  <img src={thumb} alt={listing.title} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center shrink-0">
                    <Heart className="h-4 w-4 text-[hsl(var(--txt-hint))]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[hsl(var(--txt-primary))] truncate">{listing.title}</p>
                  <p className="text-[12px] font-semibold text-primary mt-0.5">{formatBRL(listing.price)}</p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {favorites.length > 0 && (
        <Link
          to="/favoritos"
          onClick={onClose}
          className="block text-center py-2.5 text-[12px] text-primary font-semibold hover:bg-[hsl(var(--muted))] transition-colors border-t border-[hsl(var(--border))]"
        >
          Ver todos os favoritos
        </Link>
      )}
    </motion.div>
  );
}
