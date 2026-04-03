import { Link, useLocation } from "react-router-dom";
import { Home, Store, PlusCircle, Heart, User, LayoutDashboard, Tag, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const PUBLIC_ITEMS = [
  { label: "Início", icon: Home, path: "/" },
  { label: "Marketplace", icon: Store, path: "/marketplace" },
  { label: "Anunciar", icon: PlusCircle, path: "/painel/anuncios/novo", highlight: true, auth: true },
  { label: "Favoritos", icon: Heart, path: "/marketplace", auth: false },
  { label: "Perfil", icon: User, path: "/painel/perfil", auth: true },
];

const PANEL_ITEMS = [
  { label: "Painel", icon: LayoutDashboard, path: "/painel", exact: true },
  { label: "Anúncios", icon: Tag, path: "/painel/anuncios" },
  { label: "Anunciar", icon: PlusCircle, path: "/painel/anuncios/novo", highlight: true },
  { label: "Carteira", icon: Wallet, path: "/painel/carteira" },
  { label: "Perfil", icon: User, path: "/painel/perfil" },
];

export default function BottomNav() {
  const location = useLocation();
  const { isAuthenticated, openAuth } = useAuth();

  const isPanel = location.pathname.startsWith("/painel");
  const items = isPanel ? PANEL_ITEMS : PUBLIC_ITEMS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-nav sm:hidden">
      <div className="flex items-stretch justify-around h-14">
        {items.map((item) => {
          const isExact = "exact" in item && item.exact;
          const isActive = isExact
            ? location.pathname === item.path
            : item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          const handleClick = (e: React.MouseEvent) => {
            if ("auth" in item && item.auth && !isAuthenticated) {
              e.preventDefault();
              openAuth(item.path);
            }
          };

          if ("highlight" in item && item.highlight) {
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={handleClick}
                className="flex flex-col items-center justify-center relative -mt-3"
                aria-label={item.label}
              >
                <div className="bg-primary rounded-full p-3 shadow-lg border-4 border-card">
                  <item.icon className="h-5 w-5 text-primary-foreground" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-semibold text-primary mt-0.5">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={handleClick}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors",
                isActive ? "text-primary" : "text-txt-hint"
              )}
              aria-label={item.label}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
