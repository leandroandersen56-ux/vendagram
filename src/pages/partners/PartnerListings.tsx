import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-custom-client";
import { Package, Search, Calendar } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
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

const STATUS_COLORS: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  draft: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  sold: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  removed: "text-white/40 bg-white/5 border-white/10",
};

export default function PartnerListings() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["partner-listings-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, title, price, status, category, screenshots, stock, views_count, created_at, seller_id")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) {
        console.error("[PartnerListings] error:", error);
        return [];
      }
      return data ?? [];
    },
    refetchInterval: 60_000,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listings.filter((l: any) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${l.title ?? ""} ${categoryLabels[l.category] ?? l.category ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [listings, search, statusFilter]);

  const statusOptions = [
    { value: "all", label: "Todos" },
    { value: "active", label: "Ativos" },
    { value: "draft", label: "Rascunhos" },
    { value: "sold", label: "Vendidos" },
    { value: "removed", label: "Removidos" },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0ea5e9] mb-1.5">
            Catálogo da Plataforma
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-[#0ea5e9]" />
            Produtos cadastrados
          </h1>
          <p className="text-[13px] font-medium text-white/50 mt-1">
            Visualização completa dos anúncios — apenas leitura.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-[#7DD3FC] bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 px-3 py-1.5 rounded-full">
          {listings.length} {listings.length === 1 ? "produto" : "produtos"}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou categoria..."
            className="w-full bg-[#142952] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-[13px] font-medium text-white placeholder:text-white/40 focus:outline-none focus:border-[#0ea5e9] transition-colors"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3.5 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all ${
                statusFilter === opt.value
                  ? "bg-[#0ea5e9] text-white"
                  : "bg-[#142952] text-white/60 border border-white/[0.08] hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="bg-gradient-to-br from-[#142952] to-[#0f1f3f] rounded-2xl border border-white/[0.06] overflow-hidden">
        {isLoading ? (
          <p className="text-white/40 text-[13px] font-medium text-center py-12">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-white/40 text-[13px] font-medium text-center py-12">
            {search || statusFilter !== "all"
              ? "Nenhum produto encontrado para esses filtros."
              : "Nenhum produto cadastrado."}
          </p>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.12em] text-white/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Produto</th>
                    <th className="px-4 py-3 text-left font-semibold">Categoria</th>
                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Preço</th>
                    <th className="px-4 py-3 text-center font-semibold">Estoque</th>
                    <th className="px-4 py-3 text-center font-semibold">Views</th>
                    <th className="px-4 py-3 text-right font-semibold">Cadastrado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map((l: any) => (
                    <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-white/[0.04] overflow-hidden shrink-0 flex items-center justify-center">
                            {l.screenshots?.[0] ? (
                              <img src={l.screenshots[0]} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-4 w-4 text-white/40" />
                            )}
                          </div>
                          <p className="text-white font-semibold truncate max-w-[260px]">{l.title}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/65 font-medium whitespace-nowrap">
                        {categoryLabels[l.category] || l.category}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            STATUS_COLORS[l.status] || STATUS_COLORS.removed
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-white font-bold whitespace-nowrap">
                        {formatBRL(Number(l.price))}
                      </td>
                      <td className="px-4 py-3 text-center text-white/80 font-semibold">{l.stock}</td>
                      <td className="px-4 py-3 text-center text-white/60 font-medium">{l.views_count}</td>
                      <td className="px-4 py-3 text-right text-white/55 text-[11px] font-medium whitespace-nowrap">
                        <p>{format(new Date(l.created_at), "dd/MM/yyyy")}</p>
                        <p className="text-[10px] text-white/35">
                          {formatDistanceToNow(new Date(l.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-white/[0.04]">
              {filtered.map((l: any) => (
                <div key={l.id} className="p-3 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-white/[0.04] overflow-hidden shrink-0 flex items-center justify-center">
                    {l.screenshots?.[0] ? (
                      <img src={l.screenshots[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-4 w-4 text-white/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[13px] font-semibold truncate">{l.title}</p>
                    <p className="text-[11px] text-white/50 font-medium truncate">
                      {categoryLabels[l.category] || l.category}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-block px-1.5 py-0 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          STATUS_COLORS[l.status] || STATUS_COLORS.removed
                        }`}
                      >
                        {l.status}
                      </span>
                      <span className="text-[10px] text-white/45 font-semibold">
                        {l.views_count} views
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold text-white whitespace-nowrap">
                      {formatBRL(Number(l.price))}
                    </p>
                    <p className="text-[10px] text-white/40 font-semibold flex items-center gap-1 justify-end mt-0.5">
                      <Calendar className="h-2.5 w-2.5" />
                      {format(new Date(l.created_at), "dd/MM/yy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
