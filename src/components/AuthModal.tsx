import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Chrome, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthModal() {
  const { showAuthModal, closeAuth, login, authRedirect } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("register");
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
    if (authRedirect) {
      navigate(authRedirect);
    }
    resetForm();
  };

  const handleGoogle = () => {
    login({
      id: "u-google",
      name: "Usuário Google",
      email: "user@gmail.com",
    });
    if (authRedirect) {
      navigate(authRedirect);
    }
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
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={closeAuth} />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-2xl z-10"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-muted-foreground"
            onClick={closeAuth}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Shield className="h-7 w-7 text-primary" />
              <span className="font-display text-lg font-bold tracking-wider text-foreground">
                SAFETRADE<span className="text-secondary">.GG</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {mode === "login" ? "Entrar na sua conta" : "Criar sua conta"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login" ? "Acesse seu painel" : "Rápido e seguro"}
            </p>
          </div>

          {/* Google */}
          <Button
            variant="outline"
            className="w-full mb-4 h-11 border-border bg-muted/30 hover:bg-muted/50"
            onClick={handleGoogle}
          >
            <Chrome className="h-5 w-5 mr-2" />
            Continuar com Google
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label className="text-sm text-foreground">Nome</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="bg-muted/30 border-border h-11"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Email</Label>
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
              <Label className="text-sm text-foreground">Senha</Label>
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

            <Button variant="hero" type="submit" className="w-full h-11">
              {mode === "login" ? "Entrar" : "Criar Conta"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            {mode === "login" ? (
              <>Não tem conta? <button className="text-primary hover:underline" onClick={() => setMode("register")}>Criar conta</button></>
            ) : (
              <>Já tem conta? <button className="text-primary hover:underline" onClick={() => setMode("login")}>Entrar</button></>
            )}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
