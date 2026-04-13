import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase-custom-client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const SESSION_RETRY_COUNT = 15;
const SESSION_RETRY_DELAY = 300;

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    let finished = false;

    // Check for redirect destination from URL params or localStorage
    const redirectTo = params.get("redirect") || localStorage.getItem("auth_redirect") || "/";
    localStorage.removeItem("auth_redirect");

    const finish = () => {
      if (!isMounted || finished) return;
      finished = true;
      navigate(redirectTo, { replace: true });
    };

    const url = new URL(window.location.href);
    const params = url.searchParams;
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    const oauthError = params.get("error") || hashParams.get("error");
    const oauthErrorDescription = params.get("error_description") || hashParams.get("error_description");

    if (oauthError) {
      toast.error(oauthErrorDescription || "Não foi possível concluir o login");
      finish();
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted || finished) return;

      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") && session) {
        finish();
      }
    });

    const waitForSession = async () => {
      try {
        for (let attempt = 0; attempt < SESSION_RETRY_COUNT; attempt += 1) {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (!isMounted || finished) return;
          if (error) throw error;

          if (session) {
            finish();
            return;
          }

          await new Promise((resolve) => window.setTimeout(resolve, SESSION_RETRY_DELAY));
        }

        toast.error("Não foi possível concluir o login");
        finish();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Não foi possível concluir o login";
        toast.error(message);
        finish();
      }
    };

    void waitForSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
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
