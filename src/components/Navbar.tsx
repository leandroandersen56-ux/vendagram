import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, User, LogOut, LayoutDashboard, ShoppingCart, Plus } from "lucide-react";
import { Search, Menu, X, User, LogOut, LayoutDashboard, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuth, logout } = useAuth();

  const handleSell = () => {
    if (isAuthenticated) {
      navigate("/painel/anuncios/novo");
    } else {
      openAuth("/painel/anuncios/novo");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D] border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-lg font-bold tracking-wider text-[#FFFF00]">
            SAFETRADE<span className="text-muted-foreground">.GG</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/">
            <Button variant="ghost" size="sm" className={location.pathname === "/" ? "text-[#FFFF00]" : "text-muted-foreground hover:text-foreground"}>
              Loja
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="ghost" size="sm" className={location.pathname === "/marketplace" ? "text-[#FFFF00]" : "text-muted-foreground hover:text-foreground"}>
              Marketplace
            </Button>
          </Link>
        </div>

        {/* Search bar (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Input
              placeholder="Pesquisar"
              className="w-full bg-muted border-border h-9 pr-10 text-sm placeholder:text-muted-foreground"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-foreground">
                  <div className="h-7 w-7 rounded-full bg-[#FFFF00]/20 flex items-center justify-center text-[#FFFF00] text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  {user?.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                <DropdownMenuItem asChild>
                  <Link to="/painel" className="cursor-pointer">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Meu Painel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/painel/perfil" className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => openAuth()}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="h-9 w-9 rounded-full bg-muted/50 border border-border flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-sm font-semibold text-foreground">Cadastre-se</span>
                <span className="text-xs text-muted-foreground">Login</span>
              </div>
              <svg className="h-4 w-4 text-muted-foreground ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Mobile: Anunciar + toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={handleSell}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-bold text-[11px] tracking-wide hover:bg-primary/90 transition-all shadow-[0_0_10px_hsl(60_100%_50%/0.25)]"
          >
            <Plus className="h-3 w-3" />
            Anunciar
          </button>
          <Button variant="ghost" size="icon" className="text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0D0D0D] border-t border-border"
          >
            <div className="flex flex-col p-4 gap-2">
              <Link to="/" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Loja</Button>
              </Link>
              <Link to="/marketplace" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Marketplace</Button>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/painel" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Meu Painel</Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => { logout(); setMobileOpen(false); }}>
                    Sair
                  </Button>
                </>
              ) : (
                <Button variant="hero" className="w-full mt-2" onClick={() => { openAuth(); setMobileOpen(false); }}>
                  Cadastre-se / Login
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
