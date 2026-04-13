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
    supabase
      .from("partners" as any)
      .select("id, name, email, profit_percent, pix_key, pix_key_type, is_active, created_at")
      .eq("email", user.email)
      .eq("is_active", true)
      .single()
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
                {loggingIn ? "Entrando..." : "Entrar"}
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
