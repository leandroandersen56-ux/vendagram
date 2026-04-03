import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Bell, User, LogOut, LayoutDashboard, Store, ShoppingBag, Tag, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import logoFroiv from "@/assets/logo-froiv.png";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuth, logout } = useAuth();

  const handleSell = () => {
    if (isAuthenticated) navigate("/painel/anuncios/novo");
    else openAuth("/painel/anuncios/novo");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary" style={{ height: '56px' }}>
        <div className="container mx-auto flex items-center h-full px-4 gap-3">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img src={logoFroiv} alt="Froiv" className="h-7 md:h-8 brightness-0 invert" />
          </Link>

          {/* Search bar - always visible */}
          <div className="flex-1 max-w-xl">
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
                <Store className="h-4 w-4" /> Loja
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 text-[13px]">
                <ShoppingBag className="h-4 w-4" /> Marketplace
              </Button>
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button className="relative h-9 w-9 flex items-center justify-center text-white/80 hover:text-white transition-colors" aria-label="Notificações">
              <Bell className="h-5 w-5" />
            </button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold hover:bg-white/30 transition-colors">
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
                  className="bg-white text-primary hover:bg-white/90 rounded-lg text-[13px] font-bold px-4 shadow-sm"
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </div>

          {/* Mobile right icons */}
          <div className="flex items-center gap-0.5 md:hidden shrink-0">
            <button className="h-9 w-9 flex items-center justify-center text-white/80" aria-label="Notificações">
              <Bell className="h-5 w-5" />
            </button>
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
                className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold"
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
    </>
  );
}
