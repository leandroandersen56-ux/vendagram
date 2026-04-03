import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, User, LogOut, LayoutDashboard, Plus, Store, ShoppingBag, ShoppingCart, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import logoFroiv from "@/assets/logo-froiv.png";
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-14 md:h-16 px-4 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img src={logoFroiv} alt="Froiv" className="h-8 md:h-9" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/">
            <Button variant="ghost" size="sm" className={`gap-1.5 ${location.pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <Store className="h-4 w-4" />
              Loja
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="ghost" size="sm" className={`gap-1.5 ${location.pathname === "/marketplace" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <ShoppingBag className="h-4 w-4" />
              Marketplace
            </Button>
          </Link>
        </div>

        {/* Search bar (desktop) - hidden on home */}
        {location.pathname !== "/" && (
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Input
                placeholder="Buscar contas..."
                className="w-full bg-muted border-border h-10 pl-4 pr-10 text-sm placeholder:text-muted-foreground rounded-full"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-foreground">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  {user?.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background border-border">
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
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => openAuth()} className="text-foreground font-semibold">
                Entrar
              </Button>
              <Button variant="hero" size="sm" className="px-5" onClick={() => openAuth()}>
                Cadastrar
              </Button>
            </div>
          )}
        </div>

        {/* Mobile: right icons */}
        <div className="flex items-center gap-1 md:hidden">
          {!isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="hero" size="sm" className="px-3 py-1 text-xs h-8">
                  Cadastrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-background border-border">
                <DropdownMenuItem className="cursor-pointer py-3" onClick={() => openAuth(undefined, "buyer")}>
                  <ShoppingCart className="h-4 w-4 mr-2 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Comprador</p>
                    <p className="text-xs text-muted-foreground">Quero comprar contas</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer py-3" onClick={() => openAuth(undefined, "seller")}>
                  <Tag className="h-4 w-4 mr-2 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Vendedor</p>
                    <p className="text-xs text-muted-foreground">Quero vender minhas contas</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {location.pathname !== "/" && (
            <button onClick={() => navigate("/marketplace")} className="h-9 w-9 flex items-center justify-center text-primary">
              <Search className="h-5 w-5" />
            </button>
          )}
          <Button variant="ghost" size="icon" className="text-primary h-9 w-9" onClick={() => setMobileOpen(!mobileOpen)}>
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
            className="md:hidden bg-background border-t border-border"
          >
            <div className="flex flex-col p-4 gap-2">
              <Link to="/" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2"><Store className="h-4 w-4" /> Loja</Button>
              </Link>
              <Link to="/marketplace" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2"><ShoppingBag className="h-4 w-4" /> Marketplace</Button>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/painel" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2"><LayoutDashboard className="h-4 w-4" /> Meu Painel</Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => { logout(); setMobileOpen(false); }}>
                    Sair
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <Button variant="hero" className="w-full" onClick={() => { openAuth(undefined, "buyer"); setMobileOpen(false); }}>
                    <ShoppingCart className="h-4 w-4 mr-1" /> Cadastrar como Comprador
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => { openAuth(undefined, "seller"); setMobileOpen(false); }}>
                    <Tag className="h-4 w-4 mr-1" /> Cadastrar como Vendedor
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => { openAuth(); setMobileOpen(false); }}>
                    Já tenho conta · Entrar
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
