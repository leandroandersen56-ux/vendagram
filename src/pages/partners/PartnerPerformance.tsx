import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Users, TrendingUp, Target, Award, BarChart3 } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { subDays, subWeeks, format, startOfWeek } from "date-fns";

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram", tiktok: "TikTok", free_fire: "Free Fire",
  youtube: "YouTube", facebook: "Facebook", valorant: "Valorant",
  fortnite: "Fortnite", roblox: "Roblox", clash_royale: "Clash Royale",
  kwai: "Kwai", twitter: "Twitter/X", other: "Outros",
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C", tiktok: "#69C9D0", free_fire: "#FF6B00",
  youtube: "#FF0000", facebook: "#1877F2", valorant: "#FF4655",
  fortnite: "#7B68EE", roblox: "#E74C3C", clash_royale: "#F5A623",
  kwai: "#FF7E00", twitter: "#1DA1F2", other: "#6B7280",
};

export default function PartnerPerformance() {
  const { data: stats } = useQuery({
    queryKey: ["partner-performance"],
    queryFn: async () => {
      const [listings, profiles, transactions, lastMonthTx, views] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("transactions").select("amount, created_at, listing_id, status").eq("status", "completed"),
        supabase.from("transactions").select("amount").eq("status", "completed")
          .gte("created_at", subDays(new Date(), 60).toISOString())
          .lte("created_at", subDays(new Date(), 30).toISOString()),
        supabase.from("listing_views").select("id", { count: "exact", head: true }),
      ]);

      const completedTx = transactions.data ?? [];
      const gmv = completedTx.reduce((s, t) => s + Number(t.amount), 0);
      const thisMonthTx = completedTx.filter((t) => new Date(t.created_at) >= subDays(new Date(), 30));
      const thisMonthGmv = thisMonthTx.reduce((s, t) => s + Number(t.amount), 0);
      const lastMonthGmv = lastMonthTx.data?.reduce((s: number, t: any) => s + Number(t.amount), 0) ?? 0;
      const momGrowth = lastMonthGmv > 0 ? ((thisMonthGmv - lastMonthGmv) / lastMonthGmv) * 100 : 0;

      // Platform distribution
      const listingIds = [...new Set(completedTx.map((t) => t.listing_id))];
      const { data: listingsData } = listingIds.length > 0
        ? await supabase.from("listings").select("id, category").in("id", listingIds)
        : { data: [] };
      const catMap = new Map(listingsData?.map((l) => [l.id, l.category]) ?? []);
      const platformCounts: Record<string, { count: number; total: number }> = {};
      completedTx.forEach((t) => {
        const cat = catMap.get(t.listing_id) ?? "other";
        if (!platformCounts[cat]) platformCounts[cat] = { count: 0, total: 0 };
        platformCounts[cat].count += 1;
        platformCounts[cat].total += Number(t.amount);
      });

      const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1].total - a[1].total)[0];

      return {
        activeListings: listings.count ?? 0,
        totalUsers: profiles.count ?? 0,
        totalSales: completedTx.length,
        totalViews: views.count ?? 0,
        gmv,
        ticketMedio: completedTx.length > 0 ? gmv / completedTx.length : 0,
        conversionRate: (views.count ?? 0) > 0 ? (completedTx.length / (views.count ?? 1)) * 100 : 0,
        topPlatform: topPlatform ? { name: PLATFORM_LABELS[topPlatform[0]] || topPlatform[0], volume: topPlatform[1].total } : null,
        momGrowth,
        platformData: Object.entries(platformCounts).map(([k, v]) => ({
          name: PLATFORM_LABELS[k] || k,
          value: v.total,
          color: PLATFORM_COLORS[k] || "#6B7280",
        })),
      };
    },
    refetchInterval: 120_000,
  });

  // Weekly signups
  const { data: weeklySignups } = useQuery({
    queryKey: ["partner-weekly-signups"],
    queryFn: async () => {
      const since = subWeeks(new Date(), 12).toISOString();
      const { data } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", since);

      const weeks: Record<string, number> = {};
      for (let i = 11; i >= 0; i--) {
        const w = startOfWeek(subWeeks(new Date(), i));
        weeks[format(w, "dd/MM")] = 0;
      }
      data?.forEach((p) => {
        const w = startOfWeek(new Date(p.created_at));
        const key = format(w, "dd/MM");
        if (weeks[key] !== undefined) weeks[key] += 1;
      });
      return Object.entries(weeks).map(([name, valor]) => ({ name, valor }));
    },
  });

  // Ticket médio evolution
  const { data: ticketData } = useQuery({
    queryKey: ["partner-ticket-evolution"],
    queryFn: async () => {
      const since = subDays(new Date(), 90).toISOString();
      const { data } = await supabase
        .from("transactions")
        .select("amount, created_at")
        .eq("status", "completed")
        .gte("created_at", since);

      const byWeek: Record<string, { sum: number; count: number }> = {};
      for (let i = 12; i >= 0; i--) {
        const w = startOfWeek(subWeeks(new Date(), i));
        byWeek[format(w, "dd/MM")] = { sum: 0, count: 0 };
      }
      data?.forEach((t) => {
        const w = startOfWeek(new Date(t.created_at));
        const key = format(w, "dd/MM");
        if (byWeek[key]) {
          byWeek[key].sum += Number(t.amount);
          byWeek[key].count += 1;
        }
      });
      return Object.entries(byWeek).map(([name, { sum, count }]) => ({
        name,
        ticket: count > 0 ? sum / count : 0,
      }));
    },
  });

  const metrics = [
    { label: "Anúncios Ativos", value: stats?.activeListings ?? 0, icon: ShoppingBag, color: "#0ea5e9" },
    { label: "Usuários Cadastrados", value: stats?.totalUsers ?? 0, icon: Users, color: "#7DD3FC" },
    { label: "Taxa de Conversão", value: `${(stats?.conversionRate ?? 0).toFixed(2)}%`, icon: Target, color: "#10B981" },
    { label: "Ticket Médio", value: formatBRL(stats?.ticketMedio ?? 0), icon: TrendingUp, color: "#F59E0B" },
    { label: "Plataforma Mais Vendida", value: stats?.topPlatform?.name ?? "—", icon: Award, color: "#E1306C", sub: stats?.topPlatform ? formatBRL(stats.topPlatform.volume) : "" },
    { label: "Crescimento MoM", value: `${(stats?.momGrowth ?? 0) >= 0 ? "+" : ""}${(stats?.momGrowth ?? 0).toFixed(1)}%`, icon: BarChart3, color: (stats?.momGrowth ?? 0) >= 0 ? "#10B981" : "#EF4444" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#F0F9FF]">📈 Desempenho</h1>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#7DD3FC] uppercase tracking-wider">{m.label}</span>
              <m.icon className="h-4 w-4" style={{ color: m.color }} />
            </div>
            <p className="text-xl font-bold text-[#F0F9FF]">{m.value}</p>
            {m.sub && <p className="text-[10px] text-[#7DD3FC]/60 mt-0.5">{m.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Users growth */}
        <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-5">
          <h3 className="text-sm font-semibold text-[#7DD3FC] mb-4">Novos Usuários por Semana</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklySignups ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,165,233,0.1)" />
              <XAxis dataKey="name" tick={{ fill: "#7DD3FC", fontSize: 10 }} />
              <YAxis tick={{ fill: "#7DD3FC", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0f2040", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 8, color: "#F0F9FF" }} />
              <Line type="monotone" dataKey="valor" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3, fill: "#0ea5e9" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Platform pie */}
        <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-5">
          <h3 className="text-sm font-semibold text-[#7DD3FC] mb-4">Vendas por Plataforma</h3>
          {stats?.platformData && stats.platformData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={stats.platformData} dataKey="value" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                    {stats.platformData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f2040", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 8, color: "#F0F9FF" }}
                    formatter={(v: number) => [formatBRL(v), "Volume"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1">
                {stats.platformData.slice(0, 5).map((p) => (
                  <div key={p.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-[#7DD3FC] flex-1">{p.name}</span>
                    <span className="text-[#F0F9FF] font-medium">{formatBRL(p.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm text-center py-10">Sem dados</p>
          )}
        </div>
      </div>

      {/* Ticket evolution */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-5">
        <h3 className="text-sm font-semibold text-[#7DD3FC] mb-4">Evolução do Ticket Médio</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={ticketData ?? []}>
            <defs>
              <linearGradient id="ticketGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,165,233,0.1)" />
            <XAxis dataKey="name" tick={{ fill: "#7DD3FC", fontSize: 10 }} />
            <YAxis tick={{ fill: "#7DD3FC", fontSize: 10 }} tickFormatter={(v) => `R$${v.toFixed(0)}`} />
            <Tooltip contentStyle={{ background: "#0f2040", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 8, color: "#F0F9FF" }}
              formatter={(v: number) => [formatBRL(v), "Ticket Médio"]} />
            <Area type="monotone" dataKey="ticket" stroke="#F59E0B" fill="url(#ticketGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
