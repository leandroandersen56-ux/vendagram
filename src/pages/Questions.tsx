import { useState } from "react";
import PageHeader from "@/components/menu/PageHeader";
import { HelpCircle } from "lucide-react";

const MOCK_QUESTIONS = [
  {
    id: 1,
    product: "Conta Instagram 50K - Fitness",
    thumb: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=96&h=96&fit=crop",
    question: "A conta vem com email?",
    answer: "Sim, vem com email original vinculado.",
    time: "há 2 dias",
    answered: true,
  },
  {
    id: 2,
    product: "TikTok 120K - Humor",
    thumb: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=96&h=96&fit=crop",
    question: "Aceita parcelamento?",
    answer: null,
    time: "há 1 dia",
    answered: false,
  },
];

export default function Questions() {
  const [tab, setTab] = useState<"made" | "received">("made");

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader title="Minhas Perguntas" />

      <div className="px-4 pt-3">
        <div className="flex gap-0 bg-white rounded-xl border border-[#E8E8E8] overflow-hidden mb-4">
          {[
            { key: "made" as const, label: "Perguntas feitas" },
            { key: "received" as const, label: "Perguntas recebidas" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-[13px] font-medium transition-colors ${
                tab === t.key ? "bg-primary text-white" : "text-[#666]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {MOCK_QUESTIONS.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="h-16 w-16 text-[#DDD] mx-auto mb-3" strokeWidth={1} />
            <p className="text-[#333] font-semibold">Nenhuma pergunta ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {MOCK_QUESTIONS.map((q) => (
              <div key={q.id} className="bg-white rounded-xl border border-[#F0F0F0] p-4">
                <div className="flex gap-3 items-start">
                  <img src={q.thumb} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#666] truncate">{q.product}</p>
                    <p className="text-[14px] text-[#333] mt-1">"{q.question}"</p>
                    {q.answer ? (
                      <p className="text-[13px] text-success mt-1">→ "{q.answer}"</p>
                    ) : (
                      <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-[#FF6900]/10 text-[#FF6900] font-medium">
                        Aguardando resposta
                      </span>
                    )}
                    <p className="text-[11px] text-[#999] mt-1">{q.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
