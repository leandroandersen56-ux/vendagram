import PageHeader from "@/components/menu/PageHeader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, AlertTriangle, MessageCircle, Clock } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const STEPS = [
  { icon: Clock, title: "Aguarde o prazo", desc: "Após o pagamento, o vendedor tem até 24 horas para entregar os dados de acesso. Se o prazo não for cumprido, você pode abrir uma disputa." },
  { icon: AlertTriangle, title: "Verifique os dados", desc: "Ao receber as credenciais, faça login na conta e confira se tudo está conforme o anúncio (nível, seguidores, itens inclusos)." },
  { icon: ShieldCheck, title: "Confirme ou dispute", desc: "Se tudo estiver correto, confirme o recebimento. Caso contrário, abra uma disputa dentro de 24h para que nossa equipe analise." },
  { icon: MessageCircle, title: "Fale conosco", desc: "Se precisar de ajuda em qualquer etapa, use o chat da transação ou entre em contato pelo suporte." },
];

export default function PurchaseProblems() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20 sm:pb-0">
      <Navbar />
      <PageHeader title="Problemas com compra" />
      <div className="container mx-auto px-4 pt-4 sm:pt-24 pb-16 space-y-4 max-w-3xl">
        <div className="hidden sm:block mb-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <span>/</span>
            <Link to="/ajuda" className="hover:text-foreground transition-colors">Ajuda</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Problemas com compra</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Problemas com compra</h1>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4">
          <h2 className="text-[15px] font-semibold text-[#111] mb-2">O que fazer se algo deu errado?</h2>
          <p className="text-[13px] text-[#666] leading-relaxed">
            Na Froiv, todo pagamento é protegido pelo sistema Escrow. O vendedor só recebe após sua confirmação. Siga os passos abaixo para resolver qualquer problema.
          </p>
        </div>

        <div className="space-y-3">
          {STEPS.map((step, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E8E8E8] p-4 flex gap-3">
              <div className="h-10 w-10 rounded-full bg-[#FFF0F0] flex items-center justify-center shrink-0">
                <step.icon className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-[#111]">{step.title}</h3>
                <p className="text-[13px] text-[#666] leading-relaxed mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/contato")}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl text-[14px] font-semibold"
        >
          <MessageCircle className="h-5 w-5" /> Falar com suporte
        </button>
      </div>
      <div className="hidden sm:block"><Footer /></div>
    </div>
  );
}
