import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ArrowRight, AlertTriangle, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
}

export default function TransferModal({ open, onClose, balance }: TransferModalProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setFoundUser(null);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .or(`email.ilike.%${query}%,username.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(1)
      .single();

    if (data) setFoundUser(data);
    else toast({ title: "Usuário não encontrado", variant: "destructive" });
    setSearching(false);
  };

  const handleTransfer = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast({ title: "Informe um valor válido", variant: "destructive" });
      return;
    }
    if (value > balance) {
      toast({ title: "Saldo insuficiente", variant: "destructive" });
      return;
    }
    if (!foundUser) return;

    setSubmitting(true);
    // In production this would be a server-side function
    toast({ title: "Transferência realizada!", description: `${formatBRL(value)} enviado para ${foundUser.name}` });
    setSubmitting(false);
    resetAndClose();
  };

  const resetAndClose = () => {
    setQuery("");
    setFoundUser(null);
    setAmount("");
    setDescription("");
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={resetAndClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl z-10"
        >
          <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-muted-foreground" onClick={resetAndClose}>
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Transferir Saldo</h2>
          </div>

          <div className="space-y-5">
            {/* Search */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Buscar usuário</p>
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Email, @username ou nome"
                  className="bg-muted/30 border-border h-10"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button variant="outline" size="icon" className="border-border shrink-0" onClick={handleSearch} disabled={searching}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Found user */}
            {foundUser && (
              <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{foundUser.name || "Usuário"}</p>
                  <div className="flex items-center gap-1">
                    {foundUser.username && (
                      <span className="text-xs text-muted-foreground">@{foundUser.username}</span>
                    )}
                    <span className="text-xs text-warning flex items-center gap-0.5">
                      {foundUser.avg_rating > 0 && <><Star className="h-3 w-3 fill-current" /> {foundUser.avg_rating}</>}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Amount */}
            {foundUser && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Valor</p>
                  <Input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="R$ 0,00"
                    className="bg-muted/30 border-border h-11"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Saldo disponível: {formatBRL(balance)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Descrição (opcional)</p>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Pagamento por serviço"
                    className="bg-muted/30 border-border h-10"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-xs text-muted-foreground">Transferências internas são irreversíveis</p>
                </div>

                <Button variant="hero" className="w-full h-11" onClick={handleTransfer} disabled={submitting}>
                  Transferir {amount ? formatBRL(Number(amount)) : ""}
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
