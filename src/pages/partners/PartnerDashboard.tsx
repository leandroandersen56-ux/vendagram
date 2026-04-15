import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-custom-client";
import { usePartner } from "./PartnerGuard";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, DollarSign, Building2, Wallet, Package, Eye, Users } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

// Apenas vendas de listings criados a partir desta data contam para sócios
const PARTNER_LISTING_CUTOFF = "2026-04-13T00:00:00.000Z";

const PARTNER_PROFIT_RATE = 0.10; // 10% fixo para sócios vendedores

export default function PartnerDashboard() {
  const partner = usePartner();
  const { user } = useAuth();
  const navigate = useNavigate();
  const authUserId = user?.id;

  // Total em produtos disponíveis (soma de anúncios ativos do próprio sócio)
  const { data: gmv = 0 } = useQuery({
    queryKey: ["partner-gmv", authUserId],
    queryFn: async () => {
      if (!authUserId) return 0;
      const { data } = await supabase
        .from("listings")
        .select("price, stock")
        .eq("status", "active")
        .eq("seller_id", authUserId);
      return data?.reduce((s, t) => s + Number(t.price) * (Number(t.stock) || 1), 0) ?? 0;
    },
    enabled: !!authUserId,
    refetchInterval: 60_000,
  });

  // Faturamento real = soma de transações completadas do próprio sócio como vendedor
  // Busca listings elegíveis (criados >= cutoff)
  const { data: eligibleListingIds = [] } = useQuery({
    queryKey: ["partner-eligible-listings", authUserId],
    queryFn: async () => {
      if (!authUserId) return [];
      const { data } = await supabase
        .from("listings")
        .select("id")
        .eq("seller_id", authUserId)
        .gte("created_at", PARTNER_LISTING_CUTOFF);
      return data?.map((l) => l.id) ?? [];
    },
    enabled: !!authUserId,
    refetchInterval: 60_000,
  });

  const { data: totalSales = 0 } = useQuery({
    queryKey: ["partner-total-sales", authUserId, eligibleListingIds],
    queryFn: async () => {
      if (!authUserId || eligibleListingIds.length === 0) return 0;
      const { data } = await supabase
        .from("transactions")
        .select("amount")
        .eq("status", "completed")
        .eq("seller_id", authUserId)
        .in("listing_id", eligibleListingIds);
      return data?.reduce((s, t) => s + Number(t.amount), 0) ?? 0;
    },
    enabled: !!authUserId && eligibleListingIds.length > 0,
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

  // Lista de produtos disponíveis do próprio sócio
  const { data: activeListings = [] } = useQuery({
    queryKey: ["partner-active-listings", authUserId],
    queryFn: async () => {
      if (!authUserId) return [];
      const { data } = await supabase
        .from("listings")
        .select("id, title, price, stock, category, views_count, created_at")
        .eq("status", "active")
        .eq("seller_id", authUserId)
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
    enabled: !!authUserId,
    refetchInterval: 60_000,
  });

  const { data: chartData } = useQuery({
    queryKey: ["partner-chart-30d", authUserId, eligibleListingIds],
    queryFn: async () => {
      if (!authUserId || eligibleListingIds.length === 0) return [];
      const since = subDays(new Date(), 30).toISOString();
      const { data } = await supabase
        .from("transactions")
        .select("amount, created_at")
        .eq("status", "completed")
        .eq("seller_id", authUserId)
        .gte("created_at", since)
        .in("listing_id", eligibleListingIds);

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
        lucro: valor * PARTNER_PROFIT_RATE,
      }));
    },
    enabled: !!authUserId && eligibleListingIds.length > 0,
  });

  // Cálculos: sócio recebe 10% fixo das suas próprias vendas
  const partnerProfit = totalSales * PARTNER_PROFIT_RATE;
  const available = Math.max(0, partnerProfit - withdrawn);

  const kpis = [
    { label: "Total em Produtos Disponíveis", value: formatBRL(gmv), icon: TrendingUp, color: "#0ea5e9", sub: "Soma dos seus anúncios ativos" },
    { label: "Seu Lucro (10%)", value: formatBRL(partnerProfit), icon: DollarSign, color: "#10B981", sub: "10% sobre suas vendas realizadas" },
    { label: "Total Vendido", value: formatBRL(totalSales), icon: Building2, color: "#F59E0B", sub: "Soma das suas vendas concluídas" },
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

      {/* Split card — regra de lucro */}
      <div className="bg-gradient-to-r from-[#0ea5e9] to-[#0369a1] rounded-xl p-6 text-white">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">💰 Como funciona seu lucro</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total das suas vendas:</span>
            <span className="font-bold">{formatBRL(totalSales)}</span>
          </div>
          <div className="h-px bg-white/20" />
          <div className="flex justify-between">
            <span>📊 Taxa da plataforma (10%):</span>
            <span className="font-semibold">{formatBRL(totalSales * 0.10)}</span>
          </div>
          <div className="flex justify-between">
            <span>💰 Seu lucro (10% da venda):</span>
            <span className="font-semibold">{formatBRL(partnerProfit)}</span>
          </div>
          <div className="h-px bg-white/20" />
          <div className="flex justify-between">
            <span>🏦 Já sacado:</span>
            <span className="font-semibold">{formatBRL(withdrawn)}</span>
          </div>
          <div className="h-px bg-white/20" />
          <div className="flex justify-between text-base font-bold">
            <span>Disponível para saque:</span>
            <span>{formatBRL(available)}</span>
          </div>
        </div>
      </div>

      {/* Produtos Disponíveis */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#7DD3FC] flex items-center gap-2">
            <Package className="h-4 w-4" />
            Seus Produtos ({activeListings.length})
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

      {/* Chart — vendas do sócio */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-5">
        <h3 className="text-sm font-semibold text-[#7DD3FC] mb-4">Suas Vendas — últimos 30 dias</h3>
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
              formatter={(v: number, name: string) => [formatBRL(v), name === "vendas" ? "Vendas" : "Seu Lucro (10%)"]}
            />
            <Area type="monotone" dataKey="vendas" stroke="#0ea5e9" fill="url(#partnerGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="lucro" stroke="#10B981" fill="url(#profitGrad)" strokeWidth={2} strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
