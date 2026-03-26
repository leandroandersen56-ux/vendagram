import { Link } from "react-router-dom";
import PlatformIcon from "@/components/PlatformIcon";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-[#0A0A0A]">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="font-display text-sm font-bold tracking-wider text-[#FFD700] block mb-3">
              SAFETRADE<span className="text-neutral-500">.GG</span>
            </span>
            <p className="text-xs text-neutral-500 leading-relaxed">
              A plataforma mais segura para comprar e vender contas digitais com escrow automático.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-xs text-white mb-3 uppercase tracking-wider">Plataforma</h4>
            <div className="flex flex-col gap-2 text-xs text-neutral-500">
              <Link to="/marketplace" className="hover:text-[#FFD700] transition-colors">Marketplace</Link>
              <Link to="/painel/anuncios/novo" className="hover:text-[#FFD700] transition-colors">Vender Conta</Link>
              <Link to="/" className="hover:text-[#FFD700] transition-colors">Como Funciona</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-xs text-white mb-3 uppercase tracking-wider">Suporte</h4>
            <div className="flex flex-col gap-2 text-xs text-neutral-500">
              <span className="hover:text-[#FFD700] transition-colors cursor-pointer">Central de Ajuda</span>
              <span className="hover:text-[#FFD700] transition-colors cursor-pointer">Termos de Uso</span>
              <span className="hover:text-[#FFD700] transition-colors cursor-pointer">Política de Privacidade</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-xs text-white mb-3 uppercase tracking-wider">Categorias</h4>
            <div className="flex flex-col gap-2 text-xs text-neutral-500">
              {["free_fire", "instagram", "tiktok", "valorant"].map((id) => (
                <Link key={id} to={`/marketplace?platform=${id}`} className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <PlatformIcon platformId={id} size={14} />
                  {id === "free_fire" ? "Free Fire" : id === "instagram" ? "Instagram" : id === "tiktok" ? "TikTok" : "Valorant"}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-800 mt-8 pt-6 text-center text-[11px] text-neutral-600">
          © 2024 SafeTrade GG. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
