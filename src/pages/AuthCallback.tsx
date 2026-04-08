import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    const finishOAuth = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const errorMessage = searchParams.get("error_description") || hashParams.get("error_description");

      if (errorMessage) {
        toast.error(decodeURIComponent(errorMessage));
        navigate("/", { replace: true });
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        toast.error("Erro ao finalizar login com Google");
        navigate("/", { replace: true });
        return;
      }

      if (data.session && isActive) {
        navigate("/", { replace: true });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isActive) return;

      if (event === "SIGNED_IN" && session) {
        navigate("/", { replace: true });
      }

      if (event === "SIGNED_OUT") {
        navigate("/", { replace: true });
      }
    });

    void finishOAuth();

    const timeout = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/", { replace: true });
        return;
      }
      toast.error("Não foi possível concluir o login com Google");
      navigate("/", { replace: true });
    }, 5000);

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
