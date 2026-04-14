import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase-custom-client";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
  authRedirect: string | null;
  login: (user: User) => void;
  logout: () => void;
  authRole: "buyer" | "seller" | null;
  openAuth: (redirect?: string, role?: "buyer" | "seller") => void;
  closeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapSupabaseUser(su: SupabaseUser): User {
  const meta = su.user_metadata || {};
  return {
    id: su.id,
    name: meta.name || meta.full_name || su.email?.split("@")[0] || "Usuário",
    email: su.email || "",
    avatar: meta.avatar_url,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRedirect, setAuthRedirect] = useState<string | null>(null);
  const [authRole, setAuthRole] = useState<"buyer" | "seller" | null>(null);

  const fetchVerifiedStatus = async (userId: string) => {
    const { data } = await supabase
      .from("profiles" as any)
      .select("is_verified")
      .eq("user_id", userId)
      .single();
    return !!(data as any)?.is_verified;
  };

  useEffect(() => {
    let isMounted = true;

    const syncUser = async (session: Session | null) => {
      if (!isMounted) return;
      if (session?.user) {
        const mapped = mapSupabaseUser(session.user);
        setUser(mapped);
        setIsLoading(false);
        // Fetch verified status async
        const isVerified = await fetchVerifiedStatus(session.user.id);
        if (isMounted) {
          setUser(prev => prev ? { ...prev, isVerified } : prev);
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session);
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const openAuth = (redirect?: string, role?: "buyer" | "seller") => {
    setAuthRedirect(redirect || null);
    setAuthRole(role || null);
    setShowAuthModal(true);
  };

  const closeAuth = () => {
    setShowAuthModal(false);
    setAuthRedirect(null);
    setAuthRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      showAuthModal,
      authRedirect,
      authRole,
      login,
      logout,
      openAuth,
      closeAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
