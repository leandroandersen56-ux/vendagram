import { Copy } from "lucide-react";
import PageHeader from "@/components/menu/PageHeader";
import { toast } from "sonner";

const HISTORY = [
  { date: "15/03", product: "Instagram 50K", value: "R$ 819,99", commission: "R$ 82,00", status: "Pago" },
  { date: "12/03", product: "TikTok 120K", value: "R$ 1.200", commission: "R$ 120,00", status: "Pendente" },
  { date: "08/03", product: "Free Fire Lv80", value: "R$ 450", commission: "R$ 45,00", status: "Pago" },
];

export default function Affiliates() {
  const handleCopy = () => {
    navigator.clipboard.writeText("froiv.com/ref/usuario");
    toast.success("Link copiado!");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader
        title="Afiliados"
        rightAction={
          <span className="text-[10px] bg-success text-white font-bold px-2 py-0.5 rounded-full">GANHA $</span>
        }
      />

      <div className="px-4 pt-4 space-y-4">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#064E3B] to-[#065F46] rounded-2xl p-6 text-white">
          <p className="text-2xl font-black">💰 Ganhe 10% de comissão</p>
          <p className="text-sm text-white/80 mt-1">Por cada venda indicada pelo seu link</p>
          <div className="mt-4 bg-white/10 rounded-xl px-4 py-3 flex items-center gap-2">
            <p className="text-sm font-mono flex-1 truncate text-white/90">froiv.com/ref/usuario</p>
            <button onClick={handleCopy} className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Copy className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Indicações", value: "32" },
            { label: "Conversões", value: "8" },
            { label: "Ganho total", value: "R$ 248" },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-xl border border-[#E8E8E8] p-3 text-center">
              <p className="text-lg font-black text-primary">{m.value}</p>
              <p className="text-[11px] text-[#666]">{m.label}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-4">
          <h3 className="text-sm font-bold text-[#111] mb-3">Como funciona</h3>
          {[
            "Copie seu link de afiliado",
            "Compartilhe em redes sociais, grupos, Discord",
            "Ganhe 10% de cada venda realizada",
          ].map((step, i) => (
            <div key={i} className="flex gap-3 items-start mb-2.5 last:mb-0">
              <div className="h-6 w-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <p className="text-[13px] text-[#333] pt-0.5">{step}</p>
            </div>
          ))}
        </div>

        {/* Commission History */}
        <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
          <h3 className="text-sm font-bold text-[#111] px-4 pt-4 pb-2">Histórico de comissões</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#F0F0F0]">
                  <th className="text-left px-4 py-2 text-[11px] text-[#999] font-medium">Data</th>
                  <th className="text-left px-4 py-2 text-[11px] text-[#999] font-medium">Produto</th>
                  <th className="text-right px-4 py-2 text-[11px] text-[#999] font-medium">Comissão</th>
                  <th className="text-right px-4 py-2 text-[11px] text-[#999] font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {HISTORY.map((h, i) => (
                  <tr key={i} className="border-b border-[#F5F5F5] last:border-b-0">
                    <td className="px-4 py-2.5 text-[#666]">{h.date}</td>
                    <td className="px-4 py-2.5 text-[#111]">{h.product}</td>
                    <td className="px-4 py-2.5 text-right text-success font-semibold">{h.commission}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        h.status === "Pago" ? "bg-success/10 text-success" : "bg-[#FF6900]/10 text-[#FF6900]"
                      }`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
