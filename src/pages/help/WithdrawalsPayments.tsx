import PageHeader from "@/components/menu/PageHeader";
import { Wallet, CreditCard, QrCode, Clock, ArrowDownToLine } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WithdrawalsPayments() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader title="Saque e pagamentos" />
      <div className="px-4 pt-4 space-y-4">
        {/* Payment methods */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4">
          <h2 className="text-[15px] font-semibold text-[#111] mb-3">Formas de pagamento</h2>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="h-8 w-8 rounded-full bg-[#E8F8EF] flex items-center justify-center shrink-0">
                <QrCode className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold text-[#111]">Pix</h4>
                <p className="text-[12px] text-[#666]">Aprovação instantânea. Sem taxa adicional.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="h-8 w-8 rounded-full bg-[#F3F0FF] flex items-center justify-center shrink-0">
                <CreditCard className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold text-[#111]">Cartão de Crédito</h4>
                <p className="text-[12px] text-[#666]">Visa, Mastercard, Elo, Amex e Hipercard. Até 12x.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawals */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4">
          <h2 className="text-[15px] font-semibold text-[#111] mb-3">Como sacar</h2>
          <div className="space-y-3">
            {[
              { icon: Wallet, text: "Acesse sua Carteira e clique em 'Sacar'." },
              { icon: ArrowDownToLine, text: "Informe sua chave Pix e o valor (mínimo R$ 20,00)." },
              { icon: Clock, text: "O processamento leva até 1 dia útil." },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="h-8 w-8 rounded-full bg-[#E8F0FF] flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-[13px] text-[#666] leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4">
          <h3 className="text-[14px] font-semibold text-[#111] mb-2">Chaves Pix aceitas</h3>
          <p className="text-[13px] text-[#666] leading-relaxed">CPF, CNPJ, E-mail, Telefone e Chave Aleatória.</p>
        </div>

        <button
          onClick={() => navigate("/carteira")}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl text-[14px] font-semibold"
        >
          <Wallet className="h-5 w-5" /> Ir para minha carteira
        </button>
      </div>
    </div>
  );
}
