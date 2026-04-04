import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    // Supabase handles the token exchange automatically via the client
    // Just show success and redirect
    const timer = setTimeout(() => {
      setStatus("success");
      setTimeout(() => navigate("/"), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-foreground font-medium">Verificando...</p>
          </>
        ) : (
          <>
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-xl font-semibold text-foreground mb-2">Email verificado com sucesso!</h1>
            <p className="text-muted-foreground text-sm">Redirecionando para a página inicial...</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
