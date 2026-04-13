import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoWhite from "@/assets/logo-froiv-white.png";

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
        return;
      }
      setLoggingIn(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      setLoggingIn(false);
      if (error) {
        console.error("SuperAdmin login error:", error.message, error.status, error);
        toast.error(`Erro: ${error.message}`);
      }
    };

    const handleGoogleLogin = async () => {
      setLoggingIn(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/trynda`,
        },
      });
      setLoggingIn(false);
      if (error) {
        console.error("Google login error:", error.message);
        toast.error(`Erro Google: ${error.message}`);
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

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={loggingIn}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50 mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loggingIn ? "Entrando..." : "Entrar com Google"}
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500">ou com senha</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

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
                {loggingIn ? "Entrando..." : "Entrar com Senha"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
