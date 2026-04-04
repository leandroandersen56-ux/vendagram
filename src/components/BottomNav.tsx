import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Store, PlusCircle, User, LayoutDashboard, Tag, Wallet, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import MoreMenu from "@/components/menu/MoreMenu";

const PUBLIC_ITEMS = [
  { label: "Início", icon: Home, path: "/" },
  { label: "Explorar", icon: Store, path: "/marketplace" },
  { label: "Anunciar", icon: PlusCircle, path: "/vendedor/novo", highlight: true, auth: true },
  { label: "Perfil", icon: User, path: "/vendedor", state: { tab: "perfil" }, auth: true },
  { label: "Mais", icon: Menu, path: "__more__" },
];

const PANEL_ITEMS = [
  { label: "Painel", icon: LayoutDashboard, path: "/vendedor", state: { tab: "overview" }, exact: true },
  { label: "Anúncios", icon: Tag, path: "/vendedor", state: { tab: "anuncios" } },
  { label: "Anunciar", icon: PlusCircle, path: "/vendedor/novo", highlight: true },
  { label: "Carteira", icon: Wallet, path: "/vendedor", state: { tab: "carteira" } },
  { label: "Mais", icon: Menu, path: "__more__" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, openAuth } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const isPanel = location.pathname.startsWith("/vendedor");
  const items = isPanel ? PANEL_ITEMS : PUBLIC_ITEMS;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-nav sm:hidden">
        <div className="flex items-stretch justify-around h-14">
          {items.map((item, idx) => {
            if (item.path === "__more__") {
              return (
                <button
                  key="more"
                  onClick={() => setMoreOpen(true)}
                  className="flex flex-col items-center justify-center flex-1 gap-0.5 text-txt-hint"
                  aria-label="Mais"
                >
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium">Mais</span>
                </button>
              );
            }

            const hasState = "state" in item && item.state;
            const isActive = item.path === "/"
              ? location.pathname === "/"
              : location.pathname === item.path || location.pathname.startsWith(item.path + "/");

            const handleClick = (e: React.MouseEvent) => {
              if ("auth" in item && item.auth && !isAuthenticated) {
                e.preventDefault();
                openAuth(item.path);
                return;
              }
              if (hasState) {
                e.preventDefault();
                navigate(item.path, { state: item.state });
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
                key={`${item.label}-${idx}`}
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

      <MoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
