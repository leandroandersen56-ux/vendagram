import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Shield, Lock, CreditCard, QrCode,
  CheckCircle2, Loader2, ShoppingCart, Receipt, AlertCircle
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

const PAYMENT_METHODS = [
  { id: "pix", label: "Pix", icon: <QrCode className="h-5 w-5" />, description: "Aprovação instantânea" },
  { id: "card", label: "Crédito ou débito", icon: <CreditCard className="h-5 w-5" />, description: "Apenas para usuários logados", disabled: false },
];

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

  const platformFee = listing ? Number(listing.price) * 0.10 : 0;
  const total = listing ? Number(listing.price) : 0;
  const platform = listing ? getPlatform(listing.category) : null;

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

    // Redirect to transaction flow
    toast({ title: "Pedido criado!", description: "Efetue o pagamento para continuar." });
    navigate(`/transaction/${listing.id}`);
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
            <p className="text-4xl mb-4">😕</p>
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
            {/* Left: Payment form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment method selection */}
              <div>
                <h1 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  Forma de pagamento
                </h1>

                <div className="space-y-2 mt-4">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => !method.disabled && setPaymentMethod(method.id)}
                      disabled={method.disabled}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                        paymentMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/30"
                      } ${method.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
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
                      {paymentMethod === method.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pix info */}
              {paymentMethod === "pix" && (
                <div className="bg-card border border-border rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <QrCode className="h-5 w-5 text-primary" />
                    <p className="font-medium text-foreground text-sm">Pix</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ao finalizar o pedido, você verá o código para fazer o pagamento.
                  </p>
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

                {/* Buy button */}
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
                  Finalizar Compra
                </Button>

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
