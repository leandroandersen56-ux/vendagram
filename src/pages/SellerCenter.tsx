import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DollarSign, Package, Star, Eye, ClipboardList, MessageCircle,
  BarChart3, Wallet, PlusCircle, ChevronRight
} from "lucide-react";
import PageHeader from "@/components/menu/PageHeader";

const METRICS = [
  { icon: DollarSign, label: "Faturamento", sub: "este mês", value: "R$ 4.280", color: "text-primary" },
  { icon: Package, label: "Vendas", sub: "este mês", value: "23", color: "text-primary" },
  { icon: Star, label: "Avaliação", sub: "média", value: "4.9", color: "text-[#FFB800]" },
  { icon: Eye, label: "Visualizações", sub: "nos anúncios", value: "1.240", color: "text-primary" },
];

const REP_SEGMENTS = [
  { color: "bg-destructive", label: "Vermelho" },
  { color: "bg-[#FF6900]", label: "Laranja" },
  { color: "bg-[#FFB800]", label: "Amarelo" },
  { color: "bg-[#7BC67E]", label: "Verde claro" },
  { color: "bg-success", label: "Verde" },
];

const QUICK_LINKS = [
  { icon: ClipboardList, label: "Meus anúncios", count: 12, path: "/painel/anuncios" },
  { icon: MessageCircle, label: "Perguntas sem resposta", count: 3, path: "/perguntas", urgent: true },
  { icon: Star, label: "Avaliações recebidas", count: 8, path: "/avaliacoes" },
  { icon: Wallet, label: "Saldo a receber", count: null, value: "R$ 820", path: "/carteira" },
  { icon: BarChart3, label: "Estatísticas detalhadas", count: null, path: "/vendedor/stats" },
];

export default function SellerCenter() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader
        title="Central do Vendedor"
        rightAction={
          <span className="text-[11px] bg-success/20 text-success font-bold px-2 py-1 rounded-full">
            ⭐ Platinum
          </span>
        }
      />

      <div className="px-4 pt-4 space-y-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          {METRICS.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-[#E8E8E8] p-4"
            >
              <m.icon className={`h-5 w-5 ${m.color} mb-2`} />
              <p className="text-2xl font-black text-primary">{m.value}</p>
              <p className="text-[12px] text-[#666]">{m.label}</p>
              <p className="text-[11px] text-[#999]">{m.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Reputation Bar */}
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-4">
          <p className="text-sm font-bold text-[#111] mb-2">
            Sua reputação: <span className="text-success">Platinum</span>
          </p>
          <div className="flex gap-1 h-3 rounded-full overflow-hidden">
            {REP_SEGMENTS.map((seg, i) => (
              <div
                key={i}
                className={`flex-1 ${seg.color} ${i === 4 ? "animate-pulse" : "opacity-30"}`}
              />
            ))}
          </div>
          <p className="text-[11px] text-[#999] mt-2">Baseado em suas últimas 60 vendas</p>
          <p className="text-[11px] text-[#888] mt-0.5">
            Mantenha acima de 95% de avaliações positivas para manter o Platinum
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
          {QUICK_LINKS.map((link, i) => (
            <button
              key={i}
              onClick={() => navigate(link.path)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F8F8F8] transition-colors border-b border-[#F5F5F5] last:border-b-0"
            >
              <link.icon className="h-5 w-5 text-[#444]" strokeWidth={1.5} />
              <span className="flex-1 text-left text-[14px] text-[#111]">{link.label}</span>
              {link.urgent && link.count && (
                <span className="text-[11px] bg-[#FF6900] text-white font-bold px-2 py-0.5 rounded-full">
                  {link.count}
                </span>
              )}
              {!link.urgent && link.count !== null && link.count !== undefined && (
                <span className="text-[13px] text-[#999]">({link.count})</span>
              )}
              {link.value && (
                <span className="text-[13px] text-primary font-semibold">{link.value}</span>
              )}
              <ChevronRight className="h-4 w-4 text-[#CCC]" />
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/painel/anuncios/novo")}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl text-[14px] font-bold"
        >
          <PlusCircle className="h-5 w-5" /> Criar novo anúncio
        </button>
      </div>
    </div>
  );
}
