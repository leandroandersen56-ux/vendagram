import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/hooks/useAdminStats";
import { Search, Eye, Trash2, Pause, Play, ExternalLink, ImageOff } from "lucide-react";
import { toast } from "sonner";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active: { label: "Ativo", cls: "bg-emerald-500/20 text-emerald-400" },
  draft: { label: "Rascunho", cls: "bg-gray-500/20 text-gray-400" },
  sold: { label: "Vendido", cls: "bg-blue-500/20 text-blue-400" },
  removed: { label: "Removido", cls: "bg-red-500/20 text-red-400" },
};

export default function SuperAdminListings() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ["admin-listings", search, statusFilter],
    queryFn: async () => {
      let q = supabase.from("listings").select("*")
        .order("created_at", { ascending: false }).limit(100);
      if (statusFilter !== "all") q = q.eq("status", statusFilter as any);
      if (search) q = q.ilike("title", `%${search}%`);
      const { data } = await q;
      return data ?? [];
    },
  });

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "removed" : "active";
    const { error } = await supabase.from("listings").update({ status: newStatus }).eq("id", id);
    if (error) { toast.error("Erro ao atualizar"); return; }
    toast.success(newStatus === "active" ? "Anúncio reativado" : "Anúncio removido");
    refetch();
  };

  const filters = ["all", "active", "draft", "sold", "removed"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">Anúncios</h1>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f ? "bg-[#7c3aed] text-white" : "bg-[#1a1a2e] text-gray-400 hover:text-white"
              }`}>
              {f === "all" ? "Todos" : STATUS_MAP[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input type="text" placeholder="Buscar anúncio..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#1a1a2e] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#7c3aed]" />
      </div>

      <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["", "Título", "Plataforma", "Vendedor", "Preço", "Status", "Views", "Criado", "Ações"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] text-gray-400 uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-500">Carregando...</td></tr>
              ) : listings?.map(l => {
                const thumb = l.screenshots?.[0] || null;
                return (
                <tr key={l.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-2 w-14">
                    {thumb ? (
                      <img src={thumb} alt="" className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-white/[0.06] flex items-center justify-center">
                        <ImageOff className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white font-medium max-w-[200px] truncate">{l.title}</td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{l.category.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{(l as any).profiles?.name || "—"}</td>
                  <td className="px-4 py-3 text-emerald-400 font-medium">{formatBRL(l.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_MAP[l.status]?.cls}`}>
                      {STATUS_MAP[l.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{l.views_count}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(l.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <a href={`/listing/${l.id}`} target="_blank" className="text-gray-400 hover:text-white">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button onClick={() => toggleStatus(l.id, l.status)}
                        className={l.status === "active" ? "text-yellow-400 hover:text-yellow-300" : "text-emerald-400 hover:text-emerald-300"}>
                        {l.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
