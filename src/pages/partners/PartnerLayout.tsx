import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase-custom-client";
import { usePartner } from "./PartnerGuard";
import logoWhite from "@/assets/logo-froiv-white.png";
import {
  BarChart3, DollarSign, TrendingUp, Wallet, User, LogOut, Menu, ChevronRight, Users
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";

const navItems = [
  { label: "Dashboard", icon: BarChart3, path: "/admintoplogin" },
  { label: "Faturamento", icon: DollarSign, path: "/admintoplogin/faturamento" },
  { label: "Desempenho", icon: TrendingUp, path: "/admintoplogin/desempenho" },
  { label: "Usuários", icon: Users, path: "/admintoplogin/usuarios" },
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
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-white/[0.06]">
        <img src={logoWhite} alt="Froiv" className="h-7" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0ea5e9] bg-[#0ea5e9]/10 px-2 py-0.5 rounded">
          Sócios
        </span>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        <p className="px-5 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
          Navegação
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`group relative flex items-center gap-3 px-4 py-2.5 mx-2 my-0.5 rounded-lg text-[13px] font-semibold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#0ea5e9]/20 to-transparent text-white"
                  : "text-white/55 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-[#0ea5e9]" />
              )}
              <item.icon className={`h-[17px] w-[17px] shrink-0 ${isActive ? "text-[#0ea5e9]" : ""}`} />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/[0.06] p-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-white/55 hover:text-red-400 hover:bg-white/[0.04] rounded-lg w-full transition-colors"
        >
          <LogOut className="h-[17px] w-[17px]" /> Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070f1d] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#0a1424] border-r border-white/[0.06] flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-[#0a1424] z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="h-[60px] bg-[#0a1424]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/60 hover:text-white">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-white/40">
            <span>Sócios</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white font-semibold">{currentPage}</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Online</span>
            </div>
            <span className="text-[13px] font-semibold text-white hidden sm:inline-flex items-center gap-1">
              {partner.name} <VerifiedBadge size={14} />
            </span>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#0369a1] flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/10">
              {partner.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a1424]/95 backdrop-blur-xl border-t border-white/[0.06] z-20 flex">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
                  isActive ? "text-[#0ea5e9]" : "text-white/40"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label.replace("Meu ", "").replace("Minha ", "")}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
