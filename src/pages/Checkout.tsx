import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Shield, Lock, QrCode,
  CheckCircle2, Loader2, ShoppingCart, Receipt, AlertCircle, Copy, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlatformIcon from "@/components/PlatformIcon";
import { formatBRL, getPlatform } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [listing, setListing] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Pix payment state
  const [pixData, setPixData] = useState<{
    qr_code: string | null;
    qr_code_base64: string | null;
    payment_id: number | null;
    expiration_date: string | null;
  } | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("idle");
  const [copied, setCopied] = useState(false);

  // Form fields
  const [nome, setNome] = useState(user?.name?.split(" ")[0] || "");
  const [sobrenome, setSobrenome] = useState(user?.name?.split(" ").slice(1).join(" ") || "");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [telefone, setTelefone] = useState("");
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!listingId) return;
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (error || !data) { setLoading(false); return; }
      setListing(data);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", data.seller_id)
        .single();
      if (profile) setSeller(profile);
      setLoading(false);
    }
    fetchData();
  }, [listingId]);

  // Poll payment status after Pix is generated
  useEffect(() => {
    if (!transactionId || paymentStatus === "approved") return;

    const interval = setInterval(async () => {
      const { data: tx } = await supabase
        .from("transactions")
        .select("status")
        .eq("id", transactionId)
        .single();

      if (tx && tx.status === "paid") {
        setPaymentStatus("approved");
        toast({ title: "Pagamento confirmado! ✅", description: "Redirecionando para a transação..." });
        clearInterval(interval);
        setTimeout(() => navigate(`/transaction/${listing?.id}`), 2000);
      } else if (tx && tx.status === "cancelled") {
        setPaymentStatus("cancelled");
        toast({ title: "Pagamento cancelado", variant: "destructive" });
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [transactionId, paymentStatus, navigate, listing, toast]);

  const platformFee = listing ? Number(listing.price) * 0.10 : 0;
  const total = listing ? Number(listing.price) : 0;
  const platform = listing ? getPlatform(listing.category) : null;

  const handleCopyPix = async () => {
    if (!pixData?.qr_code) return;
    await navigator.clipboard.writeText(pixData.qr_code);
    setCopied(true);
    toast({ title: "Código Pix copiado!" });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCheckout = async () => {
    if (!listing || !user) return;
    if (!nome || !email || !cpf) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    // Create transaction
    const { data: tx, error } = await supabase
      .from("transactions")
      .insert({
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        amount: total,
        platform_fee: platformFee,
        seller_receives: total - platformFee,
        status: "pending_payment",
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Erro ao criar transação", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    setTransactionId(tx.id);

    // Create Pix payment via edge function
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await supabase.functions.invoke("create-pix-payment", {
        body: {
          transaction_id: tx.id,
          payer_email: email,
          payer_cpf: cpf,
          payer_first_name: nome,
          payer_last_name: sobrenome,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao criar pagamento");
      }

      const data = response.data;
      
      if (data.error) {
        throw new Error(data.details || data.error);
      }

      setPixData({
        qr_code: data.qr_code,
        qr_code_base64: data.qr_code_base64,
        payment_id: data.payment_id,
        expiration_date: data.expiration_date,
      });
      setPaymentStatus("pending");
      toast({ title: "Pix gerado!", description: "Escaneie o QR Code ou copie o código para pagar." });

    } catch (err: any) {
      console.error("Payment error:", err);
      toast({ title: "Erro ao gerar Pix", description: err.message, variant: "destructive" });
      // Cleanup: the transaction stays as pending_payment
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-4">Anúncio não encontrado</p>
            <Link to="/marketplace"><Button variant="hero">Voltar ao Marketplace</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Link to={`/listing/${listing.id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm">
            <ArrowLeft className="h-4 w-4" /> Voltar ao anúncio
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Payment form or Pix QR */}
            <div className="lg:col-span-2 space-y-6">
              {pixData && paymentStatus === "pending" ? (
                /* Pix Payment Screen */
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  <div className="bg-card border border-border rounded-lg p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <QrCode className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-bold text-foreground">Pague com Pix</h2>
                    </div>

                    <p className="text-sm text-muted-foreground mb-6">
                      Escaneie o QR Code abaixo ou copie o código Pix para pagar
                    </p>

                    {/* QR Code */}
                    {pixData.qr_code_base64 && (
                      <div className="inline-block p-4 bg-white rounded-xl mb-6">
                        <img
                          src={`data:image/png;base64,${pixData.qr_code_base64}`}
                          alt="QR Code Pix"
                          className="w-52 h-52 mx-auto"
                        />
                      </div>
                    )}

                    {/* Copia e cola */}
                    {pixData.qr_code && (
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground font-medium">Pix Copia e Cola</p>
                        <div className="flex items-center gap-2 max-w-lg mx-auto">
                          <div className="flex-1 bg-muted/30 border border-border rounded-lg p-3 text-left">
                            <p className="text-xs text-muted-foreground font-mono break-all line-clamp-2">
                              {pixData.qr_code}
                            </p>
                          </div>
                          <Button
                            variant={copied ? "default" : "outline"}
                            size="sm"
                            onClick={handleCopyPix}
                            className="shrink-0"
                          >
                            {copied ? (
                              <><CheckCircle2 className="h-4 w-4 mr-1" /> Copiado</>
                            ) : (
                              <><Copy className="h-4 w-4 mr-1" /> Copiar</>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Status indicator */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span>Aguardando pagamento...</span>
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-3">
                      <Clock className="h-3 w-3 inline mr-1" />
                      O código Pix expira em 30 minutos
                    </p>
                  </div>
                </motion.div>
              ) : paymentStatus === "approved" ? (
                /* Payment confirmed */
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-success/30 rounded-lg p-8 text-center">
                  <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-foreground mb-2">Pagamento Confirmado!</h2>
                  <p className="text-sm text-muted-foreground">Redirecionando para acompanhar a transação...</p>
                  <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto mt-4" />
                </motion.div>
              ) : (
                /* Payment form */
                <>
                  {/* Payment method - Pix only */}
                  <div>
                    <h1 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full" />
                      Forma de pagamento
                    </h1>

                    <div className="space-y-2 mt-4">
                      <div className="w-full flex items-center gap-4 p-4 rounded-lg border border-primary bg-primary/5 text-left">
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/20 text-primary">
                          <QrCode className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">Pix</p>
                          <p className="text-xs text-muted-foreground">Aprovação instantânea</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                      </div>
                    </div>
                  </div>

                  {/* Pix info */}
                  <div className="bg-card border border-border rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <QrCode className="h-5 w-5 text-primary" />
                      <p className="font-medium text-foreground text-sm">Pix via Mercado Pago</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ao finalizar, um QR Code será gerado para pagamento instantâneo. O valor fica retido em escrow até a conclusão da transação.
                    </p>
                  </div>

                  {/* Promo code */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Receipt className="h-4 w-4" />
                      <span className="text-sm">Insira o código promo</span>
                    </div>
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder=""
                      className="max-w-[200px] bg-card border-border h-9 text-sm"
                    />
                    <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                      Aplicar Desconto
                    </Button>
                  </div>

                  {/* Personal info */}
                  <div>
                    <h2 className="font-bold text-foreground text-sm mb-4">Precisamos de informações adicionais</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-foreground text-xs">Nome <span className="text-primary">*</span></Label>
                        <Input value={nome} onChange={(e) => setNome(e.target.value)} className="bg-card border-border" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-foreground text-xs">Sobrenome</Label>
                        <Input value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} className="bg-card border-border" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-foreground text-xs">CPF <span className="text-primary">*</span></Label>
                        <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" className="bg-card border-border" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-foreground text-xs">Endereço de e-mail <span className="text-primary">*</span></Label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="bg-card border-border" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-foreground text-xs">Telefone</Label>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-3 h-10 text-sm text-muted-foreground shrink-0">
                            🇧🇷 +55
                          </div>
                          <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className="bg-card border-border" />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Neste número, você receberá seus códigos pelo WhatsApp</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right: Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-5 sticky top-24">
                <h3 className="font-bold text-foreground text-sm mb-4">Resumo do Pedido</h3>

                {/* Item */}
                <div className="flex gap-3 mb-5 pb-5 border-b border-border">
                  <div
                    className="h-16 w-16 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: platform ? `${platform.color}15` : "hsl(var(--muted))" }}
                  >
                    <PlatformIcon platformId={listing.category} size={32} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{listing.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatBRL(total)} ({listing.title})
                    </p>
                    <p className="text-xs text-muted-foreground">Quantity: 1</p>
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal do Carrinho</span>
                    <span className="font-medium text-foreground">{formatBRL(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxa da plataforma (10%)</span>
                    <span className="text-muted-foreground text-xs">incluída</span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-primary">Total do Pedido</span>
                      <span className="font-bold text-primary text-lg">{formatBRL(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <p className="text-[10px] text-muted-foreground mb-4">
                  Ao final da compra você concorda com os{" "}
                  <span className="text-primary underline cursor-pointer">Termos e Condições</span>
                </p>

                {/* Buy button - only show if not yet paid */}
                {paymentStatus === "idle" && (
                  <Button
                    variant="hero"
                    className="w-full py-5 text-sm font-bold"
                    onClick={handleCheckout}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ShoppingCart className="h-4 w-4 mr-2" />
                    )}
                    {submitting ? "Gerando Pix..." : "Finalizar Compra"}
                  </Button>
                )}

                {paymentStatus === "pending" && (
                  <div className="text-center py-2">
                    <p className="text-xs text-primary font-medium">⏳ Aguardando pagamento Pix</p>
                  </div>
                )}

                {paymentStatus === "approved" && (
                  <div className="text-center py-2">
                    <p className="text-xs text-success font-medium">✅ Pagamento confirmado</p>
                  </div>
                )}

                {/* Security badges */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Shield className="h-3 w-3 text-primary" /> Escrow
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Lock className="h-3 w-3 text-primary" /> SSL
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-primary" /> Garantia
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
