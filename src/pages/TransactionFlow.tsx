import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, Circle, AlertTriangle, Clock,
  Shield, Upload, Send, Lock, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MOCK_LISTINGS, formatBRL, getPlatformSteps, getPlatform } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

type TxStatus = 'pending_payment' | 'credentials_pending' | 'transfer_in_progress' | 'completed';

const STATUS_CONFIG: Record<TxStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending_payment: { label: 'Aguardando Pagamento', color: 'text-warning', icon: <Clock className="h-5 w-5" /> },
  credentials_pending: { label: 'Aguardando Credenciais', color: 'text-info', icon: <Lock className="h-5 w-5" /> },
  transfer_in_progress: { label: 'Transferência em Progresso', color: 'text-primary', icon: <Shield className="h-5 w-5" /> },
  completed: { label: 'Concluída', color: 'text-success', icon: <CheckCircle2 className="h-5 w-5" /> },
};

export default function TransactionFlow() {
  const { listingId } = useParams();
  const { toast } = useToast();
  const listing = MOCK_LISTINGS.find((l) => l.id === listingId);
  const platform = listing ? getPlatform(listing.platform) : null;
  const steps = listing ? getPlatformSteps(listing.platform) : [];

  const [status, setStatus] = useState<TxStatus>('pending_payment');
  const [checkedSteps, setCheckedSteps] = useState<boolean[]>(new Array(steps.length).fill(false));
  const [problemStep, setProblemStep] = useState<number | null>(null);
  const [problemText, setProblemText] = useState("");
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24h in seconds

  const progress = checkedSteps.filter(Boolean).length / steps.length * 100;

  // Countdown timer
  useEffect(() => {
    if (status !== 'transfer_in_progress') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePayment = () => {
    setStatus('credentials_pending');
    toast({ title: "Pagamento confirmado!", description: "Aguardando o vendedor enviar as credenciais." });
  };

  const handleCredentialsDelivered = () => {
    setStatus('transfer_in_progress');
    toast({ title: "Credenciais recebidas!", description: "Siga o checklist para verificar a conta." });
  };

  const handleStepConfirm = (index: number) => {
    // Must confirm steps in order
    if (index > 0 && !checkedSteps[index - 1]) {
      toast({ title: "Complete o passo anterior primeiro", variant: "destructive" });
      return;
    }

    const updated = [...checkedSteps];
    updated[index] = true;
    setCheckedSteps(updated);

    // Last step = complete
    if (index === steps.length - 1) {
      setStatus('completed');
      toast({ title: "🎉 Transação concluída!", description: "O pagamento foi liberado ao vendedor." });
    }
  };

  const handleProblem = () => {
    toast({ title: "Disputa aberta", description: "Nossa equipe será notificada e analisará o caso." });
    setProblemStep(null);
    setProblemText("");
  };

  if (!listing || !platform) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <p className="text-4xl mb-4">😕</p>
          <p className="text-foreground font-medium mb-4">Transação não encontrada</p>
          <Link to="/marketplace"><Button variant="hero">Voltar ao Marketplace</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to={`/listing/${listing.id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Voltar ao anúncio
          </Link>

          {/* Header */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-xl font-bold text-foreground mb-1">Transação Segura</h1>
                <p className="text-sm text-muted-foreground">{listing.title}</p>
                <p className="text-lg font-display font-bold text-primary mt-2">{formatBRL(listing.price)}</p>
              </div>
              <div className="text-right">
                <Badge className={`${STATUS_CONFIG[status].color} bg-muted border-0 text-xs`}>
                  {STATUS_CONFIG[status].icon}
                  <span className="ml-1">{STATUS_CONFIG[status].label}</span>
                </Badge>
                {status === 'transfer_in_progress' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Tempo restante: <span className="text-warning font-mono">{formatTime(timeLeft)}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Transaction flow steps */}
          <div className="space-y-4">
            {/* Step 1: Payment */}
            <div className={`bg-card border rounded-lg p-6 transition-all ${status === 'pending_payment' ? 'border-warning glow-purple' : 'border-border'}`}>
              <div className="flex items-center gap-3 mb-4">
                {status !== 'pending_payment' ? (
                  <CheckCircle2 className="h-6 w-6 text-success" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-warning flex items-center justify-center">
                    <span className="text-xs font-bold text-warning">1</span>
                  </div>
                )}
                <h2 className="font-semibold text-foreground">Pagamento</h2>
              </div>
              {status === 'pending_payment' ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Efetue o pagamento para iniciar a transação. O valor ficará retido em escrow até a conclusão.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="hero" onClick={handlePayment}>
                      <Lock className="h-4 w-4 mr-2" />
                      Pagar {formatBRL(listing.price)}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-success">✓ Pagamento confirmado</p>
              )}
            </div>

            {/* Step 2: Credentials */}
            <div className={`bg-card border rounded-lg p-6 transition-all ${status === 'credentials_pending' ? 'border-info' : 'border-border'} ${status === 'pending_payment' ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3 mb-4">
                {['transfer_in_progress', 'completed'].includes(status) ? (
                  <CheckCircle2 className="h-6 w-6 text-success" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground">2</span>
                  </div>
                )}
                <h2 className="font-semibold text-foreground">Entrega de Credenciais</h2>
              </div>
              {status === 'credentials_pending' ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Aguardando o vendedor enviar as credenciais da conta.
                  </p>
                  {/* Demo: simulate seller delivering */}
                  <Button variant="accent" size="sm" onClick={handleCredentialsDelivered}>
                    <Send className="h-4 w-4 mr-2" />
                    Simular Entrega (demo)
                  </Button>
                </div>
              ) : ['transfer_in_progress', 'completed'].includes(status) ? (
                <p className="text-sm text-success">✓ Credenciais entregues</p>
              ) : (
                <p className="text-sm text-muted-foreground">Aguardando pagamento</p>
              )}
            </div>

            {/* Step 3: Transfer Checklist */}
            <div className={`bg-card border rounded-lg p-6 transition-all ${status === 'transfer_in_progress' ? 'border-primary' : 'border-border'} ${!['transfer_in_progress', 'completed'].includes(status) ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3 mb-4">
                {status === 'completed' ? (
                  <CheckCircle2 className="h-6 w-6 text-success" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground">3</span>
                  </div>
                )}
                <h2 className="font-semibold text-foreground">Checklist de Transferência</h2>
                {status === 'transfer_in_progress' && (
                  <Badge className="bg-primary/10 text-primary border-0 text-xs ml-auto">
                    {checkedSteps.filter(Boolean).length}/{steps.length}
                  </Badge>
                )}
              </div>

              {status === 'transfer_in_progress' && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2 mb-4" />

                  {steps.map((step, i) => {
                    const isChecked = checkedSteps[i];
                    const isNext = !isChecked && (i === 0 || checkedSteps[i - 1]);
                    const isLast = i === steps.length - 1;

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                          isChecked ? 'bg-success/5 border border-success/20' :
                          isNext ? 'bg-primary/5 border border-primary/20' :
                          'bg-muted/30 border border-transparent'
                        }`}
                      >
                        {isChecked ? (
                          <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                        ) : (
                          <Circle className={`h-5 w-5 mt-0.5 shrink-0 ${isNext ? 'text-primary' : 'text-muted-foreground'}`} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${isChecked ? 'text-success' : isNext ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {step}
                          </p>
                          {isChecked && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Confirmado há poucos segundos
                            </p>
                          )}
                        </div>
                        {isNext && !isChecked && (
                          <div className="flex gap-1.5 shrink-0">
                            <Button
                              size="sm"
                              variant={isLast ? "hero" : "default"}
                              onClick={() => handleStepConfirm(i)}
                              className="text-xs h-8"
                            >
                              {isLast ? '🔓 Confirmar' : '✓ Confirmar'}
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-xs h-8 text-destructive hover:text-destructive" onClick={() => setProblemStep(i)}>
                                  <AlertTriangle className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-card border-border">
                                <DialogHeader>
                                  <DialogTitle className="text-foreground">Reportar Problema</DialogTitle>
                                  <DialogDescription className="text-muted-foreground">
                                    Descreva o problema encontrado neste passo. Um moderador irá analisar.
                                  </DialogDescription>
                                </DialogHeader>
                                <Textarea
                                  placeholder="Descreva o que aconteceu..."
                                  value={problemText}
                                  onChange={(e) => setProblemText(e.target.value)}
                                  className="bg-muted border-border"
                                />
                                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/30 transition-colors">
                                  <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                                  <p className="text-xs text-muted-foreground">Anexar screenshot (opcional)</p>
                                </div>
                                <DialogFooter>
                                  <Button variant="destructive" onClick={handleProblem} disabled={!problemText}>
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Abrir Disputa
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {status === 'completed' && (
                <div className="text-center py-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Transação Concluída! 🎉</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Pagamento de {formatBRL(listing.price * 0.9)} liberado ao vendedor.
                    <br />Taxa da plataforma: {formatBRL(listing.price * 0.1)}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link to="/marketplace">
                      <Button variant="glass">Voltar ao Marketplace</Button>
                    </Link>
                  </div>
                </div>
              )}

              {!['transfer_in_progress', 'completed'].includes(status) && (
                <p className="text-sm text-muted-foreground">Aguardando etapas anteriores</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
