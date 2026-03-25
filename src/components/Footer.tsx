import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-display text-sm font-bold tracking-wider">SAFETRADE<span className="text-secondary">.GG</span></span>
            </div>
            <p className="text-sm text-muted-foreground">
              A plataforma mais segura para comprar e vender contas digitais com escrow automático.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Plataforma</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
              <Link to="/create-listing" className="hover:text-primary transition-colors">Vender Conta</Link>
              <Link to="/" className="hover:text-primary transition-colors">Como Funciona</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Suporte</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="hover:text-primary transition-colors cursor-pointer">Central de Ajuda</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Termos de Uso</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Política de Privacidade</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Categorias</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>🎮 Free Fire</span>
              <span>📸 Instagram</span>
              <span>🎵 TikTok</span>
              <span>🎯 Valorant</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          © 2024 SafeTrade GG. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
