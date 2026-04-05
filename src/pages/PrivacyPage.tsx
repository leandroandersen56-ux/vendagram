import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 sm:pt-24 pb-16 max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: Abril de 2026 — Em conformidade com a LGPD (Lei nº 13.709/2018)</p>

        <div className="prose prose-sm max-w-none text-foreground/90 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Dados Coletados</h2>
            <p>Coletamos os seguintes dados pessoais:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Dados de cadastro:</strong> Nome, e-mail, CPF/CNPJ, telefone.</li>
              <li><strong>Dados de transação:</strong> Histórico de compras e vendas, valores, métodos de pagamento.</li>
              <li><strong>Dados de acesso:</strong> Endereço IP, navegador, dispositivo, horários de acesso.</li>
              <li><strong>Dados de verificação:</strong> Documentos enviados para verificação de identidade.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Como Usamos seus Dados</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Processar transações e pagamentos com segurança.</li>
              <li>Verificar identidade e prevenir fraudes.</li>
              <li>Enviar notificações sobre transações, ofertas e atualizações de conta.</li>
              <li>Mediar disputas entre compradores e vendedores.</li>
              <li>Melhorar a experiência do usuário e a segurança da plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Compartilhamento de Dados</h2>
            <p>Seus dados podem ser compartilhados com:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Processadores de pagamento:</strong> Mercado Pago, para processamento de transações.</li>
              <li><strong>Serviços de e-mail:</strong> Para envio de notificações transacionais.</li>
              <li><strong>Autoridades legais:</strong> Quando exigido por lei ou ordem judicial.</li>
            </ul>
            <p>Nunca vendemos seus dados pessoais a terceiros.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Segurança dos Dados</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Credenciais de contas são armazenadas de forma criptografada.</li>
              <li>Utilizamos HTTPS/TLS em todas as comunicações.</li>
              <li>Acesso aos dados é restrito por políticas de segurança em nível de linha (RLS).</li>
              <li>Documentos de verificação são armazenados em buckets privados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Seus Direitos (LGPD)</h2>
            <p>Conforme a Lei Geral de Proteção de Dados, você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Acesso:</strong> Solicitar uma cópia de todos os seus dados pessoais.</li>
              <li><strong>Correção:</strong> Solicitar a correção de dados incompletos ou incorretos.</li>
              <li><strong>Exclusão:</strong> Solicitar a exclusão dos seus dados (quando não houver obrigação legal de retenção).</li>
              <li><strong>Portabilidade:</strong> Solicitar a transferência dos seus dados para outra plataforma.</li>
              <li><strong>Revogação do consentimento:</strong> Revogar o consentimento para processamento a qualquer momento.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Retenção de Dados</h2>
            <p>Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política. Dados de transações são mantidos por no mínimo 5 anos para fins fiscais e legais.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Contato do Encarregado (DPO)</h2>
            <p>Para exercer seus direitos ou tirar dúvidas sobre privacidade:</p>
            <p>E-mail: <a href="mailto:privacidade@froiv.com" className="text-primary hover:underline">privacidade@froiv.com</a></p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
