import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, Tag, Wallet, User, Bell,
  Settings, LogOut, Shield, ChevronLeft, Menu, X, PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const PANEL_NAV = [
  { to: "/painel", label: "Visão Geral", icon: LayoutDashboard, exact: true },
  { to: "/painel/anuncios/novo", label: "Criar Anúncio", icon: PlusCircle, exact: true },
  { to: "/painel/anuncios", label: "Meus Anúncios", icon: Tag, exact: true },
  { to: "/painel/transacoes", label: "Transações", icon: ShoppingBag },
  { to: "/painel/carteira", label: "Carteira", icon: Wallet },
  { to: "/painel/notificacoes", label: "Notificações", icon: Bell, badge: 3 },
  { to: "/painel/perfil", label: "Meu Perfil", icon: User },
];

export default function PanelLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (item: typeof PANEL_NAV[0]) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/50 fixed top-0 left-0 h-full z-40">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-display text-sm font-bold tracking-wider text-foreground">
              SAFETRADE<span className="text-secondary">.GG</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {PANEL_NAV.map((item) => (
            <Link key={item.to} to={item.to}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive(item)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.badge && (
                  <Badge className="ml-auto bg-destructive text-destructive-foreground text-[10px] h-5 w-5 flex items-center justify-center p-0">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <Link to="/">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
              <ChevronLeft className="h-4 w-4" />
              Voltar ao Site
            </div>
          </Link>
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 cursor-pointer transition-all"
            onClick={() => { logout(); navigate("/"); }}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 glass z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-display text-sm font-bold tracking-wider text-foreground">
            SAFETRADE<span className="text-secondary">.GG</span>
          </span>
        </div>
        <Link to="/painel/carteira">
          <Button variant="ghost" size="icon" className="relative">
            <Wallet className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Desktop top bar */}
      <div className="hidden lg:flex fixed top-0 left-64 right-0 h-14 bg-card/80 backdrop-blur-sm border-b border-border z-30 items-center justify-end px-6 gap-3">
        <Link to="/painel/carteira">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-medium">R$ 890,00</span>
          </Button>
        </Link>
        <Link to="/painel/notificacoes">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center">3</span>
          </Button>
        </Link>
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:hidden fixed inset-0 z-50"
        >
          <div className="absolute inset-0 bg-background/80" onClick={() => setSidebarOpen(false)} />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className="relative w-64 h-full bg-card border-r border-border flex flex-col"
          >
            <div className="p-4 flex items-center justify-between border-b border-border">
              <Link to="/" className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-display text-sm font-bold text-foreground">SAFETRADE<span className="text-secondary">.GG</span></span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {PANEL_NAV.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive(item) ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"}`}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.badge && <Badge className="ml-auto bg-destructive text-destructive-foreground text-[10px] h-5 w-5 p-0 flex items-center justify-center">{item.badge}</Badge>}
                  </div>
                </Link>
              ))}
            </nav>
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-destructive cursor-pointer" onClick={() => { logout(); navigate("/"); }}>
                <LogOut className="h-4 w-4" /> Sair
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-14">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
