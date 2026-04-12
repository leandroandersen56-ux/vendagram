import { useAdminStats, formatBRL } from "@/hooks/useAdminStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Clock, Banknote } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";

export default function SuperAdminFinancial() {
  const { data: stats } = useAdminStats();

  const { data: revenueChart } = useQuery({
    queryKey: ["admin-revenue-90d"],
    queryFn: async () => {
      const since = subDays(new Date(), 90).toISOString();
      const { data } = await supabase.from("transactions")
        .select("amount, platform_fee, created_at")
        .eq("status", "completed")
        .gte("created_at", since);
      const byDay: Record<string, { gmv: number; fee: number }> = {};
      for (let i = 89; i >= 0; i--) {
        const d = format(subDays(new Date(), i), "dd/MM");
        byDay[d] = { gmv: 0, fee: 0 };
      }
      data?.forEach(t => {
        const d = format(new Date(t.created_at), "dd/MM");
        if (byDay[d]) {
          byDay[d].gmv += Number(t.amount);
          byDay[d].fee += Number(t.platform_fee);
        }
      });
      return Object.entries(byDay).map(([name, v]) => ({ name, ...v }));
    },
  });

  const { data: walletsSummary } = useQuery({
    queryKey: ["admin-wallets-summary"],
    queryFn: async () => {
      const { data } = await supabase.from("wallets").select("balance, pending, total_earned");
      const totals = { balance: 0, pending: 0, earned: 0 };
      data?.forEach(w => {
        totals.balance += Number(w.balance);
        totals.pending += Number(w.pending);
        totals.earned += Number(w.total_earned);
      });
      return totals;
    },
  });

  const kpis = [
    { label: "GMV TOTAL", value: formatBRL(stats?.gmv ?? 0), icon: DollarSign, color: "#10B981" },
    { label: "RECEITA FROIV (7%)", value: formatBRL(stats?.revenue ?? 0), icon: TrendingUp, color: "#7c3aed" },
    { label: "EM ESCROW", value: formatBRL(walletsSummary?.pending ?? 0), icon: Clock, color: "#F59E0B" },
    { label: "SAQUES PENDENTES", value: formatBRL(stats?.pendingWithdrawals ?? 0), icon: Banknote, color: "#EF4444" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Financeiro</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-[#1e1e35] rounded-xl border border-white/[0.06] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">{k.label}</span>
              <k.icon className="h-5 w-5" style={{ color: k.color }} />
            </div>
            <p className="text-2xl font-black text-white">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Receita — últimos 90 dias</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueChart ?? []}>
            <defs>
              <linearGradient id="gradFee" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 10 }} interval={6} />
            <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }}
              formatter={(v: number) => [formatBRL(v)]} />
            <Area type="monotone" dataKey="fee" name="Receita" stroke="#7c3aed" fill="url(#gradFee)" strokeWidth={2} />
            <Area type="monotone" dataKey="gmv" name="GMV" stroke="#10B981" fill="transparent" strokeWidth={1} strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
