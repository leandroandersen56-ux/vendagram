import PageHeader from "@/components/menu/PageHeader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Package, Clock, AlertTriangle, MessageCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function DataNotReceived() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20 sm:pb-0">
      <Navbar />
      <PageHeader title="Não recebi os dados" />
      <div className="container mx-auto px-4 pt-4 sm:pt-24 pb-16 space-y-4 max-w-3xl">
        <div className="hidden sm:block mb-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <span>/</span>
            <Link to="/ajuda" className="hover:text-foreground transition-colors">Ajuda</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Não recebi os dados</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Não recebi os dados</h1>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4">
          <h2 className="text-[15px] font-semibold text-[#111] mb-2">Ainda não recebeu os dados de acesso?</h2>
          <p className="text-[13px] text-[#666] leading-relaxed">
            Após a confirmação do pagamento, o vendedor tem até <strong>24 horas</strong> para entregar as credenciais. Em muitos casos a entrega é automática e instantânea.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4 space-y-4">
          <h3 className="text-[14px] font-semibold text-[#111]">O que verificar:</h3>
          {[
            { icon: Clock, text: "Confira se o prazo de 24h já passou. Alguns vendedores fazem entrega manual." },
            { icon: Package, text: "Verifique a página da compra — as credenciais aparecem automaticamente quando liberadas." },
            { icon: AlertTriangle, text: "Se o prazo expirou, abra uma disputa. O pagamento continua retido em Escrow." },
            { icon: MessageCircle, text: "Use o chat da transação para enviar uma mensagem ao vendedor." },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="h-8 w-8 rounded-full bg-[#FFF3E0] flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-[13px] text-[#666] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/compras")}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl text-[14px] font-semibold"
        >
          <Package className="h-5 w-5" /> Ver minhas compras
        </button>
      </div>
      <div className="hidden sm:block"><Footer /></div>
    </div>
  );
}
