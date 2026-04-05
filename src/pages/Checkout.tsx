import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Shield, Lock, QrCode, CreditCard,
  CheckCircle2, Loader2, ShoppingCart, Receipt, AlertCircle, Copy, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlatformIcon from "@/components/PlatformIcon";
import { formatBRL, getPlatform } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import amexIcon from "@/assets/amex-icon.svg";
import eloIcon from "@/assets/elo-icon.png";
import hipercardIcon from "@/assets/hipercard-icon.svg";

function PaymentBadge({ type }: { type: "pix" | "visa" | "mastercard" | "amex" | "elo" | "hipercard" }) {
  const h = 16;
  const iconFilter = "brightness(0) saturate(100%) invert(33%) sepia(93%) saturate(1752%) hue-rotate(213deg) brightness(97%) contrast(91%)";
  const icons: Record<string, React.ReactNode> = {
    pix: (
      <svg width={h} height={h} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156"/>
      </svg>
    ),
    visa: (
      <svg width={h * 1.5} height={h} viewBox="0 0 24 15" fill="currentColor">
        <path d="M9.112 1.262L5.97 8.758H3.92L2.374 2.775c-.094-.368-.175-.503-.461-.658C1.447 1.864.677 1.627 0 1.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"/>
      </svg>
    ),
    mastercard: (
      <svg width={h * 1.2} height={h * 1.2} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.343 18.031c.058.049.12.098.181.146-1.177.783-2.59 1.238-4.107 1.238C3.32 19.416 0 16.096 0 12c0-4.095 3.32-7.416 7.416-7.416 1.518 0 2.931.456 4.105 1.238-.06.051-.12.098-.165.15C9.6 7.489 8.595 9.688 8.595 12c0 2.311 1.001 4.51 2.748 6.031zm5.241-13.447c-1.52 0-2.931.456-4.105 1.238.06.051.12.098.165.15C14.4 7.489 15.405 9.688 15.405 12c0 2.31-1.001 4.507-2.748 6.031-.058.049-.12.098-.181.146 1.177.783 2.588 1.238 4.107 1.238C20.68 19.416 24 16.096 24 12c0-4.094-3.32-7.416-7.416-7.416zM12 6.174c-.096.075-.189.15-.28.231C10.156 7.764 9.169 9.765 9.169 12c0 2.236.987 4.236 2.551 5.595.09.08.185.158.28.232.096-.074.189-.152.28-.232 1.563-1.359 2.551-3.359 2.551-5.595 0-2.235-.987-4.236-2.551-5.595-.09-.08-.184-.156-.28-.231z"/>
      </svg>
    ),
    amex: <img src={amexIcon} alt="Amex" className="h-3.5 w-auto" style={{ filter: iconFilter }} />,
    elo: <img src={eloIcon} alt="Elo" className="h-3.5 w-auto" style={{ filter: iconFilter }} />,
    hipercard: <img src={hipercardIcon} alt="Hipercard" className="h-3.5 w-auto" style={{ filter: iconFilter }} />,
  };
  return <span className="text-primary flex items-center justify-center min-w-[36px] h-6 px-1 rounded border border-border bg-muted/50">{icons[type]}</span>;
}

const PAYMENT_METHODS = [
  { id: "pix", label: "Pix", icon: <QrCode className="h-5 w-5" />, description: "Aprovação instantânea" },
  { id: "card", label: "Cartão de crédito", icon: <CreditCard className="h-5 w-5" />, description: "Parcelamento em até 12x" },
];

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export default function Checkout() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [listing, setListing] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("pix");

  // Pix state
  const [pixData, setPixData] = useState<{
    qr_code: string | null;
    qr_code_base64: string | null;
    payment_id: number | null;
    expiration_date: string | null;
  } | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("idle");
  const [copied, setCopied] = useState(false);

  // Card state
  const [mpPublicKey, setMpPublicKey] = useState<string | null>(null);
  const [mpReady, setMpReady] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [installments, setInstallments] = useState("1");

  // Form fields
  const [nome, setNome] = useState(user?.name?.split(" ")[0] || "");
  const [sobrenome, setSobrenome] = useState(user?.name?.split(" ").slice(1).join(" ") || "");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [telefone, setTelefone] = useState("");
  const [promoCode, setPromoCode] = useState("");

  // Load MP public key and SDK
  useEffect(() => {
    async function loadMPKey() {
      try {
        const { data } = await supabase.functions.invoke("mercadopago-public-key");
        if (data?.public_key) {
          setMpPublicKey(data.public_key);
          // Load MercadoPago.js SDK
          if (!document.getElementById("mp-sdk")) {
            const script = document.createElement("script");
            script.id = "mp-sdk";
            script.src = "https://sdk.mercadopago.com/js/v2";
            script.onload = () => setMpReady(true);
            document.head.appendChild(script);
          } else if (window.MercadoPago) {
            setMpReady(true);
          }
        }
      } catch (e) {
        console.error("Failed to load MP public key:", e);
      }
    }
    loadMPKey();
  }, []);

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
      const { data: profile } = await (supabase
        .from("public_profiles" as any)
        .select("*")
        .eq("user_id", data.seller_id)
        .single() as any);
      if (profile) setSeller(profile);
      setLoading(false);
    }
    fetchData();
  }, [listingId]);

  // Poll payment status
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

  const createTransaction = async () => {
    if (!listing || !user) return null;
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
      return null;
    }
    return tx;
  };

  const handlePixCheckout = async () => {
    setSubmitting(true);
    const tx = await createTransaction();
    if (!tx) { setSubmitting(false); return; }
    setTransactionId(tx.id);

    try {
      const response = await supabase.functions.invoke("create-pix-payment", {
        body: {
          transaction_id: tx.id,
          payer_email: email,
          payer_cpf: cpf,
          payer_first_name: nome,
          payer_last_name: sobrenome,
        },
      });
      if (response.error) throw new Error(response.error.message);
      const data = response.data;
      if (data.error) throw new Error(data.details || data.error);
      setPixData({
        qr_code: data.qr_code,
        qr_code_base64: data.qr_code_base64,
        payment_id: data.payment_id,
        expiration_date: data.expiration_date,
      });
      setPaymentStatus("pending");
      toast({ title: "Pix gerado!", description: "Escaneie o QR Code ou copie o código para pagar." });
    } catch (err: any) {
      console.error("Pix error:", err);
      toast({ title: "Erro ao gerar Pix", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleCardCheckout = async () => {
    if (!mpPublicKey || !mpReady || !window.MercadoPago) {
      toast({ title: "SDK do Mercado Pago não carregou", variant: "destructive" });
      return;
    }
    if (!cardNumber || !cardExpMonth || !cardExpYear || !cardCvc || !cardHolder) {
      toast({ title: "Preencha todos os dados do cartão", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const mp = new window.MercadoPago(mpPublicKey);

      // Create card token
      const cardTokenResult = await mp.createCardToken({
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardholderName: cardHolder,
        cardExpirationMonth: cardExpMonth,
        cardExpirationYear: cardExpYear.length === 2 ? `20${cardExpYear}` : cardExpYear,
        securityCode: cardCvc,
        identificationType: "CPF",
        identificationNumber: cpf.replace(/\D/g, ""),
      });

      if (!cardTokenResult?.id) {
        throw new Error("Falha ao tokenizar cartão. Verifique os dados.");
      }

      // Detect payment method from card number
      const bin = cardNumber.replace(/\s/g, "").slice(0, 6);
      let paymentMethodId = "visa"; // default
      try {
        const pmResponse = await fetch(
          `https://api.mercadopago.com/v1/payment_methods/search?public_key=${mpPublicKey}&bin=${bin}`
        );
        const pmData = await pmResponse.json();
        if (pmData.results?.[0]?.id) {
          paymentMethodId = pmData.results[0].id;
        }
      } catch (e) {
        console.warn("Could not detect payment method, using default");
      }

      // Create transaction
      const tx = await createTransaction();
      if (!tx) { setSubmitting(false); return; }
      setTransactionId(tx.id);

      // Process card payment
      const response = await supabase.functions.invoke("create-card-payment", {
        body: {
          transaction_id: tx.id,
          token: cardTokenResult.id,
          installments: parseInt(installments),
          payment_method_id: paymentMethodId,
          payer_email: email,
          payer_cpf: cpf,
          payer_first_name: nome,
          payer_last_name: sobrenome,
        },
      });

      if (response.error) throw new Error(response.error.message);
      const data = response.data;
      if (data.error) throw new Error(data.details || data.error);

      if (data.status === "approved") {
        setPaymentStatus("approved");
        toast({ title: "Pagamento aprovado! ✅" });
        setTimeout(() => navigate(`/transaction/${listing?.id}`), 2000);
      } else if (data.status === "in_process") {
        setPaymentStatus("pending");
        toast({ title: "Pagamento em análise", description: "Acompanhe o status na página da transação." });
      } else {
        throw new Error(`Pagamento ${data.status_detail || data.status}: tente outro cartão.`);
      }
    } catch (err: any) {
      console.error("Card error:", err);
      toast({ title: "Erro no pagamento", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleCheckout = () => {
    if (!listing || !user) return;
    if (!nome || !email || !cpf) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    if (paymentMethod === "pix") {
      handlePixCheckout();
    } else {
      handleCardCheckout();
    }
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

  const installmentOptions = [];
  for (let i = 1; i <= 12; i++) {
    const value = total / i;
    installmentOptions.push({ value: String(i), label: i === 1 ? `1x de ${formatBRL(value)} (sem juros)` : `${i}x de ${formatBRL(value)}` });
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 sm:pt-24 pb-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Link to="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
            <span>/</span>
            <Link to={`/listing/${listing.id}`} className="hover:text-foreground transition-colors">Anúncio</Link>
            <span>/</span>
            <span className="text-foreground">Checkout</span>
          </div>

          {/* Mobile: product summary bar */}
          <div className="lg:hidden mb-4 flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-xl">
            <div
              className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: platform ? `${platform.color}15` : "hsl(var(--muted))" }}
            >
              <PlatformIcon platformId={listing.category} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground line-clamp-1">{listing.title}</p>
              <p className="text-sm font-semibold text-foreground">{formatBRL(total)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              {pixData && paymentStatus === "pending" ? (
                <PixPaymentView pixData={pixData} onCopy={handleCopyPix} copied={copied} />
              ) : paymentStatus === "approved" ? (
                <PaymentConfirmed />
              ) : (
                <>
                  {/* Payment method selection */}
                  <div>
                    <h1 className="text-xl font-semibold text-foreground mb-1 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full" />
                      Forma de pagamento
                    </h1>
                    <div className="space-y-2 mt-4">
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                            paymentMethod === method.id
                              ? "border-primary bg-primary/5"
                              : "border-border bg-card hover:border-primary/30"
                          }`}
                        >
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            paymentMethod === method.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                            {method.icon}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{method.label}</p>
                            <p className="text-xs text-muted-foreground">{method.description}</p>
                          </div>
                          {paymentMethod === method.id && <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment info */}
                  {paymentMethod === "pix" && (
                    <div className="bg-card border border-border rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <QrCode className="h-5 w-5 text-primary" />
                        <p className="font-medium text-foreground text-sm">Pix via Mercado Pago</p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Ao finalizar, um QR Code será gerado para pagamento instantâneo. O valor fica retido em escrow até a conclusão da transação.
                      </p>
                      <div className="flex items-center gap-2">
                        <PaymentBadge type="pix" />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <p className="font-medium text-foreground text-sm">Dados do cartão</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <PaymentBadge type="visa" />
                          <PaymentBadge type="mastercard" />
                          <PaymentBadge type="amex" />
                          <PaymentBadge type="elo" />
                          <PaymentBadge type="hipercard" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-foreground text-xs">Número do cartão <span className="text-primary">*</span></Label>
                          <Input
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/[^\d\s]/g, "").slice(0, 19))}
                            placeholder="0000 0000 0000 0000"
                            className="bg-muted/30 border-border font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-foreground text-xs">Nome no cartão <span className="text-primary">*</span></Label>
                          <Input
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                            placeholder="NOME COMO NO CARTÃO"
                            className="bg-muted/30 border-border"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-foreground text-xs">Mês <span className="text-primary">*</span></Label>
                            <Input
                              value={cardExpMonth}
                              onChange={(e) => setCardExpMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                              placeholder="MM"
                              className="bg-muted/30 border-border font-mono"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-foreground text-xs">Ano <span className="text-primary">*</span></Label>
                            <Input
                              value={cardExpYear}
                              onChange={(e) => setCardExpYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                              placeholder="AAAA"
                              className="bg-muted/30 border-border font-mono"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-foreground text-xs">CVV <span className="text-primary">*</span></Label>
                            <Input
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                              placeholder="123"
                              type="password"
                              className="bg-muted/30 border-border font-mono"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-foreground text-xs">Parcelas</Label>
                          <Select value={installments} onValueChange={setInstallments}>
                            <SelectTrigger className="bg-muted/30 border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {installmentOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Promo code */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Receipt className="h-4 w-4" />
                      <span className="text-sm">Insira o código promo</span>
                    </div>
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="max-w-[200px] bg-card border-border h-9 text-sm"
                    />
                    <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                      Aplicar Desconto
                    </Button>
                  </div>

                  {/* Personal info */}
                  <div>
                    <h2 className="font-semibold text-foreground text-sm mb-4">Precisamos de informações adicionais</h2>
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
                <h3 className="font-semibold text-foreground text-sm mb-4">Resumo do Pedido</h3>
                <div className="flex gap-3 mb-5 pb-5 border-b border-border">
                  <div
                    className="h-16 w-16 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: platform ? `${platform.color}15` : "hsl(var(--muted))" }}
                  >
                    <PlatformIcon platformId={listing.category} size={32} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{listing.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatBRL(total)}</p>
                    <p className="text-xs text-muted-foreground">Quantity: 1</p>
                  </div>
                </div>
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">{formatBRL(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxa (10%)</span>
                    <span className="text-muted-foreground text-xs">incluída</span>
                  </div>
                  {paymentMethod === "card" && parseInt(installments) > 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Parcelas</span>
                      <span className="text-foreground text-xs">{installments}x de {formatBRL(total / parseInt(installments))}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-primary">Total</span>
                      <span className="font-semibold text-primary text-lg">{formatBRL(total)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mb-4">
                  Ao final da compra você concorda com os{" "}
                  <span className="text-primary underline cursor-pointer">Termos e Condições</span>
                </p>
                {paymentStatus === "idle" && (
                  <Button variant="hero" className="w-full py-5 text-sm font-semibold" onClick={handleCheckout} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
                    {submitting ? "Processando..." : paymentMethod === "pix" ? "Gerar Pix" : "Pagar com Cartão"}
                  </Button>
                )}
                {paymentStatus === "pending" && (
                  <div className="text-center py-2">
                    <p className="text-xs text-primary font-medium flex items-center justify-center gap-1"><Clock className="h-3 w-3" /> Aguardando pagamento</p>
                  </div>
                )}
                {paymentStatus === "approved" && (
                  <div className="text-center py-2">
                    <p className="text-xs text-success font-medium flex items-center justify-center gap-1"><CheckCircle2 className="h-3 w-3" /> Pagamento confirmado</p>
                  </div>
                )}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Shield className="h-3 w-3 text-primary" /> Escrow</span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Lock className="h-3 w-3 text-primary" /> SSL</span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><CheckCircle2 className="h-3 w-3 text-primary" /> Garantia</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="hidden lg:block"><Footer /></div>

      {/* Mobile sticky buy bar */}
      {paymentStatus === "idle" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border lg:hidden safe-area-bottom">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="text-lg font-semibold text-foreground">{formatBRL(total)}</p>
            </div>
            <Button variant="hero" className="px-6 py-4 text-sm font-semibold" onClick={handleCheckout} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <ShoppingCart className="h-4 w-4 mr-1.5" />}
              {submitting ? "..." : paymentMethod === "pix" ? "Gerar Pix" : "Pagar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components
function PixPaymentView({ pixData, onCopy, copied }: { pixData: any; onCopy: () => void; copied: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <QrCode className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Pague com Pix</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Escaneie o QR Code ou copie o código para pagar</p>
        {pixData.qr_code_base64 && (
          <div className="inline-block p-4 bg-white rounded-xl mb-6">
            <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code Pix" className="w-52 h-52 mx-auto" />
          </div>
        )}
        {pixData.qr_code && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-medium">Pix Copia e Cola</p>
            <div className="flex items-center gap-2 max-w-lg mx-auto">
              <div className="flex-1 bg-muted/30 border border-border rounded-lg p-3 text-left">
                <p className="text-xs text-muted-foreground font-mono break-all line-clamp-2">{pixData.qr_code}</p>
              </div>
              <Button variant={copied ? "default" : "outline"} size="sm" onClick={onCopy} className="shrink-0">
                {copied ? <><CheckCircle2 className="h-4 w-4 mr-1" /> Copiado</> : <><Copy className="h-4 w-4 mr-1" /> Copiar</>}
              </Button>
            </div>
          </div>
        )}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Aguardando pagamento...</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          <Clock className="h-3 w-3 inline mr-1" />O código Pix expira em 30 minutos
        </p>
      </div>
    </motion.div>
  );
}

function PaymentConfirmed() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-success/30 rounded-lg p-8 text-center">
      <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-foreground mb-2">Pagamento Confirmado!</h2>
      <p className="text-sm text-muted-foreground">Redirecionando para acompanhar a transação...</p>
      <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto mt-4" />
    </motion.div>
  );
}
