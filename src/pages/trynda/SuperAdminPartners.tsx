import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Handshake, Plus, X, Check, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendente", cls: "text-yellow-400 bg-yellow-400/10" },
  approved: { label: "Aprovado", cls: "text-blue-400 bg-blue-400/10" },
  processing: { label: "Processando", cls: "text-orange-400 bg-orange-400/10" },
  completed: { label: "Concluído", cls: "text-emerald-400 bg-emerald-400/10" },
  rejected: { label: "Recusado", cls: "text-red-400 bg-red-400/10" },
};

export default function SuperAdminPartners() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", pix_key: "", pix_key_type: "cpf", profit_percent: "5" });
  const [viewingWithdrawals, setViewingWithdrawals] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { data: partners = [] } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: async () => {
      const { data } = await supabase.from("partners" as any).select("*").order("created_at", { ascending: false });
      return (data as any[]) ?? [];
    },
  });

  const { data: gmv = 0 } = useQuery({
    queryKey: ["partner-gmv"],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("amount").eq("status", "completed");
      return data?.reduce((s, t) => s + Number(t.amount), 0) ?? 0;
    },
  });

  const { data: allWithdrawals = [] } = useQuery({
    queryKey: ["admin-partner-withdrawals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("partner_withdrawals" as any)
        .select("*")
        .order("requested_at", { ascending: false });
      return (data as any[]) ?? [];
    },
  });

  const pendingWithdrawals = allWithdrawals.filter((w: any) => w.status === "pending");
  const totalPending = pendingWithdrawals.reduce((s: number, w: any) => s + Number(w.amount), 0);

  const handleAdd = async () => {
    const { error } = await supabase.from("partners" as any).insert({
      name: form.name,
      email: form.email,
      pix_key: form.pix_key || null,
      pix_key_type: form.pix_key_type,
      profit_percent: parseFloat(form.profit_percent),
    } as any);
    if (error) {
      toast.error("Erro: " + error.message);
    } else {
      toast.success("Sócio adicionado!");
      setShowAdd(false);
      setForm({ name: "", email: "", pix_key: "", pix_key_type: "cpf", profit_percent: "5" });
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("partners" as any).update({ is_active: !active } as any).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
    toast.success(active ? "Sócio desativado" : "Sócio ativado");
  };

  const approveWithdrawal = async (id: string) => {
    await supabase.from("partner_withdrawals" as any).update({ status: "approved", processed_at: new Date().toISOString() } as any).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-partner-withdrawals"] });
    toast.success("Saque aprovado!");
  };

  const rejectWithdrawal = async (id: string) => {
    await supabase.from("partner_withdrawals" as any).update({ status: "rejected", notes: rejectReason, processed_at: new Date().toISOString() } as any).eq("id", id);
    setRejectingId(null);
    setRejectReason("");
    queryClient.invalidateQueries({ queryKey: ["admin-partner-withdrawals"] });
    toast.success("Saque recusado");
  };

  const getPartnerBalance = (p: any) => {
    const share = gmv * (Number(p.profit_percent) / 100);
    const withdrawn = allWithdrawals
      .filter((w: any) => w.partner_id === p.id && ["completed", "processing", "approved"].includes(w.status))
      .reduce((s: number, w: any) => s + Number(w.amount), 0);
    return Math.max(0, share - withdrawn);
  };

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] p-5 flex items-center gap-4">
        <Handshake className="h-8 w-8 text-[#0ea5e9]" />
        <div className="flex-1">
          <h2 className="text-base font-bold text-white">🤝 Sócios</h2>
          <p className="text-sm text-gray-400">
            Total a pagar: <span className="text-[#0ea5e9] font-bold">{formatBRL(totalPending)}</span>
            {pendingWithdrawals.length > 0 && (
              <span className="ml-2 text-yellow-400">({pendingWithdrawals.length} pendente{pendingWithdrawals.length > 1 ? "s" : ""})</span>
            )}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Novo Sócio
        </button>
      </div>

      {/* Partners list */}
      <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-[11px] text-gray-400 uppercase">Nome</th>
                <th className="text-left px-4 py-3 text-[11px] text-gray-400 uppercase hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-[11px] text-gray-400 uppercase hidden md:table-cell">Pix</th>
                <th className="text-center px-4 py-3 text-[11px] text-gray-400 uppercase">%</th>
                <th className="text-right px-4 py-3 text-[11px] text-gray-400 uppercase">A receber</th>
                <th className="text-center px-4 py-3 text-[11px] text-gray-400 uppercase">Status</th>
                <th className="text-center px-4 py-3 text-[11px] text-gray-400 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p: any) => (
                <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{p.email}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">{p.pix_key || "—"}</td>
                  <td className="px-4 py-3 text-center text-[#0ea5e9] font-bold">{p.profit_percent}%</td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-medium">{formatBRL(getPartnerBalance(p))}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${p.is_active ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
                      {p.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setViewingWithdrawals(viewingWithdrawals === p.id ? null : p.id)}
                        className="text-gray-400 hover:text-white text-xs"
                        title="Ver saques"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(p.id, p.is_active)}
                        className={`text-xs px-2 py-1 rounded ${p.is_active ? "text-red-400 hover:bg-red-400/10" : "text-emerald-400 hover:bg-emerald-400/10"}`}
                      >
                        {p.is_active ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending withdrawals */}
      {pendingWithdrawals.length > 0 && (
        <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white">⏳ Saques Pendentes</h3>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {pendingWithdrawals.map((w: any) => {
              const p = partners.find((pp: any) => pp.id === w.partner_id);
              return (
                <div key={w.id} className="p-4 flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{p?.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{w.pix_key} · {format(new Date(w.requested_at), "dd/MM/yy HH:mm")}</p>
                  </div>
                  <span className="text-lg font-bold text-[#0ea5e9]">{formatBRL(Number(w.amount))}</span>
                  {rejectingId === w.id ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Motivo da recusa"
                        className="bg-[#0f0f1a] border border-white/[0.08] rounded px-2 py-1 text-white text-xs flex-1"
                      />
                      <button onClick={() => rejectWithdrawal(w.id)} className="text-red-400 hover:bg-red-400/10 p-1 rounded">
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button onClick={() => setRejectingId(null)} className="text-gray-400 p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => approveWithdrawal(w.id)} className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-500/30">
                        <Check className="h-3.5 w-3.5" /> Aprovar
                      </button>
                      <button onClick={() => setRejectingId(w.id)} className="flex items-center gap-1 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/30">
                        <X className="h-3.5 w-3.5" /> Recusar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Viewing withdrawals for a specific partner */}
      {viewingWithdrawals && (
        <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              Saques — {partners.find((p: any) => p.id === viewingWithdrawals)?.name}
            </h3>
            <button onClick={() => setViewingWithdrawals(null)} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-2 text-[11px] text-gray-400">Data</th>
                <th className="text-right px-4 py-2 text-[11px] text-gray-400">Valor</th>
                <th className="text-center px-4 py-2 text-[11px] text-gray-400">Status</th>
                <th className="text-left px-4 py-2 text-[11px] text-gray-400">Notas</th>
              </tr>
            </thead>
            <tbody>
              {allWithdrawals
                .filter((w: any) => w.partner_id === viewingWithdrawals)
                .map((w: any) => {
                  const st = STATUS_MAP[w.status] ?? STATUS_MAP.pending;
                  return (
                    <tr key={w.id} className="border-b border-white/[0.04]">
                      <td className="px-4 py-2 text-white">{format(new Date(w.requested_at), "dd/MM/yy")}</td>
                      <td className="px-4 py-2 text-right text-white font-medium">{formatBRL(Number(w.amount))}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-2 text-gray-400 text-xs">{w.notes || "—"}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1a1a2e] rounded-xl border border-white/[0.08] p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Adicionar Sócio</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            {[
              { label: "Nome", key: "name", type: "text" },
              { label: "Email", key: "email", type: "email" },
              { label: "Chave Pix", key: "pix_key", type: "text" },
              { label: "Participação (%)", key: "profit_percent", type: "number" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                <input
                  type={f.type}
                  value={(form as any)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full bg-[#0f0f1a] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7c3aed]"
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tipo Pix</label>
              <select
                value={form.pix_key_type}
                onChange={(e) => setForm({ ...form, pix_key_type: e.target.value })}
                className="w-full bg-[#0f0f1a] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7c3aed]"
              >
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">Email</option>
                <option value="telefone">Telefone</option>
                <option value="aleatoria">Aleatória</option>
              </select>
            </div>
            <button
              onClick={handleAdd}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg py-2.5 text-sm font-medium"
            >
              Adicionar Sócio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
