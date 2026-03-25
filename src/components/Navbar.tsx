import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, openAuth, logout } = useAuth();

  const isLanding = location.pathname === "/";

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          <span className="font-display text-lg font-bold tracking-wider text-foreground">
            SAFETRADE<span className="text-secondary">.GG</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/">
            <Button variant="ghost" size="sm" className={location.pathname === "/" ? "text-primary" : "text-muted-foreground"}>
              Início
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="ghost" size="sm" className={location.pathname === "/marketplace" ? "text-primary" : "text-muted-foreground"}>
              Marketplace
            </Button>
          </Link>
          {isLanding && (
            <>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => scrollTo("how-it-works")}>
                Como Funciona
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => scrollTo("faq")}>
                FAQ
              </Button>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="glass" size="sm" className="gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
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
            <>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => openAuth()}>
                Entrar
              </Button>
              <Button variant="hero" size="sm" onClick={() => openAuth()}>
                Criar Conta
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border"
          >
            <div className="flex flex-col p-4 gap-2">
              <Link to="/" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Início</Button>
              </Link>
              <Link to="/marketplace" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Marketplace</Button>
              </Link>
              {isLanding && (
                <>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => scrollTo("how-it-works")}>Como Funciona</Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => scrollTo("faq")}>FAQ</Button>
                </>
              )}
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
                  Criar Conta
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
