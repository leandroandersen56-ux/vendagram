import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase-custom-client";
import logoWhite from "@/assets/logo-froiv-white.png";
import { toast } from "sonner";

export interface PartnerData {
  id: string;
  name: string;
  email: string;
  profit_percent: number;
  pix_key: string | null;
  pix_key_type: string | null;
  is_active: boolean;
  created_at: string;
}

const ADMIN_EMAILS = ["sparckonmeta@gmail.com", "contabanco743@gmail.com", "vg786674@gmail.com"];

export default function PartnerGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<PartnerData | null | undefined>(undefined);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (!isLoading) setPartner(null);
      return;
    }

    if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      setPartner({
        id: "admin-partner-access",
        name: user.name || "Admin",
        email: user.email,
        profit_percent: 0,
        pix_key: null,
        pix_key_type: null,
        is_active: true,
        created_at: new Date().toISOString(),
      });
      return;
    }

    supabase
      .from("partners" as any)
      .select("id, name, email, profit_percent, pix_key, pix_key_type, is_active, created_at")
      .eq("email", user.email)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          navigate("/", { replace: true });
        } else {
          setPartner(data as unknown as PartnerData);
        }
      });
  }, [isAuthenticated, user, isLoading, navigate]);

  if (isLoading || partner === undefined) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0ea5e9]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoggingIn(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      setLoggingIn(false);
      if (error) toast.error(`Erro: ${error.message}`);
    };

    const handleGoogleLogin = async () => {
      setLoggingIn(true);
      localStorage.setItem("auth_redirect", "/admintoplogin");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setLoggingIn(false);
      if (error) toast.error(`Erro Google: ${error.message}`);
    };

    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-[#0f2040] rounded-xl border border-[rgba(14,165,233,0.15)] p-8">
            <div className="flex justify-center mb-6">
              <img src={logoWhite} alt="Froiv" className="h-8" />
            </div>
            <h2 className="text-[#F0F9FF] text-center text-lg font-semibold mb-1">
              Painel de Sócios
            </h2>
            <p className="text-[#7DD3FC] text-center text-xs mb-6">Acesso restrito a sócios autorizados</p>

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
              <span className="text-xs text-[#7DD3FC]/50">ou com senha</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-[#7DD3FC] mb-1 block">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#0a1628] border border-[rgba(14,165,233,0.15)] rounded-lg px-3 py-2.5 text-[#F0F9FF] text-sm focus:outline-none focus:border-[#0ea5e9]"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="text-xs text-[#7DD3FC] mb-1 block">Senha</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#0a1628] border border-[rgba(14,165,233,0.15)] rounded-lg px-3 py-2.5 text-[#F0F9FF] text-sm focus:outline-none focus:border-[#0ea5e9]"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loggingIn ? "Entrando..." : "Entrar com Senha"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!partner) return null;

  return <PartnerContext.Provider value={partner}>{children}</PartnerContext.Provider>;
}

import { createContext, useContext } from "react";

const PartnerContext = createContext<PartnerData | null>(null);

export function usePartner() {
  const ctx = useContext(PartnerContext);
  if (!ctx) throw new Error("usePartner must be inside PartnerGuard");
  return ctx;
}
