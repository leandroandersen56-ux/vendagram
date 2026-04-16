import { useState, useEffect, useRef } from "react";
import { Copy, Share2, Loader2, Link2, Users, TrendingUp, DollarSign, Gift, Crown, UserPlus, Upload, ImagePlus, X, CheckCircle2, Clock, XCircle, ShieldCheck, Zap } from "lucide-react";
import DesktopPageShell from "@/components/DesktopPageShell";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Referral {
  id: string;
  referred_seller_id: string;
  created_at: string;
  profile?: { name: string | null; avatar_url: string | null };
}

interface Commission {
  id: string;
  amount: number;
  created_at: string;
  transaction_id: string;
}

export default function Affiliates() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState({ total: 0, conversions: 0, earned: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambassador state
  const [ambassador, setAmbassador] = useState<{ id: string; code: string } | null>(null);
  const [ambReferrals, setAmbReferrals] = useState<Referral[]>([]);
  const [ambCommissions, setAmbCommissions] = useState<Commission[]>([]);
  const [ambTotalEarned, setAmbTotalEarned] = useState(0);
  const [application, setApplication] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Application form
  const [appName, setAppName] = useState("");
  const [appEmail, setAppEmail] = useState("");
  const [appWhatsapp, setAppWhatsapp] = useState("");
  const [appScreenshots, setAppScreenshots] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);

    const [{ data: prof }, { data: amb }, { data: app }, { data: referrals }] = await Promise.all([
      supabase.from("profiles").select("referral_code, name, email, phone").eq("user_id", user!.id).single(),
      supabase.from("ambassadors").select("id, code").eq("user_id", user!.id).maybeSingle(),
      supabase.from("ambassador_applications" as any).select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("referrals").select("*").eq("referrer_id", user!.id).order("created_at", { ascending: false }),
    ]);

    setProfile(prof);
    if (prof) {
      setReferralCode(prof.referral_code || "");
      setAppName(prof.name || "");
      setAppEmail(prof.email || "");
      setAppWhatsapp(prof.phone || "");
    }

    if (referrals) {
      const paid = referrals.filter((r: any) => r.status === "paid");
      setStats({
        total: referrals.length,
        conversions: paid.length,
        earned: paid.reduce((s: number, r: any) => s + Number(r.commission_amount || 0), 0),
      });
      setHistory(referrals.slice(0, 10));
    }

    setApplication(app);

    if (amb) {
      setAmbassador(amb);
      const { data: refs } = await supabase
        .from("ambassador_referrals")
        .select("id, referred_seller_id, created_at")
        .eq("ambassador_id", amb.id)
        .order("created_at", { ascending: false });

      if (refs && refs.length > 0) {
        const sellerIds = refs.map(r => r.referred_seller_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url")
          .in("user_id", sellerIds);
        setAmbReferrals(refs.map(r => ({ ...r, profile: profiles?.find(p => p.user_id === r.referred_seller_id) })));
      }

      const { data: comms } = await supabase
        .from("ambassador_commissions")
        .select("id, amount, created_at, transaction_id")
        .eq("ambassador_id", amb.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (comms) {
        setAmbCommissions(comms);
        setAmbTotalEarned(comms.reduce((s, c) => s + Number(c.amount), 0));
      }
    }

    setLoading(false);
  };

  const link = `froiv.com?ref=${referralCode}`;
  const ambassadorLink = ambassador ? `froiv.com?amb=${ambassador.code}` : "";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(`https://${text}`);
    toast.success("Link copiado!");
  };

  const handleShare = (text: string, title: string) => {
    if (navigator.share) {
      navigator.share({ title, text: "Cadastre-se na Froiv!", url: `https://${text}` });
    } else handleCopy(text);
  };

  const handleUploadScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user?.id) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} muito grande (máx 5MB)`); continue; }
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("ambassador-proofs").upload(path, file, { upsert: true });
      if (error) { toast.error(`Erro: ${file.name}`); continue; }
      const { data: urlData } = supabase.storage.from("ambassador-proofs").getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }
    setAppScreenshots(prev => [...prev, ...newUrls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const formatPhone = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const handleSubmitApplication = async () => {
    if (!appName.trim() || !appEmail.trim() || !appWhatsapp.trim()) { toast.error("Preencha todos os campos"); return; }
    if (appScreenshots.length === 0) { toast.error("Envie pelo menos 1 print"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("ambassador_applications" as any).insert({
      user_id: user!.id, name: appName.trim(), email: appEmail.trim(), whatsapp: appWhatsapp.trim(), screenshots: appScreenshots,
    });
    if (error) { toast.error("Erro ao enviar"); }
    else {
      toast.success("Solicitação enviada!");
      await supabase.from("notifications").insert({
        user_id: "b78c563a-41eb-4933-9b4d-b53e3cd62dfb",
        title: "📋 Nova solicitação de Embaixador",
        body: `${appName} (${appEmail}) quer ser embaixador. WhatsApp: ${appWhatsapp}`,
        link: "/trynda",
      });
      loadData();
    }
    setSubmitting(false);
  };

  return (
    <DesktopPageShell title="Indique & Ganhe">
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* ═══════════ AFFILIATE SECTION ═══════════ */}
            <div className="relative overflow-hidden rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #2D6FF0 0%, #1B4FBF 50%, #1340A0 100%)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                    <Gift className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xl font-bold text-white tracking-tight">Indique e Ganhe</p>
                </div>
                <p className="text-sm text-white/70 ml-[46px]">Compartilhe seu link e ganhe comissão sobre vendas de vendedores cadastrados por você</p>
                <div className="mt-5 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-2 border border-white/10">
                  <Link2 className="h-4 w-4 text-white/50 shrink-0" />
                  <p className="text-sm font-mono flex-1 truncate text-white/90">{link}</p>
                  <button onClick={() => handleCopy(link)} className="h-8 w-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                    <Copy className="h-4 w-4 text-white" />
                  </button>
                  <button onClick={() => handleShare(link, "Froiv")} className="h-8 w-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                    <Share2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Affiliate Metrics */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Indicações", value: String(stats.total), icon: Users, color: "#2D6FF0" },
                { label: "Conversões", value: String(stats.conversions), icon: TrendingUp, color: "#00A650" },
                { label: "Ganho total", value: `R$ ${stats.earned.toFixed(0)}`, icon: DollarSign, color: "#7C3AED" },
              ].map((m) => (
                <div key={m.label} className="bg-card rounded-xl border border-border p-3.5 text-center">
                  <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: `${m.color}12` }}>
                    <m.icon className="h-4 w-4" style={{ color: m.color }} />
                  </div>
                  <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Affiliate How it works */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Como funciona</h3>
              {[
                { text: "Copie e compartilhe seu link de afiliado", icon: Link2, color: "#2D6FF0" },
                { text: "Vendedores se cadastram pelo seu link", icon: Gift, color: "#7C3AED" },
                { text: "Você ganha 1,5% sobre cada venda que eles realizarem por 30 dias", icon: DollarSign, color: "#00A650" },
              ].map((step, i) => (
                <div key={i} className="flex gap-3 items-center mb-3 last:mb-0">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${step.color}12` }}>
                    <step.icon className="h-4 w-4" style={{ color: step.color }} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Passo {i + 1}</p>
                    <p className="text-[13px] text-foreground font-medium">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Affiliate History */}
            {history.length > 0 && (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <h3 className="text-sm font-semibold text-foreground px-5 pt-4 pb-2">Histórico de comissões</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-5 py-2.5 text-[11px] text-muted-foreground font-medium">Data</th>
                        <th className="text-right px-5 py-2.5 text-[11px] text-muted-foreground font-medium">Comissão</th>
                        <th className="text-right px-5 py-2.5 text-[11px] text-muted-foreground font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h: any) => (
                        <tr key={h.id} className="border-b border-border/50 last:border-b-0">
                          <td className="px-5 py-3 text-muted-foreground">{new Date(h.created_at).toLocaleDateString("pt-BR")}</td>
                          <td className="px-5 py-3 text-right text-success font-semibold">R$ {Number(h.commission_amount || 0).toFixed(2)}</td>
                          <td className="px-5 py-3 text-right">
                            <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${h.status === "paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                              {h.status === "paid" ? "Pago" : "Pendente"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═══════════ AMBASSADOR SECTION ═══════════ */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Programa Embaixador</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* If already ambassador — show dashboard */}
              {ambassador ? (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 50%, #4C1D95 100%)" }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                          <Crown className="h-5 w-5 text-yellow-300" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white tracking-tight">Embaixador Froiv</p>
                          <Badge className="bg-yellow-400/20 text-yellow-300 border-0 text-[10px]">3% comissão vitalícia</Badge>
                        </div>
                      </div>
                      <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-2 border border-white/10">
                        <Link2 className="h-4 w-4 text-white/50 shrink-0" />
                        <p className="text-sm font-mono flex-1 truncate text-white/90">{ambassadorLink}</p>
                        <button onClick={() => handleCopy(ambassadorLink)} className="h-8 w-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                          <Copy className="h-4 w-4 text-white" />
                        </button>
                        <button onClick={() => handleShare(ambassadorLink, "Froiv - Embaixador")} className="h-8 w-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                          <Share2 className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ambassador Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Vendedores", value: String(ambReferrals.length), icon: UserPlus, color: "#7C3AED" },
                      { label: "Comissões", value: String(ambCommissions.length), icon: TrendingUp, color: "#00A650" },
                      { label: "Total ganho", value: `R$ ${ambTotalEarned.toFixed(0)}`, icon: DollarSign, color: "#2D6FF0" },
                    ].map((m) => (
                      <div key={m.label} className="bg-card rounded-xl border border-border p-3.5 text-center">
                        <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: `${m.color}12` }}>
                          <m.icon className="h-4 w-4" style={{ color: m.color }} />
                        </div>
                        <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  {ambReferrals.length > 0 && (
                    <div className="bg-card rounded-xl border border-border p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Vendedores indicados</h3>
                      <div className="space-y-2.5">
                        {ambReferrals.map((r) => (
                          <div key={r.id} className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {r.profile?.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-foreground truncate">{r.profile?.name || "Vendedor"}</p>
                              <p className="text-[11px] text-muted-foreground">Desde {new Date(r.created_at).toLocaleDateString("pt-BR")}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {ambCommissions.length > 0 && (
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      <h3 className="text-sm font-semibold text-foreground px-5 pt-4 pb-2">Comissões de embaixador</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                          <thead><tr className="border-b border-border">
                            <th className="text-left px-5 py-2.5 text-[11px] text-muted-foreground font-medium">Data</th>
                            <th className="text-right px-5 py-2.5 text-[11px] text-muted-foreground font-medium">Comissão</th>
                          </tr></thead>
                          <tbody>
                            {ambCommissions.map((c) => (
                              <tr key={c.id} className="border-b border-border/50 last:border-b-0">
                                <td className="px-5 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString("pt-BR")}</td>
                                <td className="px-5 py-3 text-right text-success font-semibold">R$ {Number(c.amount).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Not ambassador — show CTA + application form */
                <div className="relative overflow-hidden rounded-2xl border border-border">
                  <div className="p-5 pb-0" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" }}>
                    <div className="text-center pb-5">
                      <Crown className="h-10 w-10 text-yellow-300 mx-auto mb-2" />
                      <h2 className="text-xl font-bold text-white mb-1">Torne-se Embaixador Froiv</h2>
                      <p className="text-white/80 text-[13px] max-w-xs mx-auto">
                        Ganhe <span className="text-yellow-300 font-bold">3% de comissão vitalícia</span> em cada venda dos vendedores que você indicar
                      </p>
                    </div>
                  </div>

                  <div className="bg-card p-5 space-y-4">
                    {/* Status */}
                    {application?.status === "pending" && (
                      <div className="flex items-center gap-3 bg-warning/10 text-warning rounded-xl px-4 py-3 border border-warning/20">
                        <Clock className="h-5 w-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Solicitação em análise</p>
                          <p className="text-[11px] opacity-80">Enviada em {new Date(application.created_at).toLocaleDateString("pt-BR")}. Entraremos em contato pelo WhatsApp.</p>
                        </div>
                      </div>
                    )}

                    {application?.status === "rejected" && (
                      <div className="flex items-center gap-3 bg-destructive/10 text-destructive rounded-xl px-4 py-3 border border-destructive/20">
                        <XCircle className="h-5 w-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Solicitação não aprovada</p>
                          <p className="text-[11px] opacity-80">{application.admin_notes || "Você pode enviar uma nova solicitação."}</p>
                        </div>
                      </div>
                    )}

                    {/* How it works */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3">Como funciona</h3>
                      {[
                        { text: "Comprove que é admin de grupos e tem vendas aprovadas", icon: ShieldCheck, color: "#7C3AED" },
                        { text: "Aprovamos e você recebe o link de embaixador", icon: CheckCircle2, color: "#2D6FF0" },
                        { text: "Ganhe 3% de cada venda dos vendedores indicados — para sempre", icon: DollarSign, color: "#00A650" },
                      ].map((step, i) => (
                        <div key={i} className="flex gap-3 items-center mb-3 last:mb-0">
                          <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${step.color}12` }}>
                            <step.icon className="h-4 w-4" style={{ color: step.color }} />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Passo {i + 1}</p>
                            <p className="text-[13px] text-foreground font-medium">{step.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Simulation */}
                    <div className="bg-muted/30 rounded-xl p-4 border border-border">
                      <h4 className="text-[13px] font-semibold text-foreground mb-2">💰 Simulação de ganhos</h4>
                      <div className="space-y-1.5 text-[13px]">
                        <div className="flex justify-between text-muted-foreground">
                          <span>5 vendedores × R$ 2.000/mês</span>
                          <span className="text-success font-bold">R$ 300/mês</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>10 vendedores × R$ 2.000/mês</span>
                          <span className="text-success font-bold">R$ 600/mês</span>
                        </div>
                      </div>
                    </div>

                    {/* Application Form */}
                    {application?.status !== "pending" && (
                      <div className="space-y-4 pt-2">
                        <div className="border-t border-border pt-4">
                          <h3 className="text-sm font-semibold text-foreground mb-1">Solicitar aprovação</h3>
                          <p className="text-[11px] text-muted-foreground mb-4">
                            Preencha seus dados reais e envie prints comprovando que é admin de grupos e tem vendas realizadas.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-[12px] text-muted-foreground">Nome completo *</Label>
                              <Input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="Seu nome real" className="bg-muted/30 border-border h-10" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[12px] text-muted-foreground">Email *</Label>
                              <Input value={appEmail} onChange={(e) => setAppEmail(e.target.value)} placeholder="email@exemplo.com" type="email" className="bg-muted/30 border-border h-10" />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                              <Label className="text-[12px] text-muted-foreground">WhatsApp *</Label>
                              <Input value={appWhatsapp} onChange={(e) => setAppWhatsapp(formatPhone(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} className="bg-muted/30 border-border h-10" />
                            </div>
                          </div>

                          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUploadScreenshot} />

                          <div className="mt-4 space-y-2">
                            <Label className="text-[12px] text-muted-foreground">
                              Prints de comprovação * <span className="text-[10px]">(admin de grupo + vendas aprovadas)</span>
                            </Label>
                            {appScreenshots.length > 0 && (
                              <div className="grid grid-cols-3 gap-2">
                                {appScreenshots.map((url, idx) => (
                                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted/20">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button onClick={() => setAppScreenshots(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 h-5 w-5 bg-black/60 rounded-full flex items-center justify-center">
                                      <X className="h-3 w-3 text-white" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full border-2 border-dashed border-border rounded-xl py-4 flex flex-col items-center gap-1.5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                              <span className="text-[12px] font-medium">{uploading ? "Enviando..." : "Adicionar prints"}</span>
                            </button>
                          </div>

                          <Button variant="hero" className="w-full mt-4" onClick={handleSubmitApplication} disabled={submitting || !appName.trim() || !appEmail.trim() || !appWhatsapp.trim() || appScreenshots.length === 0}>
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                            Enviar solicitação de Embaixador
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Commission breakdown - Affiliate */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">💰 Exemplo: Comissão de Afiliado</h3>
              <div className="text-[13px] text-muted-foreground space-y-1.5">
                <p>Vendedor indicado faz venda de <span className="text-foreground font-medium">R$ 100</span>:</p>
                <p>→ Vendedor recebe: R$ 90</p>
                <p>→ Froiv fica com: R$ 8,50</p>
                <p>→ Você (afiliado) ganha: <span className="text-success font-bold">R$ 1,50</span></p>
                <p className="text-[11px] mt-2 text-muted-foreground/70">A comissão sai da taxa da plataforma (10%). Válida por 30 dias após o cadastro do vendedor.</p>
              </div>
            </div>

            {/* Commission breakdown - Ambassador */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">👑 Exemplo: Comissão de Embaixador</h3>
              <div className="text-[13px] text-muted-foreground space-y-1.5">
                <p>Vendedor indicado faz venda de <span className="text-foreground font-medium">R$ 100</span>:</p>
                <p>→ Vendedor recebe: R$ 90</p>
                <p>→ Froiv fica com: R$ 7</p>
                <p>→ Embaixador ganha: <span className="text-success font-bold">R$ 3</span></p>
                <p className="text-[11px] mt-2 text-muted-foreground/70">Comissão vitalícia, sem expiração. O embaixador também não paga taxa nas próprias vendas (recebe 100%).</p>
              </div>
            </div>
          </>
        )}
      </div>
    </DesktopPageShell>
  );
}
