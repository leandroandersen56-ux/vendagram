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

    let isMounted = true;

    const finishOAuth = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const errorMessage = searchParams.get("error_description") || hashParams.get("error_description");

      if (errorMessage) {
        toast.error(decodeURIComponent(errorMessage));
        if (isMounted) navigate("/", { replace: true });
        return;
      }

      const waitForSession = async () => {
        for (let i = 0; i < 15; i += 1) {
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            if (isMounted) navigate("/", { replace: true });
            return true;
          }

          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        return false;
      };

      const hasSession = await waitForSession();
      if (hasSession) return;

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          toast.error("Erro ao finalizar login com Google");
          if (isMounted) navigate("/", { replace: true });
          return;
        }

        const sessionReady = await waitForSession();
        if (sessionReady) return;
      }

      toast.error("Não foi possível concluir o login com Google");
      if (isMounted) navigate("/", { replace: true });
    };

    void finishOAuth();

    return () => {
      isMounted = false;
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
