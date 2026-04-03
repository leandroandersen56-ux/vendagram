import { Link, useLocation } from "react-router-dom";
import { Home, Store, PlusCircle, Wallet, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Início", icon: Home, path: "/" },
  { label: "Marketplace", icon: Store, path: "/marketplace" },
  { label: "Anunciar", icon: PlusCircle, path: "/painel/anuncios/novo", highlight: true, auth: true },
  { label: "Carteira", icon: Wallet, path: "/painel/carteira", auth: true },
  { label: "Mais", icon: Menu, path: "/painel", auth: true },
];

export default function BottomNav() {
  const location = useLocation();
  const { isAuthenticated, openAuth } = useAuth();

  // Hide on panel pages (has its own nav)
  if (location.pathname.startsWith("/painel")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border sm:hidden">
      <div className="flex items-stretch justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path);

          const handleClick = (e: React.MouseEvent) => {
            if (item.auth && !isAuthenticated) {
              e.preventDefault();
              openAuth(item.path);
            }
          };

          if (item.highlight) {
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={handleClick}
                className="flex flex-col items-center justify-center relative -mt-4"
              >
                <div className="bg-primary rounded-full p-2.5 shadow-lg border-4 border-background">
                  <item.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-[10px] font-medium text-primary mt-0.5">{item.label}</span>
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
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for devices with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
