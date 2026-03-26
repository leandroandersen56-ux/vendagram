import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthModal() {
  const { showAuthModal, closeAuth, login, authRedirect } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      id: "u-demo",
      name: name || email.split("@")[0],
      email,
    });
    if (authRedirect) navigate(authRedirect);
    resetForm();
  };

  const handleGoogle = () => {
    login({
      id: "u-google",
      name: "Usuário Google",
      email: "user@gmail.com",
    });
    if (authRedirect) navigate(authRedirect);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
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
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={closeAuth} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-[700px] bg-card border border-border rounded-xl shadow-2xl z-10 overflow-hidden"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 text-muted-foreground z-20"
            onClick={closeAuth}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-4 text-sm font-bold tracking-wider transition-colors ${
                mode === "login"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ENTRAR
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-4 text-sm font-bold tracking-wider transition-colors ${
                mode === "register"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              CADASTRE-SE
            </button>
          </div>

          {/* Two-column body */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
            {/* Left: Form */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-display text-sm font-bold tracking-wider text-foreground">
                  SAFETRADE<span className="text-secondary">.GG</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {mode === "login"
                  ? "Bem-vindo de volta! Insira seus dados"
                  : "Crie sua conta e comece a negociar"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nome</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      className="bg-muted/30 border-border h-11"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">E-mail</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-muted/30 border-border h-11"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Senha</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-muted/30 border-border h-11 pr-10"
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

                <Button variant="hero" type="submit" className="w-full h-11">
                  {mode === "login" ? "Entrar" : "Criar Conta"}
                </Button>
              </form>
            </div>

            {/* Right: Social login */}
            <div className="p-6 sm:p-8 bg-muted/20 border-l border-border flex flex-col items-center justify-center gap-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">ou</span>

              <Button
                variant="outline"
                className="w-full h-11 border-border bg-card hover:bg-muted/50"
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

              <Button
                variant="outline"
                className="w-full h-11 border-border bg-card hover:bg-muted/50"
                disabled
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.49a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.76 1.52V6.94a4.85 4.85 0 0 1-1-.25z"/>
                </svg>
                Entrar com TikTok
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
