import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border sm:border-none">
      {/* Mobile: collapsible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 sm:hidden"
      >
        <h4 className="font-bold text-sm text-foreground">{title}</h4>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all sm:!max-h-none sm:!opacity-100 ${open ? "max-h-60 opacity-100 pb-3" : "max-h-0 opacity-0"}`}>
        {children}
      </div>
      {/* Desktop: always visible */}
      <h4 className="hidden sm:block font-bold text-xs text-foreground mb-4 uppercase tracking-wider">{title}</h4>
      <div className="hidden sm:block">{children}</div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8 sm:py-12">

        {/* Desktop grid / Mobile stacked */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <span className="font-display text-base font-bold tracking-wider text-primary block mb-3">
              SAFETRADE<span className="text-muted-foreground">.GG</span>
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed mb-5 max-w-[220px]">
              A plataforma mais segura para comprar e vender contas digitais com escrow automático.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <PlatformIcon platformId="instagram" size={16} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="TikTok">
                <PlatformIcon platformId="tiktok" size={16} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="YouTube">
                <PlatformIcon platformId="youtube" size={16} />
              </a>
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="font-bold text-xs text-foreground mb-4 uppercase tracking-wider">Plataforma</h4>
            <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
              <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
              <Link to="/painel/anuncios/novo" className="hover:text-primary transition-colors">Vender Conta</Link>
              <Link to="/" className="hover:text-primary transition-colors">Como Funciona</Link>
            </div>
          </div>

          {/* Políticas */}
          <div>
            <h4 className="font-bold text-xs text-foreground mb-4 uppercase tracking-wider">Políticas</h4>
            <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
              <span className="hover:text-primary transition-colors cursor-pointer">Termos e Condições</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Política de Privacidade</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Perguntas Frequentes</span>
            </div>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="font-bold text-xs text-foreground mb-4 uppercase tracking-wider">Suporte</h4>
            <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
              <span className="hover:text-primary transition-colors cursor-pointer">Central de Ajuda</span>
              <a href="mailto:contato@safetrade.gg" className="hover:text-primary transition-colors">contato@safetrade.gg</a>
            </div>
          </div>
        </div>

        {/* Mobile: collapsible sections */}
        <div className="sm:hidden space-y-0">
          <CollapsibleSection title="Plataforma">
            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground pl-1">
              <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
              <Link to="/painel/anuncios/novo" className="hover:text-primary transition-colors">Vender Conta</Link>
              <Link to="/" className="hover:text-primary transition-colors">Como Funciona</Link>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Políticas">
            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground pl-1">
              <span className="hover:text-primary transition-colors cursor-pointer">Termos e Condições</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Política de Privacidade</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Perguntas Frequentes</span>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Suporte">
            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground pl-1">
              <span className="hover:text-primary transition-colors cursor-pointer">Central de Ajuda</span>
              <a href="mailto:contato@safetrade.gg" className="hover:text-primary transition-colors">contato@safetrade.gg</a>
            </div>
          </CollapsibleSection>
        </div>

        {/* Métodos de pagamento */}
        <div className="border-t border-border mt-6 sm:mt-10 pt-6">
          <div className="flex flex-col items-center gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider text-center mb-2">Métodos de pagamento</p>
              <div className="flex items-center gap-2 justify-center">
                <span className="bg-muted text-muted-foreground text-[10px] font-bold px-3 py-1.5 rounded">PIX</span>
                <span className="bg-muted text-muted-foreground text-[10px] font-bold px-3 py-1.5 rounded">VISA</span>
                <span className="bg-muted text-muted-foreground text-[10px] font-bold px-3 py-1.5 rounded">MASTER</span>
              </div>
            </div>

            {/* Social icons mobile */}
            <div className="flex items-center gap-4 sm:hidden">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <PlatformIcon platformId="instagram" size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="TikTok">
                <PlatformIcon platformId="tiktok" size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="YouTube">
                <PlatformIcon platformId="youtube" size={18} />
              </a>
            </div>

            {/* Logo + copyright */}
            <div className="text-center">
              <span className="font-display text-sm font-bold tracking-wider text-primary">
                SAFETRADE<span className="text-muted-foreground">.GG</span>
              </span>
              <p className="text-[10px] text-muted-foreground mt-1">
                © {new Date().getFullYear()} SafeTrade GG. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
