import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-custom-client";
import { supabase as cloudSupabase } from "@/integrations/supabase/client";
import { Package, Search, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

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

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: "Ativo", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  draft: { label: "Rascunho", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  sold: { label: "Vendido", color: "text-[#7DD3FC] bg-[#7DD3FC]/10 border-[#7DD3FC]/20" },
  removed: { label: "Removido", color: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
};

export default function PartnerListings() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["partner-all-listings-fn"],
    queryFn: async () => {
      // Usa edge function partner-data com service-role para ver TODOS os listings
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) return [];
      const { data, error } = await cloudSupabase.functions.invoke("partner-data", {
        body: { resource: "listings" },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) {
        console.error("[PartnerListings] fn error:", error);
        return [];
      }
      return (data as any)?.data ?? [];
    },
    refetchInterval: 60_000,
  });

  const filtered = listings.filter((l: any) => {
    const matchSearch =
      !search ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.category?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    all: listings.length,
    active: listings.filter((l: any) => l.status === "active").length,
    draft: listings.filter((l: any) => l.status === "draft").length,
    sold: listings.filter((l: any) => l.status === "sold").length,
    removed: listings.filter((l: any) => l.status === "removed").length,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="h-9 w-9 rounded-xl bg-[#0ea5e9]/15 border border-[#0ea5e9]/25 flex items-center justify-center shrink-0">
          <Package className="h-4 w-4 text-[#0ea5e9]" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#F0F9FF] leading-tight">Produtos Cadastrados</h1>
          <p className="text-xs sm:text-sm text-[#7DD3FC]">{listings.length} produtos na plataforma — apenas visualização</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-3 sm:p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7DD3FC]/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou categoria..."
            className="w-full bg-[#0a1628] border border-[rgba(14,165,233,0.15)] rounded-lg pl-10 pr-3 py-2.5 text-sm text-[#F0F9FF] placeholder:text-[#7DD3FC]/40 focus:outline-none focus:border-[#0ea5e9]/50 font-medium"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
          {(["all", "active", "draft", "sold", "removed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? "bg-[#0ea5e9] text-white"
                  : "bg-[#0a1628] text-[#7DD3FC]/70 hover:text-[#7DD3FC] border border-[rgba(14,165,233,0.15)]"
              }`}
            >
              {s === "all" ? "Todos" : statusLabels[s]?.label} ({statusCounts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-3 sm:p-5">
        {isLoading ? (
          <p className="text-[#7DD3FC]/50 text-sm text-center py-12">Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-10 w-10 text-[#7DD3FC]/30 mx-auto mb-3" />
            <p className="text-[#7DD3FC]/50 text-sm">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((p: any) => {
              const statusCfg = statusLabels[p.status] || { label: p.status, color: "text-[#7DD3FC]/60 bg-[#7DD3FC]/10 border-[#7DD3FC]/20" };
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 py-2.5 px-2 sm:px-3 rounded-lg hover:bg-[rgba(14,165,233,0.05)] transition-colors"
                >
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-[#0ea5e9]/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {p.screenshots?.[0] ? (
                      <img src={p.screenshots[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-4 w-4 text-[#7DD3FC]/60" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-[#F0F9FF] font-semibold truncate">{p.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#7DD3FC]/70 font-medium">
                        {categoryLabels[p.category] || p.category}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className="text-[10px] text-[#7DD3FC]/50 hidden sm:inline-flex items-center gap-1">
                        <Eye className="h-2.5 w-2.5" />
                        {p.views_count || 0}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs sm:text-sm font-bold text-[#F0F9FF] whitespace-nowrap">{formatBRL(Number(p.price))}</p>
                    <p className="text-[10px] text-[#7DD3FC]/60 whitespace-nowrap">
                      {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
