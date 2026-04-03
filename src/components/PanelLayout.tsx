import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, Tag, Wallet, User, Bell,
  LogOut, Shield, ChevronLeft, Menu, X, PlusCircle,
  ArrowDown, ArrowRight, ArrowUp, ScanLine
} from "lucide-react";
import logoFroiv from "@/assets/logo-froiv.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import DepositModal from "@/components/wallet/DepositModal";
import TransferModal from "@/components/wallet/TransferModal";
import WithdrawModal from "@/components/wallet/WithdrawModal";
import QRScannerModal from "@/components/wallet/QRScannerModal";

const PANEL_NAV = [
  { to: "/painel", label: "Visão Geral", icon: LayoutDashboard, exact: true },
  { to: "/painel/anuncios/novo", label: "Criar Anúncio", icon: PlusCircle, exact: true },
  { to: "/painel/anuncios", label: "Meus Anúncios", icon: Tag, exact: true },
  { to: "/painel/transacoes", label: "Transações", icon: ShoppingBag },
  { to: "/painel/notificacoes", label: "Notificações", icon: Bell, badge: 3 },
  { to: "/painel/perfil", label: "Meu Perfil", icon: User },
];

export default function PanelLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const walletActions = [
    { label: "Depositar", icon: ArrowDown, color: "text-success", bg: "bg-success/10", onClick: () => setShowDeposit(true) },
    { label: "Transferir", icon: ArrowRight, color: "text-info", bg: "bg-info/10", onClick: () => setShowTransfer(true) },
    { label: "Sacar", icon: ArrowUp, color: "text-primary", bg: "bg-primary/10", onClick: () => setShowWithdraw(true) },
    { label: "Pagar com QR", icon: ScanLine, color: "text-warning", bg: "bg-warning/10", onClick: () => setShowQR(true) },
  ];

  const isActive = (item: typeof PANEL_NAV[0]) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-border bg-background fixed top-0 left-0 h-full z-40">
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Link to="/" className="flex items-center gap-1.5">
            <img src={logoFroiv} alt="Froiv" className="h-7" />
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {PANEL_NAV.map((item) => {
            const active = isActive(item);
            return (
              <Link key={item.to} to={item.to}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className={`h-[18px] w-[18px] ${active ? "text-primary" : ""}`} />
                  {item.label}
                  {item.badge && (
                    <Badge className="ml-auto bg-destructive text-destructive-foreground text-[10px] h-5 min-w-5 flex items-center justify-center p-0 rounded-full">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-border space-y-0.5">
          <Link to="/">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <ChevronLeft className="h-[18px] w-[18px]" />
              Voltar ao Site
            </div>
          </Link>
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-destructive hover:bg-destructive/10 cursor-pointer transition-all"
            onClick={() => { logout(); navigate("/"); }}
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sair
          </div>
        </div>

        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop top bar */}
      <div className="hidden lg:flex fixed top-0 left-[260px] right-0 h-16 bg-background/95 backdrop-blur border-b border-border z-30 items-center justify-end px-6 gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">R$ 890,00</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-1.5 bg-background border-border" align="end">
            <div className="space-y-0.5">
              {walletActions.map((a) => (
                <button key={a.label} onClick={a.onClick} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] hover:bg-muted transition-all">
                  <div className={`h-7 w-7 rounded-full ${a.bg} flex items-center justify-center`}>
                    <a.icon className={`h-3.5 w-3.5 ${a.color}`} />
                  </div>
                  <span className="text-foreground">{a.label}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Link to="/painel/notificacoes">
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-muted">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">3</span>
          </Button>
        </Link>

        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur z-40 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl" onClick={() => setSidebarOpen(true)}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="16" y2="12" />
              <line x1="4" y1="18" x2="12" y2="18" />
            </svg>
          </Button>
          <img src={logoFroiv} alt="Froiv" className="h-6" />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted transition-all">
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-1.5 bg-background border-border" align="end">
            <div className="space-y-0.5">
              {walletActions.map((a) => (
                <button key={a.label} onClick={a.onClick} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] hover:bg-muted transition-all">
                  <div className={`h-7 w-7 rounded-full ${a.bg} flex items-center justify-center`}>
                    <a.icon className={`h-3.5 w-3.5 ${a.color}`} />
                  </div>
                  <span className="text-foreground">{a.label}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50"
          >
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-[260px] h-full bg-background border-r border-border flex flex-col"
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-border">
                <Link to="/" className="flex items-center gap-1.5">
                  <img src={logoFroiv} alt="Froiv" className="h-6" />
                </Link>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setSidebarOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-0.5">
                {PANEL_NAV.map((item) => {
                  const active = isActive(item);
                  return (
                    <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                      }`}>
                        <item.icon className="h-[18px] w-[18px]" />
                        {item.label}
                        {item.badge && <Badge className="ml-auto bg-destructive text-destructive-foreground text-[10px] h-5 min-w-5 p-0 flex items-center justify-center rounded-full">{item.badge}</Badge>}
                      </div>
                    </Link>
                  );
                })}
              </nav>
              <div className="px-3 py-3 border-t border-border">
                <div className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-destructive cursor-pointer hover:bg-destructive/10 rounded-xl transition-all" onClick={() => { logout(); navigate("/"); }}>
                  <LogOut className="h-[18px] w-[18px]" /> Sair
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-[260px] pt-14 lg:pt-16 pb-16 sm:pb-0 overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:px-8 lg:py-8 max-w-6xl w-full">
          <Outlet />
        </div>
      </main>

      <DepositModal open={showDeposit} onClose={() => setShowDeposit(false)} />
      <TransferModal open={showTransfer} onClose={() => setShowTransfer(false)} balance={890} />
      <WithdrawModal open={showWithdraw} onClose={() => setShowWithdraw(false)} balance={890} pixKey="***.***.***-00" />
      <QRScannerModal open={showQR} onClose={() => setShowQR(false)} balance={890} />
    </div>
  );
}
