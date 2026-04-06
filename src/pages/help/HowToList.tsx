import PageHeader from "@/components/menu/PageHeader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, Camera, Lock, Megaphone, DollarSign } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const STEPS = [
  { icon: Megaphone, color: "bg-[#FFF8E0]", iconColor: "text-yellow-600", title: "Selecione a plataforma", desc: "Escolha a categoria da conta: Instagram, Free Fire, TikTok, etc." },
  { icon: FileText, color: "bg-[#E8F0FF]", iconColor: "text-primary", title: "Preencha os dados", desc: "Título, descrição, nível, seguidores e o que está incluso na conta." },
  { icon: Camera, color: "bg-[#F3F0FF]", iconColor: "text-purple-600", title: "Adicione fotos", desc: "Envie até 6 screenshots da conta. Boas fotos aumentam as vendas." },
  { icon: Lock, color: "bg-[#E8F8EF]", iconColor: "text-green-600", title: "Cadastre as credenciais", desc: "Login e senha são criptografados e entregues automaticamente ao comprador após o pagamento." },
  { icon: DollarSign, color: "bg-[#FFF3E0]", iconColor: "text-orange-500", title: "Defina o preço", desc: "Escolha o valor e se aceita ofertas. A Froiv cobra 10% apenas quando a venda é concluída." },
];

export default function HowToList() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20 sm:pb-0">
      <Navbar />
      <PageHeader title="Como anunciar" />
      <div className="container mx-auto px-4 pt-4 sm:pt-24 pb-16 space-y-4 max-w-3xl">
        <div className="hidden sm:block mb-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <span>/</span>
            <Link to="/ajuda" className="hover:text-foreground transition-colors">Ajuda</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Como anunciar</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Como anunciar</h1>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4">
          <h2 className="text-[15px] font-semibold text-[#111] mb-2">Venda suas contas na Froiv</h2>
          <p className="text-[13px] text-[#666] leading-relaxed">
            Qualquer usuário pode vender. Não há mensalidade ou taxa de cadastro. Crie seu anúncio em minutos seguindo os passos abaixo.
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

        <button
          onClick={() => navigate("/vendedor/novo")}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl text-[14px] font-semibold"
        >
          <FileText className="h-5 w-5" /> Criar meu anúncio
        </button>
      </div>
      <div className="hidden sm:block"><Footer /></div>
    </div>
  );
}
