import { useState, useEffect } from "react";
import { Copy, Share2, Loader2 } from "lucide-react";
import PageHeader from "@/components/menu/PageHeader";
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
    // Get referral code
    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("user_id", user!.id)
      .single();

    if (profile?.referral_code) setReferralCode(profile.referral_code);

    // Get referrals
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
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader
        title="Afiliados"
        rightAction={<span className="text-[10px] bg-success text-white font-bold px-2 py-0.5 rounded-full">GANHA $</span>}
      />

      <div className="px-4 pt-4 space-y-4">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#064E3B] to-[#065F46] rounded-2xl p-6 text-white">
          <p className="text-2xl font-black">💰 Ganhe 10% de comissão</p>
          <p className="text-sm text-white/80 mt-1">Por cada venda indicada pelo seu link</p>
          <div className="mt-4 bg-white/10 rounded-xl px-4 py-3 flex items-center gap-2">
            <p className="text-sm font-mono flex-1 truncate text-white/90">{link}</p>
            <button onClick={handleCopy} className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Copy className="h-4 w-4 text-white" />
            </button>
            <button onClick={handleShare} className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Share2 className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Metrics */}
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Indicações", value: String(stats.total) },
              { label: "Conversões", value: String(stats.conversions) },
              { label: "Ganho total", value: `R$ ${stats.earned.toFixed(0)}` },
            ].map((m) => (
              <div key={m.label} className="bg-white rounded-xl border border-[#E8E8E8] p-3 text-center">
                <p className="text-lg font-black text-primary">{m.value}</p>
                <p className="text-[11px] text-[#666]">{m.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* How it works */}
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-4">
          <h3 className="text-sm font-bold text-[#111] mb-3">Como funciona</h3>
          {["Copie seu link de afiliado", "Compartilhe em redes sociais, grupos, Discord", "Ganhe 10% de cada venda realizada"].map((step, i) => (
            <div key={i} className="flex gap-3 items-start mb-2.5 last:mb-0">
              <div className="h-6 w-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
              <p className="text-[13px] text-[#333] pt-0.5">{step}</p>
            </div>
          ))}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
            <h3 className="text-sm font-bold text-[#111] px-4 pt-4 pb-2">Histórico de comissões</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#F0F0F0]">
                    <th className="text-left px-4 py-2 text-[11px] text-[#999] font-medium">Data</th>
                    <th className="text-right px-4 py-2 text-[11px] text-[#999] font-medium">Comissão</th>
                    <th className="text-right px-4 py-2 text-[11px] text-[#999] font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h: any) => (
                    <tr key={h.id} className="border-b border-[#F5F5F5] last:border-b-0">
                      <td className="px-4 py-2.5 text-[#666]">{new Date(h.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-2.5 text-right text-success font-semibold">R$ {Number(h.commission_amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          h.status === "paid" ? "bg-success/10 text-success" : "bg-[#FF6900]/10 text-[#FF6900]"
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
    </div>
  );
}
