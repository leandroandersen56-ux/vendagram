import { Link } from "react-router-dom";
import PlatformIcon from "@/components/PlatformIcon";
import logoFroiv from "@/assets/logo-froiv.png";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      {/* Mobile */}
      <div className="sm:hidden pb-16">
        <div className="px-4 py-6 space-y-4">
          <div className="flex items-center justify-center">
            <img src={logoFroiv} alt="Froiv" className="h-6" />
          </div>
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="text-txt-hint hover:text-primary transition-colors" aria-label="Instagram"><PlatformIcon platformId="instagram" size={18} /></a>
            <a href="#" className="text-txt-hint hover:text-primary transition-colors" aria-label="TikTok"><PlatformIcon platformId="tiktok" size={18} /></a>
            <a href="#" className="text-txt-hint hover:text-primary transition-colors" aria-label="YouTube"><PlatformIcon platformId="youtube" size={18} /></a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-txt-hint">
            <span className="hover:text-primary transition-colors cursor-pointer">Termos</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Privacidade</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Ajuda</span>
            <a href="mailto:contato@froiv.com" className="hover:text-primary transition-colors">Contato</a>
          </div>
          <p className="text-[10px] text-txt-hint text-center">© {new Date().getFullYear()} Froiv. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:block">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <img src={logoFroiv} alt="Froiv" className="h-7 mb-3" />
              <p className="text-[12px] text-txt-secondary leading-relaxed mb-5 max-w-[220px]">
                A plataforma mais segura para comprar e vender contas digitais com escrow automático.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="text-txt-hint hover:text-primary transition-colors" aria-label="Instagram"><PlatformIcon platformId="instagram" size={16} /></a>
                <a href="#" className="text-txt-hint hover:text-primary transition-colors" aria-label="TikTok"><PlatformIcon platformId="tiktok" size={16} /></a>
                <a href="#" className="text-txt-hint hover:text-primary transition-colors" aria-label="YouTube"><PlatformIcon platformId="youtube" size={16} /></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-[12px] text-txt-primary mb-4 uppercase tracking-wider">Plataforma</h4>
              <div className="flex flex-col gap-2.5 text-[12px] text-txt-secondary">
                <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
                <Link to="/painel/anuncios/novo" className="hover:text-primary transition-colors">Vender Conta</Link>
                <Link to="/" className="hover:text-primary transition-colors">Como Funciona</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-[12px] text-txt-primary mb-4 uppercase tracking-wider">Políticas</h4>
              <div className="flex flex-col gap-2.5 text-[12px] text-txt-secondary">
                <span className="hover:text-primary transition-colors cursor-pointer">Termos e Condições</span>
                <span className="hover:text-primary transition-colors cursor-pointer">Política de Privacidade</span>
                <span className="hover:text-primary transition-colors cursor-pointer">Perguntas Frequentes</span>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-[12px] text-txt-primary mb-4 uppercase tracking-wider">Suporte</h4>
              <div className="flex flex-col gap-2.5 text-[12px] text-txt-secondary">
                <span className="hover:text-primary transition-colors cursor-pointer">Central de Ajuda</span>
                <a href="mailto:contato@froiv.com" className="hover:text-primary transition-colors">contato@froiv.com</a>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-10 pt-6">
            <div className="flex flex-col items-center gap-4">
              <div>
                <p className="text-[10px] text-txt-hint uppercase tracking-wider text-center mb-2">Métodos de pagamento</p>
                <div className="flex items-center gap-2 justify-center">
                  <span className="bg-muted text-txt-secondary text-[10px] font-bold px-3 py-1.5 rounded-lg border border-border">PIX</span>
                  <span className="bg-muted text-txt-secondary text-[10px] font-bold px-3 py-1.5 rounded-lg border border-border">VISA</span>
                  <span className="bg-muted text-txt-secondary text-[10px] font-bold px-3 py-1.5 rounded-lg border border-border">MASTER</span>
                </div>
              </div>
              <p className="text-[10px] text-txt-hint">© {new Date().getFullYear()} Froiv. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
