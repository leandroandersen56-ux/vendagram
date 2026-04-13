import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Zap, Users, Star } from "lucide-react";

const STATS = [
  { label: "Contas vendidas", value: "1.200+", icon: Zap },
  { label: "Usuários ativos", value: "3.500+", icon: Users },
  { label: "Avaliação média", value: "4.8 ★", icon: Star },
  { label: "Taxa de resolução", value: "98%", icon: Shield },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 sm:pt-24 pb-16 max-w-3xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Sobre a Froiv by Top Login</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            O marketplace mais seguro do Brasil para comprar e vender contas digitais de redes sociais e jogos.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {STATS.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <s.icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Nossa Missão</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Froiv by Top Login nasceu para resolver um problema real: a compra e venda de contas digitais sempre foi arriscada, cheia de golpes e sem garantias. Nossa missão é tornar esse mercado seguro, transparente e acessível para todos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Como Funciona</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Anuncie ou escolha uma conta</p>
                  <p className="text-sm text-muted-foreground">Vendedores criam anúncios com detalhes e screenshots. Compradores navegam e escolhem.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Pagamento protegido por Escrow</p>
                  <p className="text-sm text-muted-foreground">O valor fica em custódia até o comprador confirmar que recebeu a conta.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Entrega e verificação</p>
                  <p className="text-sm text-muted-foreground">Credenciais entregues de forma segura. O comprador tem 24h para verificar.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Contato</h2>
            <p className="text-muted-foreground">
              E-mail: <a href="mailto:contato@froiv.com" className="text-primary hover:underline">contato@froiv.com</a>
            </p>
            <p className="text-muted-foreground mt-1">
              Suporte: <a href="/ajuda" className="text-primary hover:underline">Central de Ajuda</a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
