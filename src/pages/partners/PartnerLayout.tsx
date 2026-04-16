import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase-custom-client";
import { usePartner } from "./PartnerGuard";
import logoWhite from "@/assets/logo-froiv-white.png";
import {
  BarChart3, DollarSign, TrendingUp, Wallet, User, LogOut, Menu, X, ChevronRight, Users, Package
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";

const navItems = [
  { label: "Dashboard", icon: BarChart3, path: "/admintoplogin" },
  { label: "Faturamento", icon: DollarSign, path: "/admintoplogin/faturamento" },
  { label: "Desempenho", icon: TrendingUp, path: "/admintoplogin/desempenho" },
  { label: "Cadastros", icon: Users, path: "/admintoplogin/usuarios" },
  { label: "Produtos", icon: Package, path: "/admintoplogin/produtos" },
  { label: "Meu Saque", icon: Wallet, path: "/admintoplogin/saque" },
  { label: "Minha Conta", icon: User, path: "/admintoplogin/conta" },
];

export default function PartnerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const partner = usePartner();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const currentPage = navItems.find(i => location.pathname === i.path)?.label ?? "Dashboard";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-2 border-b border-[rgba(14,165,233,0.15)]">
        <img src={logoWhite} alt="Froiv" className="h-6" />
        <span className="text-[#7DD3FC] text-xs font-bold uppercase tracking-wider">Sócios</span>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#0ea5e9]/20 text-[#7DD3FC] border-l-[3px] border-[#0ea5e9]"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[rgba(14,165,233,0.15)] p-2">
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
    <div className="min-h-screen bg-[#0a1628] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-[#071020] border-r border-[rgba(14,165,233,0.15)] flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-60 bg-[#071020] z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="h-[60px] bg-[#0a1628] border-b border-[rgba(14,165,233,0.15)] flex items-center px-4 gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>Sócios</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#7DD3FC]">{currentPage}</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 hidden sm:inline">Online</span>
            </div>
            <span className="text-sm text-[#F0F9FF] hidden sm:inline flex items-center gap-1">{partner.name} <VerifiedBadge size={16} /></span>
            <div className="h-8 w-8 rounded-full bg-[#0ea5e9] flex items-center justify-center text-white text-xs font-bold">
              {partner.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#071020] border-t border-[rgba(14,165,233,0.15)] z-20 flex">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center py-2 text-[10px] ${
                  isActive ? "text-[#0ea5e9]" : "text-gray-500"
                }`}
              >
                <item.icon className="h-5 w-5 mb-0.5" />
                {item.label.replace("Meu ", "").replace("Minha ", "")}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
