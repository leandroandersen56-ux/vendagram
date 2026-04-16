import { useState, useEffect } from "react";
import { Copy, Share2, Loader2, Link2, Users, TrendingUp, DollarSign, Crown, UserPlus, Zap } from "lucide-react";
import DesktopPageShell from "@/components/DesktopPageShell";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);

    // Get or check ambassador status
    const { data: amb } = await supabase
      .from("ambassadors")
      .select("id, code")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (amb) {
      setAmbassador(amb);

      // Load referrals
      const { data: refs } = await supabase
        .from("ambassador_referrals")
        .select("id, referred_seller_id, created_at")
        .eq("ambassador_id", amb.id)
        .order("created_at", { ascending: false });

      if (refs && refs.length > 0) {
        // Get profiles for referred sellers
        const sellerIds = refs.map(r => r.referred_seller_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url")
          .in("user_id", sellerIds);

        const enriched = refs.map(r => ({
          ...r,
          profile: profiles?.find(p => p.user_id === r.referred_seller_id) || undefined,
        }));
        setReferrals(enriched);
      }

      // Load commissions
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

  const activateAmbassador = async () => {
    setActivating(true);

    // Get profile's referral_code to use as ambassador code
    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("user_id", user!.id)
      .single();

    const code = profile?.referral_code || undefined;

    const { data, error } = await supabase
      .from("ambassadors")
      .insert({ user_id: user!.id, ...(code ? { code } : {}) })
      .select("id, code")
      .single();

    if (error) {
      toast.error("Erro ao ativar. Tente novamente.");
    } else {
      setAmbassador(data);
      toast.success("Você agora é um Embaixador Froiv! 🏆");
    }
    setActivating(false);
  };

  const link = ambassador ? `froiv.com?amb=${ambassador.code}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${link}`);
    toast.success("Link copiado!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Froiv - Embaixador",
        text: "Cadastre-se na Froiv e compre/venda contas digitais com segurança!",
        url: `https://${link}`,
      });
    } else {
      handleCopy();
    }
  };

  if (loading) {
    return (
      <DesktopPageShell title="Embaixador">
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DesktopPageShell>
    );
  }

  // Not yet an ambassador — show activation CTA
  if (!ambassador) {
    return (
      <DesktopPageShell title="Embaixador">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #2D6FF0 0%, #1B4FBF 50%, #1340A0 100%)" }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
            <div className="relative z-10 text-center py-4">
              <Crown className="h-12 w-12 text-yellow-300 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Programa Embaixador Froiv</h2>
              <p className="text-white/80 text-sm max-w-sm mx-auto mb-6">
                Ganhe <span className="text-yellow-300 font-bold">3% de comissão vitalícia</span> em cada venda dos vendedores que você indicar.
              </p>
              <button
                onClick={activateAmbassador}
                disabled={activating}
                className="bg-white text-[#1B4FBF] font-bold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {activating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Ativar meu link de Embaixador
              </button>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Como funciona</h3>
            {[
              { text: "Ative seu link exclusivo de embaixador", icon: Link2, color: "#2D6FF0" },
              { text: "Compartilhe com vendedores", icon: Users, color: "#7C3AED" },
              { text: "Ganhe 3% de cada venda — para sempre", icon: DollarSign, color: "#00A650" },
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
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">💰 Simulação</h3>
            <div className="space-y-2 text-[13px]">
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
        </div>
      </DesktopPageShell>
    );
  }

  // Active ambassador — show dashboard
  return (
    <DesktopPageShell title="Embaixador">
      <div className="space-y-4">
        {/* Hero with link */}
        <div className="relative overflow-hidden rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #2D6FF0 0%, #1B4FBF 50%, #1340A0 100%)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <Crown className="h-5 w-5 text-yellow-300" />
              </div>
              <p className="text-xl font-bold text-white tracking-tight">Embaixador Froiv</p>
            </div>
            <p className="text-sm text-white/70 ml-[46px]">Comissão vitalícia de 3% em cada venda</p>

            <div className="mt-5 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-2 border border-white/10">
              <Link2 className="h-4 w-4 text-white/50 shrink-0" />
              <p className="text-sm font-mono flex-1 truncate text-white/90">{link}</p>
              <button onClick={handleCopy} className="h-8 w-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                <Copy className="h-4 w-4 text-white" />
              </button>
              <button onClick={handleShare} className="h-8 w-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                <Share2 className="h-4 w-4 text-white" />
              </button>
            </div>
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
                    <p className="text-[11px] text-muted-foreground">
                      Desde {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </p>
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

        {/* How it works */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">💰 Como funciona a comissão</h3>
          <div className="text-[13px] text-muted-foreground space-y-1.5">
            <p>Venda de <span className="text-foreground font-medium">R$ 100</span>:</p>
            <p>→ Vendedor recebe: R$ 90</p>
            <p>→ Froiv fica com: R$ 7</p>
            <p>→ Você (embaixador) ganha: <span className="text-success font-bold">R$ 3</span></p>
            <p className="text-[11px] mt-2 text-muted-foreground/70">A comissão sai da taxa da plataforma. O vendedor não paga nada a mais.</p>
          </div>
        </div>
      </div>
    </DesktopPageShell>
  );
}
