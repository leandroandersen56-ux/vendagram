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

function PaymentIcon({ type }: { type: "pix" | "visa" | "mastercard" | "amex" | "elo" | "hipercard" }) {
  const h = 22;
  const icons: Record<string, React.ReactNode> = {
    pix: (
      <svg width={h} height={h} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156"/>
      </svg>
    ),
    visa: (
      <svg width={h * 1.5} height={h} viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"/>
      </svg>
    ),
    mastercard: (
      <svg width={h} height={h} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.343 18.031c.058.049.12.098.181.146-1.177.783-2.59 1.238-4.107 1.238C3.32 19.416 0 16.096 0 12c0-4.095 3.32-7.416 7.416-7.416 1.518 0 2.931.456 4.105 1.238-.06.051-.12.098-.165.15C9.6 7.489 8.595 9.688 8.595 12c0 2.311 1.001 4.51 2.748 6.031zm5.241-13.447c-1.52 0-2.931.456-4.105 1.238.06.051.12.098.165.15C14.4 7.489 15.405 9.688 15.405 12c0 2.31-1.001 4.507-2.748 6.031-.058.049-.12.098-.181.146 1.177.783 2.588 1.238 4.107 1.238C20.68 19.416 24 16.096 24 12c0-4.094-3.32-7.416-7.416-7.416zM12 6.174c-.096.075-.189.15-.28.231C10.156 7.764 9.169 9.765 9.169 12c0 2.236.987 4.236 2.551 5.595.09.08.185.158.28.232.096-.074.189-.152.28-.232 1.563-1.359 2.551-3.359 2.551-5.595 0-2.235-.987-4.236-2.551-5.595-.09-.08-.184-.156-.28-.231z"/>
      </svg>
    ),
    amex: (
      <svg width={h} height={h} viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.015 14.378c0-.32-.135-.496-.344-.622-.21-.12-.464-.135-.81-.135h-1.543v2.82h.675v-1.027h.72c.24 0 .39.024.478.125.12.13.104.38.104.55v.35h.66v-.555c-.002-.25-.017-.376-.108-.516-.06-.08-.18-.18-.33-.234l.02-.008c.18-.072.48-.297.48-.747zm-.87.407c-.09.053-.195.058-.33.058h-.81v-.63h.824c.12 0 .24 0 .33.05.098.048.156.147.15.255 0 .12-.045.215-.134.27zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm7.5 16.5h-15v-9h15v9z"/>
      </svg>
    ),
    elo: (
      <svg width={h * 1.2} height={h} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.8 7.6c1.1-.4 2.3-.2 3.2.4l1.6-2.4C9.8 4.4 7.6 4 5.6 4.8c-2 .8-3.4 2.6-3.8 4.6l2.8.6c.2-1.2 1-2.2 2.2-2.6zM4.4 12c0-.4 0-.8.1-1.2l-2.8-.6c-.3 1.2-.3 2.4 0 3.6l2.8-.6c-.1-.4-.1-.8-.1-1.2zM5.6 19.2c2 .8 4.2.4 5.8-.8l-1.6-2.4c-.9.6-2.1.8-3.2.4-1.2-.4-2-1.4-2.2-2.6l-2.8.6c.4 2 1.8 3.8 3.8 4.6l.2.2zM18.4 4.8c-2-.8-4.2-.4-5.8.8l1.6 2.4c.9-.6 2.1-.8 3.2-.4 1.2.4 2 1.4 2.2 2.6l2.8-.6C22 7.4 20.4 5.6 18.4 4.8zM19.6 12c0 .4 0 .8-.1 1.2l2.8.6c.3-1.2.3-2.4 0-3.6l-2.8.6c.1.4.1.8.1 1.2zM18.4 19.2c-2 .8-4.2.4-5.8-.8l-1.6 2.4c1.8 1.2 4 1.6 5.8.8 2-.8 3.4-2.6 3.8-4.6l-2.8-.6c-.2 1.2-1.2 2.4-2.4 2.8z"/>
      </svg>
    ),
    hipercard: (
      <svg width={h * 1.2} height={h} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 4C.9 4 0 4.9 0 6v12c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H2zm9 4h2v8h-2V8zm-4 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm10 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
      </svg>
    ),
  };
  return <span className="text-primary opacity-70 hover:opacity-100 transition-opacity">{icons[type]}</span>;
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
                <div className="flex items-center gap-3 justify-center">
                  <PaymentIcon type="pix" />
                  <PaymentIcon type="visa" />
                  <PaymentIcon type="mastercard" />
                  <PaymentIcon type="amex" />
                  <PaymentIcon type="elo" />
                  <PaymentIcon type="hipercard" />
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
