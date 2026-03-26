import { Link } from "react-router-dom";
import PlatformIcon from "@/components/PlatformIcon";

const CATEGORY_LINKS = [
  { id: "free_fire", label: "Free Fire" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "valorant", label: "Valorant" },
  { id: "fortnite", label: "Fortnite" },
  { id: "roblox", label: "Roblox" },
  { id: "youtube", label: "YouTube" },
  { id: "facebook", label: "Facebook" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-base font-bold tracking-wider text-primary block mb-3">
              SAFETRADE<span className="text-muted-foreground">.GG</span>
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed mb-5 max-w-[220px]">
              A plataforma mais segura para comprar e vender contas digitais com escrow automático.
            </p>
            {/* Social icons */}
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

          {/* Categorias */}
          <div>
            <h4 className="font-bold text-xs text-foreground mb-4 uppercase tracking-wider">Categorias</h4>
            <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
              {CATEGORY_LINKS.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/marketplace?platform=${cat.id}`}
                  className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <PlatformIcon platformId={cat.id} size={14} />
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Métodos de pagamento */}
        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} SafeTrade GG. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Métodos de pagamento</span>
            <div className="flex items-center gap-2">
              <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2.5 py-1 rounded">PIX</span>
              <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2.5 py-1 rounded">VISA</span>
              <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2.5 py-1 rounded">MASTER</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
