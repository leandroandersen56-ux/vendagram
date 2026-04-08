import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const errorMessage =
      searchParams.get("error_description") || hashParams.get("error_description");

    if (errorMessage) {
      toast.error(decodeURIComponent(errorMessage));
      navigate("/", { replace: true });
      return;
    }

    // PKCE flow: exchange code for session
    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          console.error("Code exchange error:", error);
          toast.error("Erro ao finalizar login");
        }
        // Session is now set, navigate home
        navigate("/", { replace: true });
      });
      return;
    }

    // Implicit flow: tokens in hash - Supabase client auto-detects them
    // via detectSessionInUrl. We just need to wait for the session to be ready.
    const waitForSession = async () => {
      // Give Supabase time to process hash tokens
      for (let i = 0; i < 20; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate("/", { replace: true });
          return;
        }
        await new Promise((r) => setTimeout(r, 400));
      }
      toast.error("Não foi possível concluir o login");
      navigate("/", { replace: true });
    };

    waitForSession();
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
