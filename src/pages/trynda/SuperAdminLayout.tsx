import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import logoWhite from "@/assets/logo-froiv-white.svg";
import {
  BarChart3, Users, ShoppingBag, DollarSign, Scale, Banknote,
  Bell, Mail, HardDrive, Settings, Shield, Globe, LogOut, Menu, X,
  Search, ChevronRight
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: BarChart3, path: "/trynda" },
  { label: "Usuários", icon: Users, path: "/trynda/usuarios" },
  { label: "Anúncios", icon: ShoppingBag, path: "/trynda/anuncios" },
  { label: "Financeiro", icon: DollarSign, path: "/trynda/financeiro" },
  { label: "Disputas", icon: Scale, path: "/trynda/disputas", badge: "disputes" },
  { label: "Saques", icon: Banknote, path: "/trynda/saques", badge: "withdrawals" },
  { label: "Notificações", icon: Bell, path: "/trynda/notificacoes" },
  { label: "Emails", icon: Mail, path: "/trynda/emails" },
  { label: "Storage", icon: HardDrive, path: "/trynda/storage" },
  { label: "Configurações", icon: Settings, path: "/trynda/config" },
  { label: "Pedidos Ext.", icon: Globe, path: "/trynda/pedidos-externos" },
  { label: "Segurança", icon: Shield, path: "/trynda/seguranca" },
];

export default function SuperAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState<{ disputes: number; withdrawals: number }>({ disputes: 0, withdrawals: 0 });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBadges = async () => {
      const [d, w] = await Promise.all([
        supabase.from("disputes").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("withdrawals").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setBadges({ disputes: d.count ?? 0, withdrawals: w.count ?? 0 });
    };
    fetchBadges();

    const channel = supabase.channel("admin-badges")
      .on("postgres_changes", { event: "*", schema: "public", table: "disputes" }, () => fetchBadges())
      .on("postgres_changes", { event: "*", schema: "public", table: "withdrawals" }, () => fetchBadges())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const currentPage = navItems.find(i => location.pathname === i.path)?.label ?? "Dashboard";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-2 border-b border-white/[0.06]">
        <img src={logoWhite} alt="Froiv" className="h-6" />
        <span className="text-[#c4b5fd] text-xs font-bold uppercase tracking-wider">Admin</span>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const badgeCount = item.badge ? badges[item.badge as keyof typeof badges] : 0;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#7c3aed]/20 text-[#c4b5fd] border-l-[3px] border-[#7c3aed]"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badgeCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  item.badge === "disputes" ? "bg-red-500 text-white animate-pulse" : "bg-[#7c3aed] text-white"
                }`}>
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/[0.06] p-2">
        <a
          href="https://vendagram.lovable.app"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] rounded-lg"
        >
          <Globe className="h-4 w-4" /> Ver site público
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-white/[0.04] rounded-lg w-full"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-[#0a0a16] border-r border-white/[0.06] flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-60 bg-[#0a0a16] z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-[60px] bg-[#0f0f1a] border-b border-white/[0.06] flex items-center px-4 gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>Admin</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-300">{currentPage}</span>
          </div>
          <div className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar usuário, anúncio, pedido..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 hidden sm:inline">Online</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xs font-bold">
              S
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
