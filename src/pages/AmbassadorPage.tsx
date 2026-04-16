import { useState, useEffect, useRef } from "react";
import { Copy, Share2, Loader2, Link2, Users, TrendingUp, DollarSign, Crown, UserPlus, Zap, Upload, ImagePlus, X, CheckCircle2, Clock, XCircle, ShieldCheck, ArrowRight, Infinity, Banknote, BarChart3, Gift } from "lucide-react";
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

export default function AmbassadorPage() {
  const { user } = useAuth();
  const [ambassador, setAmbassador] = useState<{ id: string; code: string } | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);

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

    const [{ data: prof }, { data: amb }, { data: app }] = await Promise.all([
      supabase.from("profiles").select("referral_code, name, email, phone").eq("user_id", user!.id).single(),
      supabase.from("ambassadors").select("id, code").eq("user_id", user!.id).maybeSingle(),
      supabase.from("ambassador_applications" as any).select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    setProfile(prof);
    if (prof) {
      setAppName(prof.name || "");
      setAppEmail(prof.email || "");
      setAppWhatsapp(prof.phone || "");
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
        setReferrals(refs.map(r => ({ ...r, profile: profiles?.find(p => p.user_id === r.referred_seller_id) })));
      }

      const { data: comms } = await supabase
        .from("ambassador_commissions")
        .select("id, amount, created_at, transaction_id")
        .eq("ambassador_id", amb.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (comms) {
        setCommissions(comms);
        setTotalEarned(comms.reduce((s, c) => s + Number(c.amount), 0));
      }
    }

    setLoading(false);
  };

  const ambassadorLink = ambassador ? `froiv.com?amb=${ambassador.code}` : "";

  const handleCopyAmb = () => {
    navigator.clipboard.writeText(`https://${ambassadorLink}`);
    toast.success("Link copiado!");
  };

  const handleShareAmb = () => {
    if (navigator.share) {
      navigator.share({ title: "Froiv - Embaixador", text: "Cadastre-se na Froiv!", url: `https://${ambassadorLink}` });
    } else handleCopyAmb();
  };

  const handleUploadScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user?.id) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const url = await uploadImage(file, { maxSizeMB: 10 });
        newUrls.push(url);
      } catch (err: any) {
        toast.error(`Erro no upload: ${file.name}`, { description: err?.message });
      }
    }

    setAppScreenshots(prev => [...prev, ...newUrls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeScreenshot = (idx: number) => {
    setAppScreenshots(prev => prev.filter((_, i) => i !== idx));
  };

  const formatPhone = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const handleSubmitApplication = async () => {
    if (!appName.trim() || !appEmail.trim() || !appWhatsapp.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (appScreenshots.length === 0) {
      toast.error("Envie pelo menos 1 print de comprovação");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("ambassador_applications" as any).insert({
      user_id: user!.id,
      name: appName.trim(),
      email: appEmail.trim(),
      whatsapp: appWhatsapp.trim(),
      screenshots: appScreenshots,
    });

    if (error) {
      toast.error("Erro ao enviar solicitação");
    } else {
      toast.success("Solicitação enviada! Analisaremos em breve.");
      await supabase.from("notifications").insert({
        user_id: "b78c563a-41eb-4936-8747-5e939b5ef848",
        title: "📋 Nova solicitação de Embaixador",
        body: `${appName} (${appEmail}) quer se tornar embaixador. WhatsApp: ${appWhatsapp}`,
        link: "/trynda",
      });
      loadData();
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <DesktopPageShell title="Programa Embaixador">
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DesktopPageShell>
    );
  }

  return (
    <DesktopPageShell title="Programa Embaixador">
      <div className="space-y-4">

        {/* ===== HERO BANNER ===== */}
        <div className="relative overflow-hidden rounded-2xl bg-primary">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
          <div className="relative z-10 p-6 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-4">
              <Crown className="h-8 w-8 text-yellow-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Programa Embaixador Froiv</h1>
            <p className="text-white/80 text-base sm:text-lg max-w-md mx-auto">
              Ganhe dinheiro indicando vendedores
            </p>
          </div>
        </div>

        {/* ===== AMBASSADOR DASHBOARD (if approved) ===== */}
        {ambassador && (
          <>
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Seu Link de Embaixador</h3>
                  <Badge className="bg-yellow-400/20 text-yellow-600 border-0 text-[10px]">Comissão vitalícia</Badge>
                </div>
              </div>
              <div className="bg-muted/30 rounded-xl px-4 py-3 flex items-center gap-2 border border-border">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-mono flex-1 truncate text-foreground">{ambassadorLink}</p>
                <button onClick={handleCopyAmb} className="h-8 w-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Copy className="h-4 w-4 text-primary" />
                </button>
                <button onClick={handleShareAmb} className="h-8 w-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Share2 className="h-4 w-4 text-primary" />
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Indicados", value: String(referrals.length), icon: UserPlus, color: "#2D6FF0" },
                { label: "Comissões", value: String(commissions.length), icon: TrendingUp, color: "#00A650" },
                { label: "Total ganho", value: `R$ ${totalEarned.toFixed(0)}`, icon: DollarSign, color: "#7C3AED" },
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

            {/* Referred sellers */}
            {referrals.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Vendedores indicados</h3>
                <div className="space-y-2.5">
                  {referrals.map((r) => (
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

            {/* Commission history */}
            {commissions.length > 0 && (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <h3 className="text-sm font-semibold text-foreground px-5 pt-4 pb-2">Histórico de comissões</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-5 py-2.5 text-[11px] text-muted-foreground font-medium">Data</th>
                        <th className="text-right px-5 py-2.5 text-[11px] text-muted-foreground font-medium">Comissão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((c) => (
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
          </>
        )}

        {/* ===== HOW IT WORKS ===== */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-base font-bold text-foreground mb-1">Como funciona?</h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Você recebe um link exclusivo de embaixador. Todo vendedor que se cadastrar na Froiv pelo seu link fica vinculado a você <span className="font-semibold text-foreground">para sempre</span>.
          </p>
          <p className="text-[13px] text-muted-foreground leading-relaxed mt-2">
            Cada vez que esse vendedor realizar uma venda na plataforma, você ganha <span className="font-semibold text-primary">3% do valor da venda</span> automaticamente na sua carteira.
          </p>
        </div>

        {/* ===== EXAMPLE ===== */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-success" />
            Exemplo prático
          </h2>
          <p className="text-[13px] text-muted-foreground mb-3">Venda de <span className="font-bold text-foreground">R$ 100</span>:</p>
          <div className="space-y-2">
            {[
              { label: "Vendedor recebe", value: "R$ 90", color: "text-foreground" },
              { label: "Froiv fica com", value: "R$ 7", color: "text-muted-foreground" },
              { label: "Você (embaixador) ganha", value: "R$ 3", color: "text-success font-bold" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2 text-[13px]">
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{row.label}:</span>
                <span className={row.color}>{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/70 mt-3 border-t border-border pt-3">
            O vendedor não paga nada a mais. A comissão sai da taxa da plataforma.
          </p>
        </div>

        {/* ===== SIMULATION ===== */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Simulação real
          </h2>
          <div className="space-y-3">
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <p className="text-[13px] text-muted-foreground">Se indicar <span className="font-bold text-foreground">5 vendedores</span> que vendem R$ 2.000/mês cada:</p>
              <p className="text-xl font-bold text-success mt-1">R$ 300/mês <span className="text-[12px] font-normal text-muted-foreground">sem fazer nada</span></p>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <p className="text-[13px] text-muted-foreground">Indicou <span className="font-bold text-foreground">10 vendedores</span> ativos?</p>
              <p className="text-xl font-bold text-success mt-1">R$ 600/mês <span className="text-[12px] font-normal text-muted-foreground">de renda passiva</span></p>
            </div>
          </div>
        </div>

        {/* ===== RULES ===== */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Regras
          </h2>
          <div className="space-y-2.5">
            {[
              { icon: Infinity, text: "Comissão vitalícia — não expira nunca" },
              { icon: Zap, text: "Sem limite de ganhos ou indicações" },
              { icon: Banknote, text: "Pagamento automático na carteira" },
              { icon: BarChart3, text: "Você acompanha tudo no Painel do Embaixador" },
              { icon: Gift, text: "Saque via Pix quando quiser" },
            ].map((rule, i) => (
              <div key={i} className="flex items-center gap-3 text-[13px]">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <rule.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-foreground">{rule.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== HOW TO PARTICIPATE ===== */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Como participar?
          </h2>
          <div className="space-y-3">
            {[
              "Acesse a Froiv e ative seu link de embaixador",
              "Compartilhe nos seus grupos",
              "Pronto — cada venda dos indicados te gera comissão",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-[12px] font-bold text-white">{i + 1}</span>
                </div>
                <p className="text-[13px] text-foreground pt-1">{step}</p>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-muted-foreground mt-4 pt-3 border-t border-border">
            Quanto mais vendedores ativos você trouxer, mais você ganha. Simples assim. 💙
          </p>
        </div>

        {/* ===== APPLICATION / STATUS ===== */}
        {!ambassador && (
          <div className="bg-card rounded-xl border-2 border-primary/20 p-5">
            {/* Application status */}
            {application?.status === "pending" && (
              <div className="flex items-center gap-3 bg-warning/10 text-warning rounded-xl px-4 py-3 border border-warning/20 mb-4">
                <Clock className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Solicitação em análise</p>
                  <p className="text-[11px] opacity-80">Enviada em {new Date(application.created_at).toLocaleDateString("pt-BR")}. Entraremos em contato pelo WhatsApp.</p>
                </div>
              </div>
            )}

            {application?.status === "rejected" && (
              <div className="flex items-center gap-3 bg-destructive/10 text-destructive rounded-xl px-4 py-3 border border-destructive/20 mb-4">
                <XCircle className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Solicitação não aprovada</p>
                  <p className="text-[11px] opacity-80">{application.admin_notes || "Você pode enviar uma nova solicitação."}</p>
                </div>
              </div>
            )}

            {application?.status !== "pending" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">Quero ser Embaixador!</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Preencha seus dados e envie prints comprovando que é admin de grupos e tem vendas realizadas.
                  </p>
                </div>

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

                {/* Screenshot uploads */}
                <div className="space-y-2">
                  <Label className="text-[12px] text-muted-foreground">
                    Prints de comprovação * <span className="text-[10px]">(admin de grupo + vendas aprovadas)</span>
                  </Label>

                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUploadScreenshot} />

                  {appScreenshots.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {appScreenshots.map((url, idx) => (
                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted/20">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => removeScreenshot(idx)} className="absolute top-1 right-1 h-5 w-5 bg-black/60 rounded-full flex items-center justify-center">
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

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleSubmitApplication}
                  disabled={submitting || !appName.trim() || !appEmail.trim() || !appWhatsapp.trim() || appScreenshots.length === 0}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Enviar solicitação de Embaixador
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DesktopPageShell>
  );
}
