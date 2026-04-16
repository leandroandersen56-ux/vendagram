import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-custom-client";
import { usePartner } from "./PartnerGuard";
import { Wallet, AlertTriangle, Pencil } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "text-yellow-400 bg-yellow-400/10" },
  approved: { label: "Aprovado", color: "text-[#0ea5e9] bg-[#0ea5e9]/10" },
  processing: { label: "Processando", color: "text-orange-400 bg-orange-400/10" },
  completed: { label: "Concluído", color: "text-emerald-400 bg-emerald-400/10" },
  rejected: { label: "Recusado", color: "text-red-400 bg-red-400/10" },
};

export default function PartnerWithdrawal() {
  const partner = usePartner();
  const queryClient = useQueryClient();
  const pct = partner.profit_percent / 100;
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [newPixKey, setNewPixKey] = useState(partner.pix_key ?? "");
  const [newPixType, setNewPixType] = useState(partner.pix_key_type ?? "cpf");

  const { data: gmv = 0 } = useQuery({
    queryKey: ["partner-gmv"],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("amount").eq("status", "completed");
      return data?.reduce((s, t) => s + Number(t.amount), 0) ?? 0;
    },
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ["partner-withdrawals", partner.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("partner_withdrawals" as any)
        .select("*")
        .eq("partner_id", partner.id)
        .order("requested_at", { ascending: false });
      return (data as any[]) ?? [];
    },
  });

  const withdrawn = withdrawals
    .filter((w: any) => ["completed", "processing", "approved"].includes(w.status))
    .reduce((s: number, w: any) => s + Number(w.amount), 0);

  const available = Math.max(0, gmv * pct - withdrawn);

  const handleWithdraw = async () => {
    const val = parseFloat(amount.replace(",", "."));
    if (!val || val <= 0 || val > available) {
      toast.error("Valor inválido");
      return;
    }
    if (!partner.pix_key) {
      toast.error("Cadastre sua chave Pix primeiro");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("partner_withdrawals" as any).insert({
      partner_id: partner.id,
      amount: val,
      pix_key: partner.pix_key,
    } as any);
    setSubmitting(false);
    if (error) {
      toast.error("Erro ao solicitar saque");
      console.error(error);
    } else {
      toast.success("Saque solicitado com sucesso!");
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["partner-withdrawals"] });
    }
  };

  const handleUpdatePix = async () => {
    const { error } = await supabase
      .from("partners" as any)
      .update({ pix_key: newPixKey, pix_key_type: newPixType } as any)
      .eq("id", partner.id);
    if (error) {
      toast.error("Erro ao atualizar Pix");
    } else {
      toast.success("Chave Pix atualizada!");
      partner.pix_key = newPixKey;
      partner.pix_key_type = newPixType;
      setShowPixModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-[#0ea5e9]/15 border border-[#0ea5e9]/25 flex items-center justify-center shrink-0">
          <Wallet className="h-4 w-4 text-[#0ea5e9]" />
        </div>
        <h1 className="text-xl font-bold text-[#F0F9FF] tracking-tight">Meu Saque</h1>
      </div>

      {/* Balance card */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-6">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="h-5 w-5 text-[#0ea5e9]" />
          <span className="text-sm text-[#7DD3FC]">Disponível para saque</span>
        </div>
        <p className="text-3xl font-black text-[#F0F9FF] mb-3">{formatBRL(available)}</p>
        <div className="flex items-center gap-2 text-xs text-[#7DD3FC]/70">
          <span>Chave Pix: {partner.pix_key || "Não cadastrada"}</span>
          <button onClick={() => setShowPixModal(true)} className="text-[#0ea5e9] hover:text-[#7DD3FC]">
            <Pencil className="h-3 w-3 inline" /> Alterar
          </button>
        </div>
      </div>

      {/* Withdraw form */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[#7DD3FC]">Solicitar Saque</h3>
        <div>
          <label className="text-xs text-[#7DD3FC]/70 mb-1 block">Valor a sacar (máx: {formatBRL(available)})</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="w-full bg-[#0a1628] border border-[rgba(14,165,233,0.15)] rounded-lg px-3 py-2.5 text-[#F0F9FF] text-sm focus:outline-none focus:border-[#0ea5e9]"
          />
        </div>
        <button
          onClick={handleWithdraw}
          disabled={submitting || !amount}
          className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {submitting ? "Solicitando..." : "Solicitar saque"}
        </button>

        <div className="flex items-start gap-2 bg-[#F59E0B]/10 rounded-lg p-3">
          <AlertTriangle className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />
          <div className="text-[11px] text-[#F59E0B] space-y-1">
            <p>⚠️ Saques são processados pelo administrador em até 2 dias úteis.</p>
            <p>Apenas chaves Pix autorizadas pelo administrador podem receber.</p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] overflow-hidden">
        <div className="p-4 border-b border-[rgba(14,165,233,0.1)]">
          <h3 className="text-sm font-semibold text-[#7DD3FC]">Histórico de Saques</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(14,165,233,0.1)]">
                <th className="text-left px-4 py-3 text-[11px] text-[#7DD3FC] uppercase font-medium">Data</th>
                <th className="text-right px-4 py-3 text-[11px] text-[#7DD3FC] uppercase font-medium">Valor</th>
                <th className="text-left px-4 py-3 text-[11px] text-[#7DD3FC] uppercase font-medium hidden sm:table-cell">Pix</th>
                <th className="text-center px-4 py-3 text-[11px] text-[#7DD3FC] uppercase font-medium">Status</th>
                <th className="text-left px-4 py-3 text-[11px] text-[#7DD3FC] uppercase font-medium hidden sm:table-cell">Processado</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w: any) => {
                const st = STATUS_MAP[w.status] ?? STATUS_MAP.pending;
                return (
                  <tr key={w.id} className="border-b border-[rgba(14,165,233,0.05)]">
                    <td className="px-4 py-3 text-[#F0F9FF]">{format(new Date(w.requested_at), "dd/MM/yy")}</td>
                    <td className="px-4 py-3 text-[#F0F9FF] text-right font-medium">{formatBRL(Number(w.amount))}</td>
                    <td className="px-4 py-3 text-[#7DD3FC] text-xs hidden sm:table-cell">{w.pix_key}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                      {w.status === "rejected" && w.notes && (
                        <p className="text-[10px] text-red-400 mt-1">{w.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#7DD3FC] text-xs hidden sm:table-cell">
                      {w.processed_at ? format(new Date(w.processed_at), "dd/MM/yy") : "—"}
                    </td>
                  </tr>
                );
              })}
              {withdrawals.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhum saque realizado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pix Modal */}
      {showPixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0f2040] rounded-xl border border-[rgba(14,165,233,0.15)] p-6 w-full max-w-sm space-y-4">
            <h3 className="text-base font-semibold text-[#F0F9FF]">Alterar Chave Pix</h3>
            <div>
              <label className="text-xs text-[#7DD3FC] mb-1 block">Tipo</label>
              <select
                value={newPixType}
                onChange={(e) => setNewPixType(e.target.value)}
                className="w-full bg-[#0a1628] border border-[rgba(14,165,233,0.15)] rounded-lg px-3 py-2 text-[#F0F9FF] text-sm focus:outline-none focus:border-[#0ea5e9]"
              >
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">Email</option>
                <option value="telefone">Telefone</option>
                <option value="aleatoria">Aleatória</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#7DD3FC] mb-1 block">Chave</label>
              <input
                type="text"
                value={newPixKey}
                onChange={(e) => setNewPixKey(e.target.value)}
                className="w-full bg-[#0a1628] border border-[rgba(14,165,233,0.15)] rounded-lg px-3 py-2.5 text-[#F0F9FF] text-sm focus:outline-none focus:border-[#0ea5e9]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPixModal(false)}
                className="flex-1 bg-[#142952] text-[#7DD3FC] rounded-lg py-2 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdatePix}
                className="flex-1 bg-[#0ea5e9] text-white rounded-lg py-2 text-sm font-medium"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
