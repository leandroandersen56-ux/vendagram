import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-custom-client";
import { usePartner } from "./PartnerGuard";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { subDays, format } from "date-fns";
import { Download } from "lucide-react";

const PARTNER_LISTING_CUTOFF = "2026-04-13T00:00:00.000Z";

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram", tiktok: "TikTok", free_fire: "Free Fire",
  youtube: "YouTube", facebook: "Facebook", valorant: "Valorant",
  fortnite: "Fortnite", roblox: "Roblox", clash_royale: "Clash Royale",
  kwai: "Kwai", twitter: "Twitter/X", other: "Outros",
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C", tiktok: "#010101", free_fire: "#FF6B00",
  youtube: "#FF0000", facebook: "#1877F2", valorant: "#FF4655",
  fortnite: "#7B68EE", roblox: "#E74C3C", clash_royale: "#F5A623",
  kwai: "#FF7E00", twitter: "#1DA1F2", other: "#6B7280",
};

type Period = "7d" | "30d" | "90d";

export default function PartnerRevenue() {
  const partner = usePartner();
  const { user } = useAuth();
  const authUserId = user?.id;
  const pct = partner.profit_percent / 100;
  const [period, setPeriod] = useState<Period>("30d");

  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const since = subDays(new Date(), days).toISOString();

  const { data: sales = [] } = useQuery({
    queryKey: ["partner-sales", period, authUserId],
    queryFn: async () => {
      if (!authUserId) return [];

      // Busca apenas listings criados a partir do cutoff
      const { data: eligibleListings } = await supabase
        .from("listings")
        .select("id, title, category")
        .eq("seller_id", authUserId)
        .gte("created_at", PARTNER_LISTING_CUTOFF);

      if (!eligibleListings?.length) return [];
      const eligibleIds = eligibleListings.map((l) => l.id);

      const { data } = await supabase
        .from("transactions")
        .select("amount, created_at, listing_id, status")
        .eq("status", "completed")
        .eq("seller_id", authUserId)
        .gte("created_at", since)
        .in("listing_id", eligibleIds)
        .order("created_at", { ascending: false });
      if (!data?.length) return [];

      const listingMap = new Map(eligibleListings.map((l) => [l.id, l]));
      return data.map((t) => {
        const listing = listingMap.get(t.listing_id);
        return {
          ...t,
          title: listing?.title ?? "—",
          category: listing?.category ?? "other",
        };
      });
    },
    enabled: !!authUserId,
  });

  // By platform
  const platformAgg = sales.reduce<Record<string, { total: number; count: number }>>((acc, s) => {
    const cat = s.category;
    if (!acc[cat]) acc[cat] = { total: 0, count: 0 };
    acc[cat].total += Number(s.amount);
    acc[cat].count += 1;
    return acc;
  }, {});

  const totalGmv = sales.reduce((s, t) => s + Number(t.amount), 0);

  const platformChartData = Object.entries(platformAgg)
    .map(([name, { total, count }]) => ({
      name: PLATFORM_LABELS[name] || name,
      total,
      count,
      color: PLATFORM_COLORS[name] || "#6B7280",
    }))
    .sort((a, b) => b.total - a.total);

  const exportCSV = () => {
    const header = "Data,Produto,Plataforma,Valor Bruto,Sua Parte,Status\n";
    const rows = sales.map((s) =>
      `${format(new Date(s.created_at), "dd/MM/yyyy")},${s.title.replace(/,/g, " ")},${PLATFORM_LABELS[s.category] || s.category},${Number(s.amount).toFixed(2)},${(Number(s.amount) * pct).toFixed(2)},Concluída`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faturamento-froiv-${period}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#10B981]/15 border border-[#10B981]/25 flex items-center justify-center shrink-0">
            <DollarSign className="h-4 w-4 text-[#10B981]" />
          </div>
          <h1 className="text-xl font-bold text-[#F0F9FF] tracking-tight">Faturamento Detalhado</h1>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === p ? "bg-[#0ea5e9] text-white" : "bg-[#142952] text-[#7DD3FC] hover:bg-[#0ea5e9]/20"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {platformChartData.map((p) => (
          <div key={p.name} className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
              <span className="text-xs text-[#7DD3FC] font-medium">{p.name}</span>
            </div>
            <p className="text-lg font-bold text-[#F0F9FF]">{formatBRL(p.total)}</p>
            <p className="text-[10px] text-[#7DD3FC]/60">{p.count} vendas · {((p.total / (totalGmv || 1)) * 100).toFixed(1)}%</p>
            <p className="text-[10px] text-emerald-400 mt-1">Sua parte: {formatBRL(p.total * pct)}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {platformChartData.length > 0 && (
        <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-5">
          <h3 className="text-sm font-semibold text-[#7DD3FC] mb-4">Volume por Plataforma</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={platformChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,165,233,0.1)" />
              <XAxis dataKey="name" tick={{ fill: "#7DD3FC", fontSize: 10 }} />
              <YAxis tick={{ fill: "#7DD3FC", fontSize: 10 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#0f2040", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 8, color: "#F0F9FF" }}
                formatter={(v: number) => [formatBRL(v), "Volume"]}
              />
              <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[rgba(14,165,233,0.1)]">
          <h3 className="text-sm font-semibold text-[#7DD3FC]">Vendas ({sales.length})</h3>
          <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-[#0ea5e9] hover:text-[#7DD3FC]">
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(14,165,233,0.1)]">
                <th className="text-left px-4 py-3 text-[11px] text-[#7DD3FC] uppercase font-medium">Data</th>
                <th className="text-left px-4 py-3 text-[11px] text-[#7DD3FC] uppercase font-medium">Produto</th>
                <th className="text-left px-4 py-3 text-[11px] text-[#7DD3FC] uppercase font-medium hidden sm:table-cell">Plataforma</th>
                <th className="text-right px-4 py-3 text-[11px] text-[#7DD3FC] uppercase font-medium">Valor</th>
                <th className="text-right px-4 py-3 text-[11px] text-[#7DD3FC] uppercase font-medium">Sua parte</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 50).map((s, i) => (
                <tr key={i} className="border-b border-[rgba(14,165,233,0.05)] hover:bg-[rgba(14,165,233,0.05)]">
                  <td className="px-4 py-3 text-[#F0F9FF]">{format(new Date(s.created_at), "dd/MM/yy")}</td>
                  <td className="px-4 py-3 text-[#F0F9FF] max-w-[200px] truncate">{s.title}</td>
                  <td className="px-4 py-3 text-[#7DD3FC] hidden sm:table-cell">{PLATFORM_LABELS[s.category] || s.category}</td>
                  <td className="px-4 py-3 text-[#F0F9FF] text-right">{formatBRL(Number(s.amount))}</td>
                  <td className="px-4 py-3 text-emerald-400 text-right font-medium">{formatBRL(Number(s.amount) * pct)}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhuma venda no período</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
