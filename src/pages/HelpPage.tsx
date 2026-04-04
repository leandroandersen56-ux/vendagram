import { useState } from "react";
import { Search, ShoppingCart, Package, Scale, Lock, Wallet, FileText, MessageCircle, ChevronDown } from "lucide-react";
import PageHeader from "@/components/menu/PageHeader";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { icon: ShoppingCart, label: "Problemas com compra", color: "bg-[#E8F0FF]" },
  { icon: Package, label: "Não recebi os dados", color: "bg-[#FFF3E0]" },
  { icon: Scale, label: "Abrir disputa", color: "bg-[#FFF0F0]" },
  { icon: Lock, label: "Como funciona o Escrow", color: "bg-[#E8F8EF]" },
  { icon: Wallet, label: "Saque e pagamentos", color: "bg-[#F3F0FF]" },
  { icon: FileText, label: "Como anunciar", color: "bg-[#FFF8E0]" },
];

const FAQS = [
  { q: "Como funciona o Escrow?", a: "O sistema de Escrow retém o pagamento até que o comprador confirme que recebeu e verificou a conta. Após a confirmação, o valor é liberado ao vendedor." },
  { q: "Em quanto tempo recebo os dados?", a: "A maioria das contas é entregue imediatamente após a confirmação do pagamento. O prazo máximo é de 24 horas." },
  { q: "O que fazer se a conta estiver errada?", a: "Você pode abrir uma disputa dentro de 24 horas após receber os dados. Nossa equipe irá mediar a situação." },
  { q: "Como solicitar reembolso?", a: "Caso a disputa seja resolvida a seu favor, o reembolso é creditado automaticamente na sua carteira Froiv." },
  { q: "Como me tornar vendedor?", a: "Basta criar um anúncio pela Central do Vendedor. Todos os usuários verificados podem vender na plataforma." },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaqs = FAQS.filter(
    (f) => !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader title="Ajuda" />

      <div className="px-4 pt-3 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar em ajuda..."
            className="w-full h-10 pl-10 pr-4 rounded-full border border-[#DDD] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              className="bg-white rounded-xl border border-[#E8E8E8] p-4 flex flex-col items-center gap-2 hover:bg-[#F8F8F8] transition-colors"
            >
              <div className={`h-10 w-10 rounded-full ${cat.color} flex items-center justify-center`}>
                <cat.icon className="h-5 w-5 text-[#444]" />
              </div>
              <p className="text-[13px] text-[#111] font-medium text-center">{cat.label}</p>
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div>
          <h3 className="text-sm font-semibold text-[#111] mb-3">Perguntas frequentes</h3>
          <div className="space-y-2">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <span className="text-[14px] text-[#111] font-medium flex-1 pr-2">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-4 w-4 text-[#999] shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-[13px] text-[#666] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl text-[14px] font-semibold">
          <MessageCircle className="h-5 w-5" /> Falar com suporte
        </button>
      </div>
    </div>
  );
}
