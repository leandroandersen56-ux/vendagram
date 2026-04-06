import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle, Download } from "lucide-react";

export default function SuperAdminSecurity() {
  const { data: actions, isLoading } = useQuery({
    queryKey: ["admin-actions-log"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_actions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  const { data: suspiciousUsers } = useQuery({
    queryKey: ["admin-suspicious"],
    queryFn: async () => {
      // Users with 3+ disputes
      const { data: disputeUsers } = await supabase.from("disputes")
        .select("opened_by");
      const counts: Record<string, number> = {};
      disputeUsers?.forEach(d => { counts[d.opened_by] = (counts[d.opened_by] || 0) + 1; });
      const suspicious = Object.entries(counts).filter(([, c]) => c >= 3).map(([id]) => id);

      if (suspicious.length === 0) return [];
      const { data: profiles } = await supabase.from("profiles")
        .select("user_id, name, email")
        .in("user_id", suspicious);
      return profiles?.map(p => ({ ...p, reason: `${counts[p.user_id]} disputas` })) ?? [];
    },
  });

  const exportCSV = () => {
    if (!actions?.length) return;
    const csv = ["Admin ID,Ação,Tipo,Alvo,Data"]
      .concat(actions.map(a => `${a.admin_id},${a.action},${a.target_type || ""},${a.target_id || ""},${a.created_at}`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "admin_actions.csv"; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Segurança & Logs</h1>
        <button onClick={exportCSV}
          className="bg-[#1a1a2e] border border-white/[0.06] text-gray-300 hover:text-white rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2">
          <Download className="h-4 w-4" /> Exportar CSV
        </button>
      </div>

      {/* Suspicious users */}
      {suspiciousUsers && suspiciousUsers.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Usuários suspeitos
          </h3>
          {suspiciousUsers.map(u => (
            <div key={u.user_id} className="flex items-center gap-3 bg-[#0f0f1a] rounded-lg px-4 py-3 text-sm">
              <span className="text-white flex-1">{u.name || u.email}</span>
              <span className="text-red-400 text-xs">⚠️ {u.reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action logs */}
      <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#7c3aed]" /> Auditoria de ações ({actions?.length ?? 0})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Ação", "Tipo", "Alvo", "Data"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] text-gray-400 uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-500">Carregando...</td></tr>
              ) : actions?.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-500">Nenhuma ação registrada</td></tr>
              ) : actions?.map(a => (
                <tr key={a.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white">{a.action}</td>
                  <td className="px-4 py-3 text-gray-400">{a.target_type || "—"}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{a.target_id?.slice(0, 8) || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(a.created_at).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
