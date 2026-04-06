import { useState, useEffect } from "react";
import { useAdminStats, formatBRL } from "@/hooks/useAdminStats";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Users, ShoppingBag, Scale, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";

interface LiveEvent {
  id: string;
  type: "sale" | "signup" | "listing" | "dispute";
  message: string;
  time: Date;
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C", tiktok: "#010101", free_fire: "#FF6B00",
  valorant: "#FF4655", fortnite: "#7B68EE", roblox: "#E74C3C",
  youtube: "#FF0000", facebook: "#1877F2", clash_royale: "#F5A623", other: "#6B7280"
};

export default function SuperAdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);

  // Chart data - last 30 days
  const { data: chartData } = useQuery({
    queryKey: ["admin-chart-30d"],
    queryFn: async () => {
      const since = subDays(new Date(), 30).toISOString();
      const { data } = await supabase.from("transactions")
        .select("amount, created_at")
        .eq("status", "completed")
        .gte("created_at", since);
      
      const byDay: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = format(subDays(new Date(), i), "dd/MM");
        byDay[d] = 0;
      }
      data?.forEach(t => {
        const d = format(new Date(t.created_at), "dd/MM");
        if (byDay[d] !== undefined) byDay[d] += Number(t.amount);
      });
      return Object.entries(byDay).map(([name, valor]) => ({ name, valor }));
    },
  });

  // Platform distribution
  const { data: platformData } = useQuery({
    queryKey: ["admin-platforms"],
    queryFn: async () => {
      const { data } = await supabase.from("listings")
        .select("category")
        .eq("status", "active");
      const counts: Record<string, number> = {};
      data?.forEach(l => { counts[l.category] = (counts[l.category] || 0) + 1; });
      return Object.entries(counts).map(([name, value]) => ({
        name: name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        value,
        color: PLATFORM_COLORS[name] || "#6B7280",
      }));
    },
  });

  // Realtime events
  useEffect(() => {
    const channel = supabase.channel("admin-live-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions" }, (p) => {
        setLiveEvents(prev => [{
          id: crypto.randomUUID(), type: "sale",
          message: `Nova venda — ${formatBRL(Number(p.new.amount))}`,
          time: new Date(),
        }, ...prev].slice(0, 20));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, (p) => {
        setLiveEvents(prev => [{
          id: crypto.randomUUID(), type: "signup",
          message: `Novo usuário — ${p.new.email || p.new.name || "Anônimo"}`,
          time: new Date(),
        }, ...prev].slice(0, 20));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "listings" }, (p) => {
        setLiveEvents(prev => [{
          id: crypto.randomUUID(), type: "listing",
          message: `Novo anúncio — ${p.new.title} · ${formatBRL(Number(p.new.price))}`,
          time: new Date(),
        }, ...prev].slice(0, 20));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "disputes" }, () => {
        setLiveEvents(prev => [{
          id: crypto.randomUUID(), type: "dispute",
          message: `Disputa aberta — URGENTE`,
          time: new Date(),
        }, ...prev].slice(0, 20));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const eventColors = { sale: "🟢", signup: "🔵", listing: "🟡", dispute: "🔴" };
  const timeAgo = (d: Date) => {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return `há ${s}s`;
    if (s < 3600) return `há ${Math.floor(s / 60)}min`;
    return `há ${Math.floor(s / 3600)}h`;
  };

  const kpis = [
    { label: "GMV TOTAL", value: formatBRL(stats?.gmv ?? 0), icon: DollarSign, color: "#10B981" },
    { label: "USUÁRIOS", value: stats?.totalUsers ?? 0, icon: Users, color: "#3B82F6" },
    { label: "ANÚNCIOS ATIVOS", value: stats?.activeListings ?? 0, icon: ShoppingBag, color: "#7c3aed" },
    { label: "DISPUTAS ABERTAS", value: stats?.openDisputes ?? 0, icon: Scale, color: stats?.openDisputes ? "#EF4444" : "#10B981" },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c3aed]" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-[#1e1e35] rounded-xl border border-white/[0.06] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">{kpi.label}</span>
              <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
            </div>
            <p className="text-2xl lg:text-[28px] font-black text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#1e1e35] rounded-xl border border-white/[0.06] p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Vendas — últimos 30 dias</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData ?? []}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 10 }} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }}
                formatter={(v: number) => [formatBRL(v), "Volume"]} />
              <Area type="monotone" dataKey="valor" stroke="#7c3aed" fill="url(#grad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Plataformas</h3>
          {platformData && platformData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={platformData} dataKey="value" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                    {platformData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {platformData.slice(0, 5).map(p => (
                  <div key={p.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-gray-400 flex-1">{p.name}</span>
                    <span className="text-white font-medium">{p.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm text-center py-10">Sem dados</p>
          )}
        </div>
      </div>

      {/* Live feed */}
      <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-gray-300">LIVE — Atividade agora</h3>
        </div>
        {liveEvents.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">Aguardando eventos em tempo real...</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {liveEvents.map(e => (
              <div key={e.id} className="flex items-center gap-3 bg-[#0f0f1a] rounded-lg px-4 py-3 text-sm">
                <span>{eventColors[e.type]}</span>
                <span className="text-gray-200 flex-1">{e.message}</span>
                <span className="text-gray-500 text-xs shrink-0">{timeAgo(e.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
