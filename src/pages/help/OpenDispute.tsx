import PageHeader from "@/components/menu/PageHeader";
import { Scale, ShieldCheck, Clock, FileText, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { num: "1", title: "Acesse a compra", desc: "Vá em 'Minhas Compras' e abra a transação com problema." },
  { num: "2", title: "Clique em 'Abrir Disputa'", desc: "Descreva o problema com detalhes e, se possível, envie prints." },
  { num: "3", title: "Análise da equipe", desc: "Nossa equipe analisa a disputa em até 48 horas, com acesso às evidências de ambos os lados." },
  { num: "4", title: "Resolução", desc: "A disputa pode resultar em reembolso ao comprador, liberação ao vendedor, ou acordo entre as partes." },
];

export default function OpenDispute() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader title="Abrir disputa" />
      <div className="px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4">
          <h2 className="text-[15px] font-semibold text-[#111] mb-2">Quando abrir uma disputa?</h2>
          <p className="text-[13px] text-[#666] leading-relaxed">
            Abra uma disputa quando os dados de acesso estiverem incorretos, a conta não corresponder ao anúncio, ou quando houver qualquer problema após o pagamento. Você tem <strong>24 horas</strong> após receber os dados para solicitar.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4">
          <h3 className="text-[14px] font-semibold text-[#111] mb-3">Como funciona</h3>
          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="h-8 w-8 rounded-full bg-[#FFF0F0] flex items-center justify-center shrink-0">
                  <span className="text-[13px] font-bold text-red-500">{step.num}</span>
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-[#111]">{step.title}</h4>
                  <p className="text-[12px] text-[#666] leading-relaxed mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#FFF8E0] rounded-2xl border border-[#F0E0A0] p-4">
          <p className="text-[13px] text-[#886600] leading-relaxed">
            <strong>Importante:</strong> O pagamento permanece retido em Escrow durante toda a análise. Nenhum valor é liberado ao vendedor até a resolução.
          </p>
        </div>

        <button
          onClick={() => navigate("/compras")}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl text-[14px] font-semibold"
        >
          <Scale className="h-5 w-5" /> Ir para minhas compras
        </button>
      </div>
    </div>
  );
}
