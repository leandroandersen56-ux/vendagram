import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-custom-client";
import { usePartner } from "./PartnerGuard";
import { TrendingUp, DollarSign, Building2, Wallet, Package, Eye } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";
import { useNavigate } from "react-router-dom";

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function PartnerDashboard() {
  const partner = usePartner();
  const navigate = useNavigate();
  const pct = partner.profit_percent / 100;

  // Total em produtos disponíveis (soma de anúncios ativos)
  const { data: gmv = 0 } = useQuery({
    queryKey: ["partner-gmv"],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("price, stock")
        .eq("status", "active");
      return data?.reduce((s, t) => s + Number(t.price) * (Number(t.stock) || 1), 0) ?? 0;
    },
    refetchInterval: 60_000,
  });

  // Faturamento real = soma de transações completadas
  const { data: totalSales = 0 } = useQuery({
    queryKey: ["partner-total-sales"],
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("amount")
        .eq("status", "completed");
      return data?.reduce((s, t) => s + Number(t.amount), 0) ?? 0;
    },
    refetchInterval: 60_000,
  });

  const { data: withdrawn = 0 } = useQuery({
    queryKey: ["partner-withdrawn", partner.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("partner_withdrawals" as any)
        .select("amount")
        .eq("partner_id", partner.id)
        .in("status", ["completed", "processing", "approved"]);
      return (data as any[])?.reduce((s: number, w: any) => s + Number(w.amount), 0) ?? 0;
    },
    refetchInterval: 60_000,
  });

  const { data: totalPartners = 1 } = useQuery({
    queryKey: ["partner-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("partners" as any)
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);
      return count ?? 1;
    },
  });

  // Lista de produtos disponíveis
  const { data: activeListings = [] } = useQuery({
    queryKey: ["partner-active-listings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, title, price, stock, category, views_count, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
    refetchInterval: 60_000,
  });

  const { data: chartData } = useQuery({
    queryKey: ["partner-chart-30d"],
    queryFn: async () => {
      const since = subDays(new Date(), 30).toISOString();
      const { data } = await supabase
        .from("transactions")
        .select("amount, created_at")
        .eq("status", "completed")
        .gte("created_at", since);

      const byDay: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        byDay[format(subDays(new Date(), i), "dd/MM")] = 0;
      }
      data?.forEach((t) => {
        const d = format(new Date(t.created_at), "dd/MM");
        if (byDay[d] !== undefined) byDay[d] += Number(t.amount);
      });
      return Object.entries(byDay).map(([name, valor]) => ({
        name,
        vendas: valor,
        lucro: valor * pct,
      }));
    },
  });

  // Cálculos baseados em vendas reais (não em produtos disponíveis)
  const partnerShare = totalSales * pct;
  const platformShare = totalSales * 0.05;
  const available = Math.max(0, partnerShare - withdrawn);
  const platformFee = totalSales * 0.10;

  const kpis = [
    { label: "Total em Produtos Disponíveis", value: formatBRL(gmv), icon: TrendingUp, color: "#0ea5e9", sub: "Soma dos anúncios ativos" },
    { label: `Sua Participação (${partner.profit_percent}%)`, value: formatBRL(partnerShare), icon: DollarSign, color: "#10B981", sub: `Baseado em ${partner.profit_percent}% sobre vendas realizadas` },
    { label: "Lucro da Plataforma (5%)", value: formatBRL(platformShare), icon: Building2, color: "#F59E0B", sub: "Parcela operacional sobre vendas" },
    { label: "Disponível para Saque", value: formatBRL(available), icon: Wallet, color: "#10B981", action: true },
  ];

  const categoryLabels: Record<string, string> = {
    free_fire: "Free Fire",
    instagram: "Instagram",
    tiktok: "TikTok",
    facebook: "Facebook",
    youtube: "YouTube",
    valorant: "Valorant",
    fortnite: "Fortnite",
    roblox: "Roblox",
    clash_royale: "Clash Royale",
    kwai: "Kwai",
    twitter: "Twitter/X",
    other: "Outro",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#F0F9FF]">Olá, {partner.name} 👋</h1>
        <p className="text-sm text-[#7DD3FC]">Seu dashboard financeiro — dados em tempo real</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-[#7DD3FC] uppercase tracking-wider font-medium">{kpi.label}</span>
              <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
            </div>
            <p className="text-2xl lg:text-[28px] font-black text-[#F0F9FF]">{kpi.value}</p>
            {kpi.sub && <p className="text-[11px] text-[#7DD3FC]/70 mt-1">{kpi.sub}</p>}
            {kpi.action && (
              <button
                onClick={() => navigate("/admintoplogin/saque")}
                className="mt-2 text-xs text-[#0ea5e9] hover:text-[#7DD3FC] font-medium transition-colors"
              >
                Sacar →
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Split card — baseado em vendas reais */}
      <div className="bg-gradient-to-r from-[#0ea5e9] to-[#0369a1] rounded-xl p-6 text-white">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">💰 Split de Receita — Como funciona</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Vendido:</span>
            <span className="font-bold">{formatBRL(totalSales)}</span>
          </div>
          <div className="h-px bg-white/20" />
          <div className="flex justify-between">
            <span>🏢 Plataforma (5%):</span>
            <span className="font-semibold">{formatBRL(platformShare)}</span>
          </div>
          <div className="flex justify-between">
            <span>🤝 Sócios ({partner.profit_percent}%):</span>
            <span className="font-semibold">{formatBRL(partnerShare)}</span>
          </div>
          <div className="h-px bg-white/20" />
          <div className="flex justify-between">
            <span>Taxa de vendas (10%):</span>
            <span className="font-semibold">{formatBRL(platformFee)}</span>
          </div>
          <div className="h-px bg-white/20" />
          <div className="flex justify-between text-base font-bold">
            <span>Sua fatia:</span>
            <span>{formatBRL(partnerShare)} {totalPartners > 1 ? `÷ ${totalPartners} sócios` : ""}</span>
          </div>
        </div>
      </div>

      {/* Produtos Disponíveis */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#7DD3FC] flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produtos Disponíveis ({activeListings.length})
          </h3>
        </div>
        {activeListings.length === 0 ? (
          <p className="text-[#7DD3FC]/50 text-sm text-center py-8">Nenhum produto ativo no momento</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#7DD3FC]/70 text-[11px] uppercase tracking-wider border-b border-[rgba(14,165,233,0.1)]">
                  <th className="text-left py-2 pr-3">Produto</th>
                  <th className="text-left py-2 pr-3">Categoria</th>
                  <th className="text-right py-2 pr-3">Preço</th>
                  <th className="text-center py-2 pr-3">Estoque</th>
                  <th className="text-center py-2">Views</th>
                </tr>
              </thead>
              <tbody>
                {activeListings.map((listing) => (
                  <tr key={listing.id} className="border-b border-[rgba(14,165,233,0.05)] hover:bg-[rgba(14,165,233,0.05)] transition-colors">
                    <td className="py-3 pr-3 text-[#F0F9FF] font-medium max-w-[200px] truncate">{listing.title}</td>
                    <td className="py-3 pr-3 text-[#7DD3FC]/80">{categoryLabels[listing.category] || listing.category}</td>
                    <td className="py-3 pr-3 text-[#F0F9FF] text-right font-semibold">{formatBRL(Number(listing.price))}</td>
                    <td className="py-3 pr-3 text-center text-[#7DD3FC]">{listing.stock}</td>
                    <td className="py-3 text-center text-[#7DD3FC]/70 flex items-center justify-center gap-1">
                      <Eye className="h-3 w-3" />
                      {listing.views_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chart — vendas reais */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-5">
        <h3 className="text-sm font-semibold text-[#7DD3FC] mb-4">Vendas — últimos 30 dias</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData ?? []}>
            <defs>
              <linearGradient id="partnerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,165,233,0.1)" />
            <XAxis dataKey="name" tick={{ fill: "#7DD3FC", fontSize: 10 }} />
            <YAxis tick={{ fill: "#7DD3FC", fontSize: 10 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "#0f2040", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 8, color: "#F0F9FF" }}
              formatter={(v: number, name: string) => [formatBRL(v), name === "vendas" ? "Vendas" : "Sua Participação"]}
            />
            <Area type="monotone" dataKey="vendas" stroke="#0ea5e9" fill="url(#partnerGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="lucro" stroke="#10B981" fill="url(#profitGrad)" strokeWidth={2} strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
