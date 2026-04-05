
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Check, MessageCircle, AlertTriangle, CheckCircle2, Loader2, Shield, Clock } from "lucide-react";
import PageHeader from "@/components/menu/PageHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CredentialsPanel from "@/components/CredentialsPanel";
import TransactionChat from "@/components/TransactionChat";

const DISPUTE_REASONS = [
  "Credenciais incorretas",
  "Conta diferente do anúncio",
  "Não consegui acessar",
  "Conta banida/suspensa",
  "Outro",
];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(false);
  const [openingDispute, setOpeningDispute] = useState(false);

  // Transaction data
  const [transaction, setTransaction] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [credentials, setCredentials] = useState<any>(null);
  const [credentialsDeliveredAt, setCredentialsDeliveredAt] = useState<string | null>(null);

  // Dispute form
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");

  useEffect(() => {
    if (id) loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    setLoading(true);
    try {
      const { data: tx, error } = await supabase
        .from("transactions")
        .select("*, listings(*)")
        .eq("id", id)
        .single();

      if (error || !tx) {
        toast.error("Pedido não encontrado");
        navigate("/compras");
        return;
      }

      setTransaction(tx);
      setListing(tx.listings);

      // Load credentials
      try {
        const credRes = await supabase.functions.invoke("manage-credentials", {
          body: { transaction_id: id, action: "get" },
        });
        if (credRes.data?.credentials) {
          setCredentials(credRes.data.credentials);
          setCredentialsDeliveredAt(credRes.data.delivered_at);
        }
      } catch {}

    } catch {
      toast.error("Erro ao carregar pedido");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(label);
    toast.success("Copiado!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReleaseEscrow = async () => {
    if (!transaction) return;
    setReleasing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("release-escrow", {
        body: { transaction_id: transaction.id },
      });

      if (res.error) throw new Error(res.error.message);

      toast.success("Pagamento liberado ao vendedor!");
      setConfirmOpen(false);
      loadTransaction();
    } catch (err: any) {
      toast.error(err.message || "Erro ao liberar escrow");
    } finally {
      setReleasing(false);
    }
  };

  const handleOpenDispute = async () => {
    if (!transaction || disputeDescription.length < 20) {
      toast.error("Descreva o problema com pelo menos 20 caracteres");
      return;
    }
    setOpeningDispute(true);
    try {
      const fullDescription = `${disputeReason}: ${disputeDescription}`;
      const res = await supabase.functions.invoke("open-dispute", {
        body: {
          transaction_id: transaction.id,
          description: fullDescription,
        },
      });

      if (res.error) throw new Error(res.error.message);

      toast.success("Disputa aberta. Admin entrará em contato em até 24h.");
      setDisputeOpen(false);
      loadTransaction();
    } catch (err: any) {
      toast.error(err.message || "Erro ao abrir disputa");
    } finally {
      setOpeningDispute(false);
    }
  };

  const getSteps = () => {
    if (!transaction) return [];
    const steps = [
      { label: "Pedido realizado", time: formatDate(transaction.created_at), done: true },
      { label: "Pagamento confirmado", time: transaction.paid_at ? formatDate(transaction.paid_at) : null, done: !!transaction.paid_at },
      { label: "Verificando conta", time: null, done: ["transfer_in_progress", "completed"].includes(transaction.status) },
      { label: "Escrow liberado", time: transaction.completed_at ? formatDate(transaction.completed_at) : null, done: transaction.status === "completed" },
    ];
    if (transaction.status === "disputed") {
      steps.push({ label: "Disputa aberta", time: null, done: true });
    }
    return steps;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const canRelease = transaction && transaction.buyer_id === user?.id && ["paid", "transfer_in_progress"].includes(transaction.status);
  const canDispute = transaction && ["paid", "transfer_in_progress"].includes(transaction.status);
  const isCompleted = transaction?.status === "completed";
  const isDisputed = transaction?.status === "disputed";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pb-20">
        <PageHeader title="Carregando..." />
        <div className="flex items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const steps = getSteps();

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader title={`Pedido #${transaction?.id?.slice(0, 8) || id}`} />

      <div className="px-4 pt-4 space-y-4">
        {/* Completed banner */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-success/10 border border-success rounded-xl p-4 flex items-center gap-3"
          >
            <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
            <div>
              <p className="text-[14px] font-semibold text-success">Transação concluída</p>
              <p className="text-[12px] text-[#666]">
                Pagamento de R$ {Number(transaction.seller_receives).toFixed(2).replace(".", ",")} liberado ao vendedor.
              </p>
            </div>
          </motion.div>
        )}

        {/* Disputed banner */}
        {isDisputed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FF6900]/10 border border-[#FF6900] rounded-xl p-4 flex items-center gap-3"
          >
            <AlertTriangle className="h-6 w-6 text-[#FF6900] shrink-0" />
            <div>
              <p className="text-[14px] font-semibold text-[#FF6900]">Disputa em andamento</p>
              <p className="text-[12px] text-[#666]">Admin está analisando o caso. Aguarde até 24h.</p>
            </div>
          </motion.div>
        )}

        {/* Product info */}
        {listing && (
          <div className="bg-white rounded-xl border border-[#E8E8E8] p-4 flex gap-3">
            <img
              src={listing.screenshots?.[0] || "/placeholder.svg"}
              alt={listing.title}
              className="h-16 w-16 rounded-lg object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#111] truncate">{listing.title}</p>
              <p className="text-[12px] text-[#999] capitalize">{listing.category?.replace("_", " ")}</p>
              <p className="text-[16px] font-semibold text-primary mt-1">
                R$ {Number(transaction.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}

        {/* Status Timeline */}
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-5">
          <h3 className="text-sm font-semibold text-[#111] mb-4">Status do pedido</h3>
          <div className="relative">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3 relative">
                {i < steps.length - 1 && (
                  <div
                    className={`absolute left-[5px] top-3 w-0.5 h-full ${
                      step.done && steps[i + 1]?.done ? "bg-primary" : "bg-[#E8E8E8]"
                    }`}
                  />
                )}
                <div className="relative z-10 shrink-0">
                  {step.done ? (
                    <div className="h-3 w-3 rounded-full bg-primary" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border-2 border-[#DDD] bg-white" />
                  )}
                </div>
                <div className="pb-5 flex-1 -mt-0.5">
                  <p className={`text-[13px] font-medium ${step.done ? "text-[#111]" : "text-[#999]"}`}>
                    {step.label}
                  </p>
                  {step.time ? (
                    <p className="text-[11px] text-[#999]">{step.time}</p>
                  ) : !step.done ? (
                    <p className="text-[11px] text-[#CCC]">Pendente</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credentials Panel */}
        {transaction && (
          <CredentialsPanel
            transactionId={transaction.id}
            isSeller={transaction.seller_id === user?.id}
            transactionStatus={transaction.status}
            credentials={credentials}
            deliveredAt={credentialsDeliveredAt}
            onCredentialsSent={loadTransaction}
            orderId={transaction.id}
            orderCreatedAt={transaction.created_at}
            orderAmount={Number(transaction.amount)}
            listingTitle={listing?.title}
            listingPlatform={listing?.category}
          />
        )}

        {/* Transaction Chat */}
        {transaction && ["paid", "transfer_in_progress", "disputed"].includes(transaction.status) && (
          <TransactionChat transactionId={transaction.id} />
        )}

        <div className="space-y-2.5">
          {canRelease && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl text-[14px] font-semibold"
            >
              <CheckCircle2 className="h-5 w-5" /> Confirmar recebimento e liberar pagamento
            </button>
          )}
          {canDispute && (
            <button
              onClick={() => setDisputeOpen(true)}
              className="w-full flex items-center justify-center gap-2 border-2 border-destructive text-destructive py-3 rounded-xl text-[14px] font-semibold"
            >
              <AlertTriangle className="h-4 w-4" /> Abrir disputa
            </button>
          )}
          <button className="w-full flex items-center justify-center gap-2 border border-[#DDD] text-[#555] py-3 rounded-xl text-[14px] font-medium">
            <MessageCircle className="h-4 w-4" /> Falar com vendedor
          </button>
        </div>
      </div>

      {/* Confirm Release Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Confirmar recebimento</DialogTitle>
            <DialogDescription>
              Você confirma que recebeu e verificou a conta?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-[#FFF8E0] rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-[#FF6900] mt-0.5 shrink-0" />
            <p className="text-[12px] text-[#666]">
              Ao confirmar, o pagamento será liberado ao vendedor e a operação <strong>não poderá ser revertida</strong>.
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setConfirmOpen(false)}
              disabled={releasing}
              className="flex-1 py-2.5 rounded-xl border border-[#DDD] text-[#666] text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleReleaseEscrow}
              disabled={releasing}
              className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              {releasing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sim, confirmar"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
        <DialogContent className="max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Abrir Disputa</DialogTitle>
            <DialogDescription>
              Descreva o problema encontrado com a conta.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-[13px] font-semibold text-[#111] mb-2">Motivo</p>
              <div className="space-y-2">
                {DISPUTE_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      disputeReason === reason ? "border-primary bg-primary/5" : "border-[#E8E8E8]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={disputeReason === reason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      className="accent-primary"
                    />
                    <span className="text-[13px] text-[#333]">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#111] mb-2">Descreva o problema</p>
              <textarea
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                placeholder="Explique em detalhes o que aconteceu (mín. 20 caracteres)..."
                className="w-full h-24 p-3 border border-[#DDD] rounded-xl text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-[11px] text-[#999] mt-1">{disputeDescription.length}/500 caracteres</p>
            </div>

            <button
              onClick={handleOpenDispute}
              disabled={openingDispute || !disputeReason || disputeDescription.length < 20}
              className="w-full py-3 rounded-xl bg-destructive text-white text-[14px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {openingDispute ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <AlertTriangle className="h-4 w-4" /> Enviar disputa
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
