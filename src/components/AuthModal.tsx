import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Shield, ShoppingCart, Tag } from "lucide-react";
import logoFroiv from "@/assets/logo-froiv.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export default function AuthModal() {
  const { showAuthModal, closeAuth, login, authRedirect, authRole } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"buyer" | "seller" | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showAuthModal) return;
    setSelectedRole(authRole || null);
    if (authRole) setMode("register");
  }, [showAuthModal, authRole]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || email.split("@")[0], role: selectedRole || "buyer" },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (authRedirect) navigate(authRedirect);
      }
      closeAuth();
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setSelectedRole(authRole || null);
  };

  if (!showAuthModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={closeAuth} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-[420px] bg-background border border-border rounded-2xl shadow-2xl z-10 overflow-hidden"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 text-muted-foreground z-20"
            onClick={closeAuth}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Header with role selector */}
          <div className="flex flex-col items-center gap-2 pt-6">
            <img src={logoFroiv} alt="Froiv" className="h-8" />
          </div>

          {/* Tabs as pills */}
          <div className="px-6 mt-4">
            <div className="flex rounded-full bg-muted p-1">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
                  mode === "login"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
                  mode === "register"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Cadastrar
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <p className="text-sm text-muted-foreground mb-5 text-center">
              {mode === "login"
                ? "Bem-vindo de volta! Insira seus dados"
                : "Escolha seu perfil e crie sua conta para começar"}
            </p>

            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setSelectedRole("buyer")}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    selectedRole === "buyer"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-muted/40 hover:bg-muted"
                  }`}
                >
                  <ShoppingCart className="h-5 w-5 text-primary mb-2" />
                  <p className="text-sm font-semibold text-foreground">Comprador</p>
                  <p className="text-xs text-muted-foreground">Comprar contas com segurança</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("seller")}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    selectedRole === "seller"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-muted/40 hover:bg-muted"
                  }`}
                >
                  <Tag className="h-5 w-5 text-primary mb-2" />
                  <p className="text-sm font-semibold text-foreground">Vendedor</p>
                  <p className="text-xs text-muted-foreground">Anunciar e vender suas contas</p>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="bg-muted border-border h-11 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">E-mail</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-muted border-border h-11 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-muted border-border h-11 pr-10 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {mode === "login" && (
                <button type="button" className="text-xs text-primary hover:underline">
                  Esqueceu sua senha?
                </button>
              )}

              <Button variant="hero" type="submit" className="w-full h-11" disabled={loading || (mode === "register" && !selectedRole)}>
                {loading ? "Aguarde..." : mode === "login" ? "Entrar" : `Criar Conta${selectedRole === "seller" ? " como Vendedor" : selectedRole === "buyer" ? " como Comprador" : ""}`}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground">ou</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-11 border-border rounded-xl"
              onClick={handleGoogle}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar com Google
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
