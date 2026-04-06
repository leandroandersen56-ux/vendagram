import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/hooks/useAdminStats";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendente", cls: "bg-yellow-500/20 text-yellow-400" },
  processing: { label: "Processando", cls: "bg-blue-500/20 text-blue-400" },
  processed: { label: "Concluído", cls: "bg-emerald-500/20 text-emerald-400" },
  rejected: { label: "Rejeitado", cls: "bg-red-500/20 text-red-400" },
};

export default function SuperAdminWithdrawals() {
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: withdrawals, isLoading, refetch } = useQuery({
    queryKey: ["admin-withdrawals", filter],
    queryFn: async () => {
      let q = supabase.from("withdrawals")
        .select("*, profiles!withdrawals_user_id_fkey(name, email)")
        .order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter as any);
      const { data } = await q;
      return data ?? [];
    },
  });

  const processWithdrawal = async (id: string, action: "processed" | "rejected") => {
    const { error } = await supabase.from("withdrawals").update({
      status: action,
      processed_at: new Date().toISOString(),
    }).eq("id", id);

    if (error) { toast.error("Erro ao processar"); return; }

    await supabase.from("admin_actions").insert({
      admin_id: (await supabase.auth.getUser()).data.user?.id ?? "",
      action: `withdrawal_${action}`,
      target_type: "withdrawal",
      target_id: id,
    });

    toast.success(action === "processed" ? "Saque processado!" : "Saque rejeitado");
    refetch();
  };

  const processBatch = async () => {
    for (const id of selected) {
      await processWithdrawal(id, "processed");
    }
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const pendingTotal = withdrawals?.filter(w => w.status === "pending").reduce((s, w) => s + Number(w.amount), 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">Saques</h1>
        <div className="flex gap-2">
          {["pending", "processing", "processed", "rejected", "all"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? "bg-[#7c3aed] text-white" : "bg-[#1a1a2e] text-gray-400 hover:text-white"
              }`}>
              {f === "all" ? "Todos" : STATUS_MAP[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {filter === "pending" && pendingTotal > 0 && (
        <div className="bg-[#1e1e35] rounded-xl border border-yellow-500/20 p-4 flex items-center justify-between">
          <div>
            <p className="text-yellow-400 text-sm font-medium">Total pendente</p>
            <p className="text-2xl font-black text-white">{formatBRL(pendingTotal)}</p>
          </div>
          {selected.size > 0 && (
            <button onClick={processBatch}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Processar {selected.size} selecionados
            </button>
          )}
        </div>
      )}

      <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {filter === "pending" && <th className="px-4 py-3 w-10"></th>}
                {["Usuário", "Valor", "Chave Pix", "Status", "Solicitado", "Ações"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] text-gray-400 uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">Carregando...</td></tr>
              ) : withdrawals?.map(w => (
                <tr key={w.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  {filter === "pending" && (
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(w.id)} onChange={() => toggleSelect(w.id)}
                        className="rounded border-gray-600" />
                    </td>
                  )}
                  <td className="px-4 py-3 text-white">{(w as any).profiles?.name || "—"}</td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">{formatBRL(w.amount)}</td>
                  <td className="px-4 py-3 text-gray-300 text-xs font-mono">{w.pix_key}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_MAP[w.status]?.cls}`}>
                      {STATUS_MAP[w.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(w.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3">
                    {w.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => processWithdrawal(w.id, "processed")}
                          className="text-emerald-400 hover:text-emerald-300"><CheckCircle className="h-4 w-4" /></button>
                        <button onClick={() => processWithdrawal(w.id, "rejected")}
                          className="text-red-400 hover:text-red-300"><XCircle className="h-4 w-4" /></button>
                      </div>
                    )}
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
