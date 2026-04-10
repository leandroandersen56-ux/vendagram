import { useState, useEffect } from "react";
import { Copy, Share2, Loader2, Link2, Users, TrendingUp, DollarSign, Megaphone, Gift } from "lucide-react";
import DesktopPageShell from "@/components/DesktopPageShell";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Affiliates() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState({ total: 0, conversions: 0, earned: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);
    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("user_id", user!.id)
      .single();

    if (profile?.referral_code) setReferralCode(profile.referral_code);

    const { data: referrals } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", user!.id)
      .order("created_at", { ascending: false });

    if (referrals) {
      const paid = referrals.filter((r: any) => r.status === "paid");
      setStats({
        total: referrals.length,
        conversions: paid.length,
        earned: paid.reduce((s: number, r: any) => s + Number(r.commission_amount || 0), 0),
      });
      setHistory(referrals.slice(0, 10));
    }
    setLoading(false);
  };

  const link = `froiv.com?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${link}`);
    toast.success("Link copiado!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "Froiv", text: "Compre contas digitais com segurança!", url: `https://${link}` });
    } else {
      handleCopy();
    }
  };

  return (
    <DesktopPageShell title="Afiliados">
      <div className="space-y-4">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #2D6FF0 0%, #1B4FBF 50%, #1340A0 100%)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <p className="text-xl font-bold text-white tracking-tight"><p className="text-xl font-bold text-white tracking-tight">Ganhe 10% de comissão</p></p>
            </div>
            <p className="text-sm text-white/70 ml-[46px]">Por cada venda indicada pelo seu link</p>
            
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
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (
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
        )}

        {/* How it works */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Como funciona</h3>
          {[
            { text: "Copie seu link de afiliado", icon: Link2, color: "#2D6FF0" },
            { text: "Compartilhe em redes sociais, grupos, Discord", icon: Megaphone, color: "#7C3AED" },
            { text: "{ text: "Ganhe 10% de cada venda realizada", icon: DollarSign, color: "#00A650" },", icon: DollarSign, color: "#00A650" },
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

        {/* History */}
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
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                          h.status === "paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                        }`}>
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
      </div>
    </DesktopPageShell>
  );
}
