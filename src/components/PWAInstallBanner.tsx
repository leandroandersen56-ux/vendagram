import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import logoFroiv from "@/assets/logo-froiv.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show in iframe/preview
    try {
      if (window.self !== window.top) return;
    } catch {
      return;
    }
    if (window.location.hostname.includes("id-preview--") || window.location.hostname.includes("lovableproject.com")) return;

    // Check if already dismissed recently
    const dismissedAt = localStorage.getItem("pwa-banner-dismissed");
    if (dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000) {
      return;
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS (no beforeinstallprompt), show a manual install hint
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !window.matchMedia("(display-mode: standalone)").matches) {
      setShowBanner(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
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

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#FFF3CD] border-b border-[#FFECB5] shadow-sm animate-in slide-in-from-top duration-300">
      <div className="container mx-auto flex items-center gap-3 py-2.5 pr-2">
        {/* App icon */}
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
          <img src={logoFroiv} alt="Froiv" className="h-6 w-6 brightness-0 invert" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[#664D03] leading-tight">
            Instale o app Froiv
          </p>
          <p className="text-[11px] text-[#664D03]/70 leading-tight">
            {isIOS
              ? "Toque em Compartilhar → Tela Inicial"
              : "Acesso rápido e notificações"}
          </p>
        </div>

        {/* Install button */}
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="shrink-0 bg-primary hover:bg-primary-dark text-white text-[12px] font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Instalar
          </button>
        )}

        {isIOS && (
          <div className="shrink-0 bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-lg">
            Adicionar
          </div>
        )}

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="shrink-0 h-7 w-7 flex items-center justify-center rounded-full hover:bg-[#664D03]/10 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4 text-[#664D03]/60" />
        </button>
      </div>
    </div>
  );
}
