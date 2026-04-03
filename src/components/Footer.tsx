import { Link } from "react-router-dom";
import PlatformIcon from "@/components/PlatformIcon";
import logoFroiv from "@/assets/logo-froiv.png";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      {/* Mobile: compact footer (bottom nav handles main navigation) */}
      <div className="sm:hidden pb-16">
        <div className="px-4 py-6 space-y-4">
          <div className="flex items-center justify-center">
            <img src={logoFroiv} alt="Froiv" className="h-6" />
          </div>

          <div className="flex items-center justify-center gap-4">
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

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="hover:text-primary transition-colors cursor-pointer">Termos</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Privacidade</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Ajuda</span>
            <a href="mailto:contato@froiv.com" className="hover:text-primary transition-colors">Contato</a>
          </div>

          <div className="text-center">
            <p className="text-[10px] text-muted-foreground/60">
              © {new Date().getFullYear()} Froiv. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop: full footer */}
      <div className="hidden sm:block">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <div className="mb-3">
                <img src={logoFroiv} alt="Froiv" className="h-7" />
              </div>
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

            <div>
              <h4 className="font-bold text-xs text-foreground mb-4 uppercase tracking-wider">Plataforma</h4>
              <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
                <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
                <Link to="/painel/anuncios/novo" className="hover:text-primary transition-colors">Vender Conta</Link>
                <Link to="/" className="hover:text-primary transition-colors">Como Funciona</Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-foreground mb-4 uppercase tracking-wider">Políticas</h4>
              <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
                <span className="hover:text-primary transition-colors cursor-pointer">Termos e Condições</span>
                <span className="hover:text-primary transition-colors cursor-pointer">Política de Privacidade</span>
                <span className="hover:text-primary transition-colors cursor-pointer">Perguntas Frequentes</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-foreground mb-4 uppercase tracking-wider">Suporte</h4>
              <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
                <span className="hover:text-primary transition-colors cursor-pointer">Central de Ajuda</span>
                <a href="mailto:contato@froiv.com" className="hover:text-primary transition-colors">contato@froiv.com</a>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-10 pt-6">
            <div className="flex flex-col items-center gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider text-center mb-2">Métodos de pagamento</p>
                <div className="flex items-center gap-2 justify-center">
                  <span className="bg-background text-muted-foreground text-[10px] font-bold px-3 py-1.5 rounded-lg border border-border">PIX</span>
                  <span className="bg-background text-muted-foreground text-[10px] font-bold px-3 py-1.5 rounded-lg border border-border">VISA</span>
                  <span className="bg-background text-muted-foreground text-[10px] font-bold px-3 py-1.5 rounded-lg border border-border">MASTER</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                © {new Date().getFullYear()} Froiv. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
