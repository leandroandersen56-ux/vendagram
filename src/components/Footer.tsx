import { Link } from "react-router-dom";
import logoFroiv from "@/assets/logo-froiv.svg";
import amexIcon from "@/assets/amex-icon.svg";
import eloIcon from "@/assets/elo-icon.png";
import hipercardIcon from "@/assets/hipercard-icon.svg";

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
      <svg width={size * 0.78} height={size * 0.78} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
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
  const h = 18;
  const icons: Record<string, React.ReactNode> = {
    pix: (
      <svg width={h} height={h} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156"/>
      </svg>
    ),
    visa: (
      <svg width={h * 1.5} height={h} viewBox="0 0 24 15" fill="currentColor">
        <path d="M9.112 1.262L5.97 8.758H3.92L2.374 2.775c-.094-.368-.175-.503-.461-.658C1.447 1.864.677 1.627 0 1.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"/>
      </svg>
    ),
    mastercard: (
      <svg width={h * 1.2} height={h * 1.2} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.343 18.031c.058.049.12.098.181.146-1.177.783-2.59 1.238-4.107 1.238C3.32 19.416 0 16.096 0 12c0-4.095 3.32-7.416 7.416-7.416 1.518 0 2.931.456 4.105 1.238-.06.051-.12.098-.165.15C9.6 7.489 8.595 9.688 8.595 12c0 2.311 1.001 4.51 2.748 6.031zm5.241-13.447c-1.52 0-2.931.456-4.105 1.238.06.051.12.098.165.15C14.4 7.489 15.405 9.688 15.405 12c0 2.31-1.001 4.507-2.748 6.031-.058.049-.12.098-.181.146 1.177.783 2.588 1.238 4.107 1.238C20.68 19.416 24 16.096 24 12c0-4.094-3.32-7.416-7.416-7.416zM12 6.174c-.096.075-.189.15-.28.231C10.156 7.764 9.169 9.765 9.169 12c0 2.236.987 4.236 2.551 5.595.09.08.185.158.28.232.096-.074.189-.152.28-.232 1.563-1.359 2.551-3.359 2.551-5.595 0-2.235-.987-4.236-2.551-5.595-.09-.08-.184-.156-.28-.231z"/>
      </svg>
    ),
    amex: (
      <img src={amexIcon} alt="American Express" className="h-4 w-auto brightness-0 opacity-60" style={{ filter: "brightness(0) saturate(100%) invert(33%) sepia(93%) saturate(1752%) hue-rotate(213deg) brightness(97%) contrast(91%)" }} />
    ),
    elo: (
      <img src={eloIcon} alt="Elo" className="h-4 w-auto brightness-0 opacity-60" style={{ filter: "brightness(0) saturate(100%) invert(33%) sepia(93%) saturate(1752%) hue-rotate(213deg) brightness(97%) contrast(91%)" }} />
    ),
    hipercard: (
      <img src={hipercardIcon} alt="Hipercard" className="h-4 w-auto brightness-0 opacity-60" style={{ filter: "brightness(0) saturate(100%) invert(33%) sepia(93%) saturate(1752%) hue-rotate(213deg) brightness(97%) contrast(91%)" }} />
    ),
  };
  return <span className="text-primary flex items-center justify-center min-w-[40px] h-7 px-1.5 rounded-md border border-border bg-muted/50">{icons[type]}</span>;
}

function TrustSeals() {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[11px] text-txt-primary font-bold">Selos e certificados</p>
      {/* Row 1 - 2 seals */}
      <div className="flex items-center justify-center gap-4">
        {/* Site Protegido SSL - green/gold shield */}
        <div className="flex items-center gap-2">
          <svg width="36" height="40" viewBox="0 0 36 40" fill="none" className="shrink-0">
            <path d="M18 2L4 9v10c0 9.25 6.4 17.9 14 20 7.6-2.1 14-10.75 14-20V9L18 2z" fill="url(#shieldGrad)" stroke="#2d8a2e" strokeWidth="1.2"/>
            <path d="M13 20l4 4 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="shieldGrad" x1="4" y1="2" x2="32" y2="38">
                <stop offset="0%" stopColor="#4CAF50"/>
                <stop offset="50%" stopColor="#66BB6A"/>
                <stop offset="100%" stopColor="#8BC34A"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col leading-tight">
            <span className="text-[8px] text-txt-hint uppercase tracking-wide">Compra Segura</span>
            <span className="text-[13px] font-extrabold text-txt-primary uppercase tracking-tight leading-none">Site Protegido</span>
            <span className="text-[8px] text-txt-hint uppercase tracking-wide">Certificado SSL</span>
          </div>
        </div>

        {/* Safe Browsing Google */}
        <div className="flex items-center gap-2">
          <svg width="24" height="28" viewBox="0 0 24 28" fill="none" className="shrink-0">
            <path d="M12 1L3 5.5v7c0 6.5 4.5 12.6 9 14 4.5-1.4 9-7.5 9-14v-7L12 1z" fill="#4CAF50" stroke="#388E3C" strokeWidth="0.8"/>
            <path d="M8 14l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="flex flex-col leading-tight">
            <span className="text-[8px] text-txt-hint uppercase tracking-wider">Safe Browsing</span>
            <span className="text-[16px] font-bold text-txt-primary tracking-tight leading-none" style={{ fontFamily: "'Product Sans', Arial, sans-serif" }}>Google</span>
          </div>
        </div>
      </div>

      {/* Row 2 - 3 cards */}
      <div className="flex items-stretch justify-center gap-3">
        {/* Loja Confiável - purple border card */}
        <div className="flex flex-col items-center justify-center bg-background border-2 border-purple-400 rounded-xl px-4 py-3 min-w-[100px]">
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none" className="mb-1">
            <circle cx="8" cy="8" r="5" stroke="#7C3AED" strokeWidth="1.5" fill="#7C3AED" opacity="0.15"/>
            <circle cx="8" cy="8" r="2" fill="#7C3AED"/>
            <path d="M14 5h6M14 8h5M14 11h4" stroke="#7C3AED" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="text-[9px] font-bold text-txt-primary uppercase leading-tight">Loja Confiável</span>
          <span className="text-[7px] text-txt-hint leading-tight text-center">Froiv Marketplace</span>
          <span className="text-[7px] text-purple-500 font-semibold mt-0.5">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}</span>
        </div>

        {/* Verificada por Reclame Aqui style - blue shield + diamond */}
        <div className="flex flex-col items-center justify-center bg-background border border-border rounded-xl px-4 py-3 min-w-[100px]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="mb-1">
            <path d="M12 2L4 6v5c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" fill="#2563EB"/>
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[9px] text-txt-secondary leading-tight">Verificada por</span>
          <span className="text-[10px] font-bold text-primary leading-tight">Froiv Trust</span>
        </div>

        {/* Ebit Excelente style - diamond */}
        <div className="flex flex-col items-center justify-center bg-background border-2 border-emerald-400 rounded-xl px-4 py-3 min-w-[90px]">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] font-bold bg-emerald-600 text-white rounded px-1.5 py-0.5 leading-none">F</span>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-0.5">
            <path d="M12 2L6 12l6 10 6-10L12 2z" fill="#06b6d4" opacity="0.7"/>
            <path d="M12 2L6 12l6 10 6-10L12 2z" stroke="#0891b2" strokeWidth="1"/>
            <path d="M6 12h12" stroke="#0891b2" strokeWidth="0.8"/>
            <path d="M12 2L6 12M12 2l6 10" stroke="#0891b2" strokeWidth="0.8"/>
          </svg>
          <span className="text-[9px] font-bold text-txt-primary uppercase tracking-wide">Excelente</span>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      {/* Mobile */}
      <div className="sm:hidden pb-16">
        <div className="px-4 py-6 space-y-6">
          <div className="flex items-center justify-center mb-12">
            <img src={logoFroiv} alt="Froiv" className="h-8" />
          </div>
          <div className="flex items-center justify-center gap-5">
            <a href="#" className="text-primary hover:text-primary/80 transition-colors" aria-label="Instagram"><SocialIcon type="instagram" size={26} /></a>
            <a href="#" className="text-primary hover:text-primary/80 transition-colors" aria-label="TikTok"><SocialIcon type="tiktok" size={26} /></a>
            <a href="#" className="text-primary hover:text-primary/80 transition-colors" aria-label="YouTube"><SocialIcon type="youtube" size={26} /></a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-txt-hint">
            <Link to="/termos" className="hover:text-primary transition-colors">Termos</Link>
            <Link to="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link>
            <Link to="/ajuda" className="hover:text-primary transition-colors">Ajuda</Link>
            <Link to="/contato" className="hover:text-primary transition-colors">Contato</Link>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-[10px] text-txt-hint uppercase tracking-wider">Métodos de pagamento</p>
            <div className="flex items-center gap-2 justify-center">
              <PaymentIcon type="pix" />
              <PaymentIcon type="visa" />
              <PaymentIcon type="mastercard" />
              <PaymentIcon type="amex" />
              <PaymentIcon type="elo" />
              <PaymentIcon type="hipercard" />
            </div>
          </div>
          <TrustSeals />
          <p className="text-[10px] text-txt-hint text-center">© {new Date().getFullYear()} Froiv. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:block">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <img src={logoFroiv} alt="Froiv" className="h-9 mb-3" />
              <p className="text-[12px] text-txt-secondary leading-relaxed mb-5 max-w-[220px]">
                A plataforma mais segura para comprar e vender contas digitais com escrow automático.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="text-primary hover:text-primary/80 transition-colors" aria-label="Instagram"><SocialIcon type="instagram" size={24} /></a>
                <a href="#" className="text-primary hover:text-primary/80 transition-colors" aria-label="TikTok"><SocialIcon type="tiktok" size={24} /></a>
                <a href="#" className="text-primary hover:text-primary/80 transition-colors" aria-label="YouTube"><SocialIcon type="youtube" size={24} /></a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[12px] text-txt-primary mb-4 uppercase tracking-wider">Plataforma</h4>
              <div className="flex flex-col gap-2.5 text-[12px] text-txt-secondary">
                <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
                <Link to="/vendedor/novo" className="hover:text-primary transition-colors">Vender Conta</Link>
                <Link to="/" className="hover:text-primary transition-colors">Como Funciona</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[12px] text-txt-primary mb-4 uppercase tracking-wider">Políticas</h4>
              <div className="flex flex-col gap-2.5 text-[12px] text-txt-secondary">
                <Link to="/termos" className="hover:text-primary transition-colors">Termos e Condições</Link>
                <Link to="/privacidade" className="hover:text-primary transition-colors">Política de Privacidade</Link>
                <Link to="/ajuda" className="hover:text-primary transition-colors">Perguntas Frequentes</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[12px] text-txt-primary mb-4 uppercase tracking-wider">Suporte</h4>
              <div className="flex flex-col gap-2.5 text-[12px] text-txt-secondary">
                <Link to="/ajuda" className="hover:text-primary transition-colors">Central de Ajuda</Link>
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
              <TrustSeals />
              <p className="text-[10px] text-txt-hint">© {new Date().getFullYear()} Froiv. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
