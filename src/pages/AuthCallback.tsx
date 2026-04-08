import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    const handleCallback = async () => {
      try {
        // Check for error in URL params
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const errorMessage =
          searchParams.get("error_description") || hashParams.get("error_description");

        if (errorMessage) {
          toast.error(decodeURIComponent(errorMessage));
          if (isActive) navigate("/", { replace: true });
          return;
        }

        // If there's a hash with access_token, let Supabase process it
        if (window.location.hash && window.location.hash.includes("access_token")) {
          // Supabase auto-detects hash tokens via detectSessionInUrl (enabled by default)
          // Just wait for onAuthStateChange to fire
          return;
        }

        // If there's a code param (PKCE flow), exchange it
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Code exchange error:", error);
            toast.error("Erro ao finalizar login");
            if (isActive) navigate("/", { replace: true });
          }
          return;
        }

        // Fallback: check if session already exists
        const { data } = await supabase.auth.getSession();
        if (data.session && isActive) {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        toast.error("Erro ao finalizar autenticação");
        if (isActive) navigate("/", { replace: true });
      }
    };

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isActive) return;
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        navigate("/", { replace: true });
      }
    });

    handleCallback();

    // Safety timeout
    const timeout = setTimeout(async () => {
      if (!isActive) return;
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/", { replace: true });
        return;
      }
      toast.error("Não foi possível concluir o login");
      navigate("/", { replace: true });
    }, 8000);

    return () => {
      isActive = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-foreground font-medium">Autenticando...</p>
      </div>
    </div>
  );
}
