import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Lock, CheckCircle2, ArrowRight, Star, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { MOCK_LISTINGS, PLATFORMS } from "@/lib/mock-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-hero overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(hsl(263 70% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(263 70% 50%) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="container mx-auto px-4 text-center relative z-10 pt-16">
          <motion.div initial="hidden" animate="visible" className="max-w-4xl mx-auto">
            <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-8">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Escrow Automático · 100% Seguro</span>
            </motion.div>

            <motion.h1 custom={1} variants={fadeUp} className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold tracking-tight mb-6 text-foreground">
              Compre e venda contas{" "}
              <span className="text-gradient-primary">com total</span>{" "}
              <span className="text-gradient-accent">segurança</span>
            </motion.h1>

            <motion.p custom={2} variants={fadeUp} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Marketplace automatizado com sistema de escrow. Sem intermediários, sem riscos.
              Sua transação protegida do início ao fim.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/marketplace">
                <Button variant="hero" size="lg" className="text-base px-8 py-6 animate-pulse-glow">
                  Explorar Marketplace
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
              <Link to="/create-listing">
                <Button variant="glass" size="lg" className="text-base px-8 py-6">
                  Vender Minha Conta
                </Button>
              </Link>
            </motion.div>

            {/* Trust stats */}
            <motion.div custom={4} variants={fadeUp} className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
              {[
                { value: "1.2K+", label: "Transações" },
                { value: "R$2M+", label: "Volume" },
                { value: "4.9★", label: "Avaliação" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 custom={0} variants={fadeUp} className="text-3xl font-display font-bold text-foreground mb-4">
              Como Funciona
            </motion.h2>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto">
              Três passos simples para uma transação 100% segura
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: <Star className="h-8 w-8" />, title: "1. Anuncie ou Encontre", desc: "Publique sua conta ou navegue pelo marketplace com filtros avançados." },
              { icon: <Lock className="h-8 w-8" />, title: "2. Pagamento Seguro", desc: "O comprador paga e o valor fica retido em escrow automático." },
              { icon: <CheckCircle2 className="h-8 w-8" />, title: "3. Transferência Verificada", desc: "Checklist guiado garante que tudo foi transferido antes de liberar o pagamento." },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-card border border-border rounded-lg p-8 text-center card-hover"
              >
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-6">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: <Shield className="h-6 w-6" />, title: "Escrow Automático", desc: "Pagamento retido até confirmação" },
              { icon: <Lock className="h-6 w-6" />, title: "Proteção ao Comprador", desc: "Reembolso garantido em caso de fraude" },
              { icon: <CheckCircle2 className="h-6 w-6" />, title: "Taxa só no Sucesso", desc: "10% cobrado apenas na conclusão" },
            ].map((badge) => (
              <div key={badge.title} className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="text-primary mt-0.5">{badge.icon}</div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{badge.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-display font-bold text-foreground mb-8">Categorias Populares</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {PLATFORMS.map((p) => (
              <Link to={`/marketplace?platform=${p.id}`} key={p.id}>
                <div className="flex items-center gap-2 px-5 py-3 rounded-lg bg-card border border-border card-hover cursor-pointer">
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-display font-bold text-foreground">Anúncios em Destaque</h2>
            <Link to="/marketplace">
              <Button variant="ghost" className="text-primary">
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_LISTINGS.slice(0, 3).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-display font-bold text-foreground text-center mb-10">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: "Como funciona o sistema de escrow?", a: "Quando o comprador efetua o pagamento, o valor fica retido na plataforma. Só é liberado ao vendedor após o comprador confirmar que recebeu e transferiu a conta com sucesso." },
              { q: "Qual a taxa cobrada?", a: "Cobramos 10% sobre o valor da venda, apenas quando a transação é concluída com sucesso. Se a transação for cancelada, não há cobrança." },
              { q: "E se houver fraude?", a: "O comprador pode abrir uma disputa a qualquer momento durante o processo. Nossa equipe analisa e decide pelo reembolso ou liberação, garantindo justiça para ambos." },
              { q: "Quais plataformas são aceitas?", a: "Aceitamos contas de Free Fire, Instagram, TikTok, Facebook, YouTube, Valorant e outras plataformas digitais." },
              { q: "Quanto tempo tenho para verificar a conta?", a: "O comprador tem 24 horas após receber as credenciais para completar o checklist de verificação. Caso expire, a transação é cancelada e o valor devolvido." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-lg px-6">
                <AccordionTrigger className="text-sm font-medium text-foreground hover:text-primary">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-xl mx-auto bg-gradient-card border border-primary/20 rounded-2xl p-12 glow-purple">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">
              Pronto para negociar com segurança?
            </h2>
            <p className="text-muted-foreground mb-8">
              Crie sua conta gratuitamente e comece a comprar ou vender agora.
            </p>
            <Link to="/marketplace">
              <Button variant="hero" size="lg" className="px-10">
                Começar Agora <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
