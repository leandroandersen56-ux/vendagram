import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-custom-client";
import { usePartner } from "./PartnerGuard";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, DollarSign, Building2, Wallet, Package, Eye, Users, Sparkles, PiggyBank, Receipt, Landmark } from "lucide-react";
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

  // Últimos usuários cadastrados (sócio tem permissão via RLS "Admins and partners can read all profiles")
  const { data: recentUsers = [] } = useQuery({
    queryKey: ["partner-recent-users", authUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, name, username, avatar_url, created_at")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) {
        console.error("[PartnerDashboard] recent users error:", error);
        return [];
      }
     return data ?? [];
    },
    enabled: !!authUserId,
    refetchInterval: 60_000,
  });

  // Últimos produtos cadastrados na plataforma (apenas visualização)
  const { data: recentListings = [] } = useQuery({
    queryKey: ["partner-recent-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, title, price, status, category, screenshots, created_at")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) {
        console.error("[PartnerDashboard] recent listings error:", error);
        return [];
      }
      return data ?? [];
    },
    refetchInterval: 60_000,
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="h-9 w-9 rounded-xl bg-[#0ea5e9]/15 border border-[#0ea5e9]/25 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-[#0ea5e9]" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#F0F9FF] leading-tight">Olá, {partner.name}</h1>
          <p className="text-xs sm:text-sm text-[#7DD3FC]">Seu dashboard financeiro — dados em tempo real</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-3 sm:p-5">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-[11px] text-[#7DD3FC] uppercase tracking-wider font-semibold leading-tight">{kpi.label}</span>
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${kpi.color}1a`, border: `1px solid ${kpi.color}30` }}
              >
                <kpi.icon className="h-3.5 w-3.5" style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-lg sm:text-2xl lg:text-[28px] font-bold text-[#F0F9FF] tracking-tight">{kpi.value}</p>
            {kpi.sub && <p className="text-[10px] sm:text-[11px] text-[#7DD3FC]/70 mt-1 leading-tight font-medium">{kpi.sub}</p>}
            {kpi.action && (
              <button
                onClick={() => navigate("/admintoplogin/saque")}
                className="mt-2 text-xs text-[#0ea5e9] hover:text-[#7DD3FC] font-semibold transition-colors"
              >
                Sacar →
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Split card — regra de lucro */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0ea5e9] to-[#0369a1] rounded-2xl p-4 sm:p-6 text-white">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-9 w-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <PiggyBank className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-bold text-base sm:text-lg tracking-tight">Como funciona seu lucro</h3>
          </div>
          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center gap-2">
              <span className="font-medium text-white/90 inline-flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-white/70" />
                Total das suas vendas
              </span>
              <span className="font-bold whitespace-nowrap">{formatBRL(totalSales)}</span>
            </div>
            <div className="h-px bg-white/20" />
            <div className="flex justify-between items-center gap-2">
              <span className="font-medium text-white/90 inline-flex items-center gap-2">
                <Receipt className="h-3.5 w-3.5 text-white/70" />
                Taxa da plataforma (10%)
              </span>
              <span className="font-semibold whitespace-nowrap">{formatBRL(totalSales * 0.10)}</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="font-medium text-white/90 inline-flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-white/70" />
                Seu lucro (10% da venda)
              </span>
              <span className="font-semibold whitespace-nowrap">{formatBRL(partnerProfit)}</span>
            </div>
            <div className="h-px bg-white/20" />
            <div className="flex justify-between items-center gap-2">
              <span className="font-medium text-white/90 inline-flex items-center gap-2">
                <Landmark className="h-3.5 w-3.5 text-white/70" />
                Já sacado
              </span>
              <span className="font-semibold whitespace-nowrap">{formatBRL(withdrawn)}</span>
            </div>
            <div className="h-px bg-white/20" />
            <div className="flex justify-between items-baseline gap-2 pt-1">
              <span className="text-sm sm:text-base font-bold">Disponível para saque</span>
              <span className="text-base sm:text-lg font-bold whitespace-nowrap">{formatBRL(available)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos Disponíveis */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#7DD3FC] flex items-center gap-2">
            <Package className="h-4 w-4" />
            Seus Produtos ({activeListings.length})
          </h3>
        </div>
        {activeListings.length === 0 ? (
          <p className="text-[#7DD3FC]/50 text-sm text-center py-8">Nenhum produto ativo no momento</p>
        ) : (
          <div className="-mx-4 sm:-mx-5">
            <div className="overflow-x-auto px-4 sm:px-5">
              <table className="w-full text-sm min-w-[480px]">
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
                      <td className="py-3 pr-3 text-[#F0F9FF] font-medium max-w-[180px] truncate">{listing.title}</td>
                      <td className="py-3 pr-3 text-[#7DD3FC]/80 whitespace-nowrap">{categoryLabels[listing.category] || listing.category}</td>
                      <td className="py-3 pr-3 text-[#F0F9FF] text-right font-semibold whitespace-nowrap">{formatBRL(Number(listing.price))}</td>
                      <td className="py-3 pr-3 text-center text-[#7DD3FC]">{listing.stock}</td>
                      <td className="py-3 text-center text-[#7DD3FC]/70">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {listing.views_count}
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

      {/* Chart — vendas do sócio */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-[#7DD3FC] mb-4">Suas Vendas — últimos 30 dias</h3>
        <div className="-mx-2 sm:mx-0">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData ?? []} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
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
              <XAxis dataKey="name" tick={{ fill: "#7DD3FC", fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis 
                tick={{ fill: "#7DD3FC", fontSize: 9 }} 
                tickFormatter={(v) => v === 0 ? "R$0" : `R$${(v / 1000).toFixed(0)}k`}
                width={45}
                tickCount={4}
              />
              <Tooltip
                contentStyle={{ background: "#0f2040", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 8, color: "#F0F9FF", fontSize: 12 }}
                formatter={(v: number, name: string) => [formatBRL(v), name === "vendas" ? "Vendas" : "Seu Lucro (10%)"]}
              />
              <Area type="monotone" dataKey="vendas" stroke="#0ea5e9" fill="url(#partnerGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="lucro" stroke="#10B981" fill="url(#profitGrad)" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Últimos usuários cadastrados */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm font-semibold text-[#7DD3FC] flex items-center gap-2">
            <Users className="h-4 w-4" />
            Últimos Cadastros ({recentUsers.length})
          </h3>
        </div>
        {recentUsers.length === 0 ? (
          <p className="text-[#7DD3FC]/50 text-sm text-center py-8">Nenhum usuário cadastrado</p>
        ) : (
          <div className="space-y-1">
            {recentUsers.map((u: any) => (
              <div key={u.user_id} className="flex items-center gap-2.5 py-2 px-2 sm:px-3 rounded-lg hover:bg-[rgba(14,165,233,0.05)] transition-colors">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center text-[#7DD3FC] text-[11px] sm:text-xs font-bold shrink-0">
                  {(u.name || "?")[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-[#F0F9FF] font-medium truncate">{u.name || "Usuário"}</p>
                  {u.username && <p className="text-[10px] text-[#7DD3FC]/50 truncate">@{u.username}</p>}
                </div>
                <span className="text-[10px] text-[#7DD3FC]/60 shrink-0 whitespace-nowrap">
                  {formatDistanceToNow(new Date(u.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Últimos produtos cadastrados (visualização) */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm font-semibold text-[#7DD3FC] flex items-center gap-2">
            <Package className="h-4 w-4" />
            Últimos Produtos Cadastrados ({recentListings.length})
          </h3>
          <span className="text-[10px] text-[#7DD3FC]/50">apenas visualização</span>
        </div>
        {recentListings.length === 0 ? (
          <p className="text-[#7DD3FC]/50 text-sm text-center py-8">Nenhum produto cadastrado</p>
        ) : (
          <div className="space-y-1">
            {recentListings.map((p: any) => (
              <div key={p.id} className="flex items-center gap-2.5 py-2 px-2 sm:px-3 rounded-lg hover:bg-[rgba(14,165,233,0.05)] transition-colors">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-[#0ea5e9]/10 overflow-hidden shrink-0 flex items-center justify-center">
                  {p.screenshots?.[0] ? (
                    <img src={p.screenshots[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-4 w-4 text-[#7DD3FC]/60" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-[#F0F9FF] font-medium truncate">{p.title}</p>
                  <p className="text-[10px] text-[#7DD3FC]/60 truncate">
                    {p.category} · <span className={p.status === "active" ? "text-emerald-400" : "text-[#7DD3FC]/50"}>{p.status}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs sm:text-sm font-bold text-[#F0F9FF]">{formatBRL(Number(p.price))}</p>
                  <p className="text-[10px] text-[#7DD3FC]/60 whitespace-nowrap">
                    {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
