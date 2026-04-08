import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase-custom-client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    const oauthError = params.get("error") || hashParams.get("error");
    const oauthErrorDescription = params.get("error_description") || hashParams.get("error_description");

    if (oauthError) {
      toast.error(oauthErrorDescription || "Não foi possível concluir o login");
      navigate("/", { replace: true });
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === "SIGNED_IN" && session) {
        navigate("/", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && isMounted) {
        navigate("/", { replace: true });
      }
    });

    const timeout = setTimeout(() => {
      if (!isMounted) return;
      toast.error("Não foi possível concluir o login");
      navigate("/", { replace: true });
    }, 10000);

    return () => {
      isMounted = false;
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
