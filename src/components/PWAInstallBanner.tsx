import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ghostIcon from "@/assets/froiv-app-icon.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWA_BANNER_HEIGHT = 52; // px

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    try {
      if (window.self !== window.top) return;
    } catch {
      return;
    }
    if (window.location.hostname.includes("id-preview--") || window.location.hostname.includes("lovableproject.com")) return;
    // Show banner every page load if not installed (no 24h suppression)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !window.matchMedia("(display-mode: standalone)").matches) {
      setShowBanner(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Set CSS variable for navbar offset
  useEffect(() => {
    const visible = showBanner && !dismissed && isMobile;
    document.documentElement.style.setProperty(
      '--pwa-banner-offset',
      visible ? `${PWA_BANNER_HEIGHT}px` : '0px'
    );
    return () => {
      document.documentElement.style.setProperty('--pwa-banner-offset', '0px');
    };
  }, [showBanner, dismissed, isMobile]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", String(Date.now()));
  };

  if (!showBanner || dismissed) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] bg-primary" style={{ height: PWA_BANNER_HEIGHT }}>
        <div className="flex items-center gap-3 h-full px-4">
          <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <img src={ghostIcon} alt="Froiv" className="h-5 w-5 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white leading-tight">Instale o app Froiv</p>
            <p className="text-[11px] text-white/70 leading-tight">
              {isIOS ? "Toque em Compartilhar → Tela Inicial" : "Acesso rápido e notificações"}
            </p>
          </div>
          {!isIOS && deferredPrompt && (
            <button onClick={handleInstall} className="shrink-0 bg-white hover:bg-white/90 text-primary text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Instalar
            </button>
          )}
          {isIOS && (
            <div className="shrink-0 bg-white text-primary text-[11px] font-semibold px-3 py-1.5 rounded-lg">Adicionar</div>
          )}
          <button onClick={handleDismiss} className="shrink-0 h-7 w-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors" aria-label="Fechar">
            <X className="h-4 w-4 text-white/70" />
          </button>
        </div>
      </div>
    );
  }

  // Desktop: bottom-right popup
  return (
    <div className="fixed bottom-6 right-6 z-[60] w-[340px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-border/50 animate-in slide-in-from-bottom-5 fade-in duration-400">
      <button onClick={handleDismiss} className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors" aria-label="Fechar">
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      <div className="p-5 flex flex-col items-center text-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-md">
          <img src={ghostIcon} alt="Froiv" className="h-8 w-8 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-foreground leading-tight">Instale o Froiv</p>
          <p className="text-[13px] text-muted-foreground mt-1 leading-snug">Tenha acesso rápido direto da sua área de trabalho</p>
        </div>
        <div className="flex items-center gap-2 w-full mt-1">
          <button onClick={handleDismiss} className="flex-1 text-[13px] font-medium text-muted-foreground hover:text-foreground py-2 rounded-lg hover:bg-muted transition-colors">Agora não</button>
          {!isIOS && deferredPrompt && (
            <button onClick={handleInstall} className="flex-1 bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
              <Download className="h-3.5 w-3.5" /> Instalar
            </button>
          )}
          {isIOS && (
            <button className="flex-1 bg-primary text-white text-[13px] font-semibold py-2 rounded-lg">Adicionar</button>
          )}
        </div>
      </div>
    </div>
  );
}
