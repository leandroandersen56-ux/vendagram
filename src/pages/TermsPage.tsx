import PageHeader from "@/components/menu/PageHeader";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 sm:pt-24 pb-16 max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Termos e Condições de Uso</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: Abril de 2026</p>

        <div className="prose prose-sm max-w-none text-foreground/90 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Definições</h2>
            <p><strong>Froiv</strong>: Plataforma online de intermediação para compra e venda de contas digitais (redes sociais e jogos).</p>
            <p><strong>Escrow</strong>: Sistema de custódia onde o pagamento do comprador é retido pela plataforma até a confirmação do recebimento.</p>
            <p><strong>Vendedor</strong>: Usuário que anuncia contas digitais para venda.</p>
            <p><strong>Comprador</strong>: Usuário que adquire contas digitais na plataforma.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Como Funciona o Escrow</h2>
            <p>Todo pagamento realizado na Froiv é protegido pelo sistema de Escrow automático:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>O comprador efetua o pagamento, que fica em custódia.</li>
              <li>O vendedor envia as credenciais de acesso da conta.</li>
              <li>O comprador tem 24 horas para verificar e confirmar o recebimento.</li>
              <li>Após a confirmação (ou expiração do prazo sem disputa), o valor é liberado ao vendedor.</li>
              <li><li>A Froiv retém uma taxa fixa de 7% sobre o valor da transação.</li></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Responsabilidades do Vendedor</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Garantir que a conta anunciada é de sua propriedade legítima.</li>
              <li>Fornecer credenciais corretas e completas após a confirmação do pagamento.</li>
              <li>Não alterar a senha ou recuperar a conta após a venda.</li>
              <li>Manter as informações do anúncio atualizadas e verídicas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Responsabilidades do Comprador</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Verificar a conta recebida dentro do prazo de 24 horas.</li>
              <li>Trocar a senha imediatamente após o primeiro acesso.</li>
              <li>Reportar problemas dentro do prazo através do sistema de disputas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Proibições</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Vender contas obtidas de forma ilícita (roubo, phishing, etc.).</li>
              <li>Criar anúncios fraudulentos ou com informações falsas.</li>
              <li>Tentar burlar o sistema de Escrow realizando transações fora da plataforma.</li>
              <li>Utilizar a plataforma para lavagem de dinheiro ou atividades ilegais.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Pagamentos e Taxas</h2>
            <p><p>A Froiv cobra uma taxa fixa de <strong>7%</strong> sobre cada transação concluída, descontada automaticamente do valor recebido pelo vendedor. Não há mensalidade ou taxa de anúncio.</p>, descontada automaticamente do valor recebido pelo vendedor. Não há mensalidade ou taxa de anúncio.</p>
            <p>Os métodos de pagamento aceitos são: Pix (aprovação instantânea) e Cartão de Crédito (parcelamento em até 12x).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Disputas</h2>
            <p>Em caso de problemas com a transação, o comprador pode abrir uma disputa dentro do prazo de verificação. A equipe Froiv analisará o caso em até 48 horas e poderá determinar:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Reembolso integral ao comprador.</li>
              <li>Liberação do valor ao vendedor.</li>
              <li>Acordo entre as partes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Rescisão</h2>
            <p>A Froiv reserva-se o direito de suspender ou encerrar contas que violem estes termos, sem aviso prévio, incluindo a retenção de valores em custódia para análise.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Contato</h2>
            <p>Para dúvidas sobre estes termos, entre em contato através de <a href="mailto:contato@froiv.com" className="text-primary hover:underline">contato@froiv.com</a> ou pela <a href="/ajuda" className="text-primary hover:underline">Central de Ajuda</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
