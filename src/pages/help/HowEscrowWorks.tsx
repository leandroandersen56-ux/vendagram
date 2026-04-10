import PageHeader from "@/components/menu/PageHeader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShoppingCart, Lock, CheckCircle, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

const STEPS = [
  { icon: ShoppingCart, color: "bg-[#E8F0FF]", iconColor: "text-primary", title: "Compra realizada", desc: "O comprador escolhe a conta e realiza o pagamento via Pix ou Cartão de Crédito." },
  { icon: Lock, color: "bg-[#E8F8EF]", iconColor: "text-green-600", title: "Pagamento em custódia", desc: "O valor é retido com segurança pelo sistema Escrow da Froiv. O vendedor não recebe nada ainda." },
  { icon: CheckCircle, color: "bg-[#FFF3E0]", iconColor: "text-orange-500", title: "Verificação da conta", desc: "O comprador recebe os dados de acesso e tem 24 horas para verificar se a conta está conforme o anúncio." },
  { icon: Wallet, color: "bg-[#F3F0FF]", iconColor: "text-purple-600", title: "Liberação do pagamento", desc: "Após a confirmação do comprador (ou automaticamente após 24h), o valor é liberado na carteira do vendedor." },
];

export default function HowEscrowWorks() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20 sm:pb-0">
      <Navbar />
      <PageHeader title="Como funciona o Escrow" />
      <div className="container mx-auto px-4 pt-4 sm:pt-24 pb-16 space-y-4 max-w-3xl">
        <div className="hidden sm:block mb-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <span>/</span>
            <Link to="/ajuda" className="hover:text-foreground transition-colors">Ajuda</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Como funciona o Escrow</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Como funciona o Escrow</h1>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4">
          <h2 className="text-[15px] font-semibold text-[#111] mb-2">Proteção para comprador e vendedor</h2>
          <p className="text-[13px] text-[#666] leading-relaxed">
            O sistema Escrow da Froiv garante que o pagamento só seja liberado ao vendedor após o comprador confirmar que recebeu e verificou a conta. Toda transação é protegida.
          </p>
        </div>

        <div className="relative space-y-0">
          {STEPS.map((step, i) => (
            <div key={i} className="flex gap-3 relative">
              {i < STEPS.length - 1 && (
                <div className="absolute left-5 top-10 w-0.5 h-[calc(100%)] bg-[#E0E0E0]" />
              )}
              <div className={`h-10 w-10 rounded-full ${step.color} flex items-center justify-center shrink-0 z-10`}>
                <step.icon className={`h-5 w-5 ${step.iconColor}`} />
              </div>
              <div className="pb-6">
                <h3 className="text-[14px] font-semibold text-[#111]">{step.title}</h3>
                <p className="text-[13px] text-[#666] leading-relaxed mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#E8F8EF] rounded-2xl border border-[#C0E8D0] p-4">
          <p className="text-[13px] text-[#226644] leading-relaxed">
            <strong>Taxa:</strong> A Froiv cobra apenas 5% sobre o valor da venda. Não há mensalidade ou taxa de cadastro.
          </p>
        </div>
      </div>
      <div className="hidden sm:block"><Footer /></div>
    </div>
  );
}
