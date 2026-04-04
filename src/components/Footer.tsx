import { Link } from "react-router-dom";
import logoFroiv from "@/assets/logo-froiv.png";

function SocialIcon({ type, size = 18 }: { type: "instagram" | "tiktok" | "youtube"; size?: number }) {
  const icons = {
    instagram: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    tiktok: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 19.86 4v3.64a7.83 7.83 0 0 1-3.26-.72v5.34A6.27 6.27 0 1 1 10.34 6v3.82a2.46 2.46 0 1 0 1.74 2.35V2h3.35a4.13 4.13 0 0 0 1.17 3.82Z" />
      </svg>
    ),
    youtube: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43Z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" />
      </svg>
    ),
  };
  return <>{icons[type]}</>;
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      {/* Mobile */}
      <div className="sm:hidden pb-16">
        <div className="px-4 py-6 space-y-4">
          <div className="flex items-center justify-center">
            <img src={logoFroiv} alt="Froiv" className="h-6" />
          </div>
          <div className="flex items-center justify-center gap-5">
            <a href="#" className="text-primary hover:text-primary/80 transition-colors" aria-label="Instagram"><SocialIcon type="instagram" size={20} /></a>
            <a href="#" className="text-primary hover:text-primary/80 transition-colors" aria-label="TikTok"><SocialIcon type="tiktok" size={20} /></a>
            <a href="#" className="text-primary hover:text-primary/80 transition-colors" aria-label="YouTube"><SocialIcon type="youtube" size={20} /></a>
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
                <a href="#" className="text-primary hover:text-primary/80 transition-colors" aria-label="Instagram"><SocialIcon type="instagram" size={18} /></a>
                <a href="#" className="text-primary hover:text-primary/80 transition-colors" aria-label="TikTok"><SocialIcon type="tiktok" size={18} /></a>
                <a href="#" className="text-primary hover:text-primary/80 transition-colors" aria-label="YouTube"><SocialIcon type="youtube" size={18} /></a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[12px] text-txt-primary mb-4 uppercase tracking-wider">Plataforma</h4>
              <div className="flex flex-col gap-2.5 text-[12px] text-txt-secondary">
                <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
                <Link to="/painel/anuncios/novo" className="hover:text-primary transition-colors">Vender Conta</Link>
                <Link to="/" className="hover:text-primary transition-colors">Como Funciona</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[12px] text-txt-primary mb-4 uppercase tracking-wider">Políticas</h4>
              <div className="flex flex-col gap-2.5 text-[12px] text-txt-secondary">
                <span className="hover:text-primary transition-colors cursor-pointer">Termos e Condições</span>
                <span className="hover:text-primary transition-colors cursor-pointer">Política de Privacidade</span>
                <span className="hover:text-primary transition-colors cursor-pointer">Perguntas Frequentes</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[12px] text-txt-primary mb-4 uppercase tracking-wider">Suporte</h4>
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
                  <span className="bg-muted text-txt-secondary text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-border">PIX</span>
                  <span className="bg-muted text-txt-secondary text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-border">VISA</span>
                  <span className="bg-muted text-txt-secondary text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-border">MASTER</span>
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
