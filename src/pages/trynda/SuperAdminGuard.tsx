import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoWhite from "@/assets/logo-froiv-white.svg";

const SUPERADMIN_EMAIL = "sparckonmeta@gmail.com";

export default function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [loginEmail, setLoginEmail] = useState(SUPERADMIN_EMAIL);
  const [loginPassword, setLoginPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c3aed]" />
      </div>
    );
  }

  // Authenticated but wrong email → silent redirect
  if (isAuthenticated && user?.email !== SUPERADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  // Not authenticated → show login
  if (!isAuthenticated) {
    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (loginEmail !== SUPERADMIN_EMAIL) {
        return; // silent redirect
      }
      setLoggingIn(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      setLoggingIn(false);
      if (error) {
        toast.error("Credenciais inválidas");
      }
    };

    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-[#1a1a2e] rounded-xl border border-white/[0.08] p-8">
            <div className="flex justify-center mb-6">
              <img src={logoWhite} alt="Froiv" className="h-8" />
            </div>
            <h2 className="text-white text-center text-lg font-semibold mb-6">
              Painel Administrativo
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#7c3aed]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Senha</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#7c3aed]"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loggingIn ? "Entrando..." : "Entrar no Painel"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
