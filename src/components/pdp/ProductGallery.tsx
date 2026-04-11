import { useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, X, ZoomIn } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";

interface ProductGalleryProps {
  images: string[];
  title: string;
  category: string;
  verified?: boolean;
  isDemo?: boolean;
}

export default function ProductGallery({ images, title, category, verified, isDemo }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const lastTapRef = useRef(0);
  const mainTouchRef = useRef<{ x: number; y: number } | null>(null);

  const hasImages = images.length > 0;

  const go = useCallback((idx: number) => {
    setDirection(idx > selected ? 1 : -1);
    setSelected(idx);
    setZoomed(false);
  }, [selected]);

  const next = useCallback(() => go((selected + 1) % images.length), [go, selected, images.length]);
  const prev = useCallback(() => go((selected - 1 + images.length) % images.length), [go, selected, images.length]);

  if (!hasImages) {
    return (
      <div className="aspect-[4/3] rounded-xl overflow-hidden flex items-center justify-center bg-[hsl(var(--muted))]">
        <div className="text-center">
          <PlatformIcon platformId={category} size={80} />
          <p className="text-xs text-[hsl(var(--txt-hint))] mt-3">Sem imagens</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2.5">
        {/* Main image — click to open lightbox */}
        <div
          className="relative rounded-xl overflow-hidden bg-card group cursor-zoom-in p-2 ring-1 ring-border/40 shadow-[0_2px_8px_rgba(0,0,0,0.14)]"
          onClick={() => setLightbox(true)}
          onTouchStart={(e) => {
            mainTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }}
          onTouchEnd={(e) => {
            if (!mainTouchRef.current || images.length <= 1) return;
            const dx = e.changedTouches[0].clientX - mainTouchRef.current.x;
            const dy = e.changedTouches[0].clientY - mainTouchRef.current.y;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
              e.preventDefault();
              if (dx < 0) next(); else prev();
              // Prevent lightbox from opening on swipe
              e.stopPropagation();
            }
            mainTouchRef.current = null;
          }}
        >
          <div className="rounded-lg overflow-hidden relative">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.img
                key={selected}
                src={images[selected]}
                alt={`${title} - Imagem ${selected + 1} de ${images.length}`}
                className="w-full aspect-[4/3] object-cover object-top"
                custom={direction}
                initial={{ opacity: 0.5, x: direction > 0 ? 60 : -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0.5, x: direction > 0 ? -60 : 60 }}
                transition={{ duration: 0.25 }}
                loading="eager"
              />
            </AnimatePresence>

            {/* Gradient shadow bottom → transparent at 50% */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />

            {/* Zoom hint icon */}
            <div className="absolute bottom-3 right-3 h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none z-10">
              <ZoomIn className="h-3.5 w-3.5 text-white" />
            </div>

            {verified && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-[hsl(var(--success-light))] text-[hsl(var(--success))] px-2.5 py-1 rounded-full text-[10px] font-semibold">
                <CheckCircle2 className="h-3 w-3" /> VERIFICADO
              </div>
            )}

            {isDemo && (
              <span className="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg z-10">
                Anúncio Demo
              </span>
            )}

            {images.length > 1 && (
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[11px] text-white font-medium">
                {selected + 1} / {images.length}
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity shadow-sm"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="h-4 w-4 text-[hsl(var(--txt-primary))]" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity shadow-sm"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="h-4 w-4 text-[hsl(var(--txt-primary))]" />
                </button>
              </>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); go(i); }}
                    className={`h-1.5 rounded-full transition-all ${
                      selected === i ? "w-5 bg-primary" : "w-1.5 bg-white/60"
                    }`}
                    aria-label={`Ir para imagem ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnails (desktop) */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  selected === i
                    ? "border-primary ring-1 ring-primary/30"
                    : "border-[hsl(var(--border))] hover:border-primary/40"
                }`}
                aria-label={`Selecionar imagem ${i + 1}`}
              >
                <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover object-top" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && createPortal(
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 z-[9999] flex flex-col bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="Galeria de imagens ampliada"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 text-white">
              <span className="text-sm font-medium">{selected + 1} / {images.length}</span>
              <button
                onClick={() => setLightbox(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Fechar galeria"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Image area with touch swipe */}
            <div
              className="flex-1 flex items-center justify-center relative overflow-hidden"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                (e.currentTarget as any)._touchStartX = touch.clientX;
                (e.currentTarget as any)._touchStartY = touch.clientY;
              }}
              onTouchEnd={(e) => {
                const now = Date.now();
                const timeSinceLastTap = now - lastTapRef.current;

                // Double-tap zoom
                if (timeSinceLastTap < 300) {
                  e.preventDefault();
                  if (zoomed) {
                    setZoomed(false);
                  } else {
                    const touch = e.changedTouches[0];
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((touch.clientX - rect.left) / rect.width) * 100;
                    const y = ((touch.clientY - rect.top) / rect.height) * 100;
                    setZoomOrigin({ x, y });
                    setZoomed(true);
                  }
                  lastTapRef.current = 0;
                  return;
                }
                lastTapRef.current = now;

                // Swipe navigation (only when not zoomed)
                if (!zoomed) {
                  const startX = (e.currentTarget as any)._touchStartX;
                  const startY = (e.currentTarget as any)._touchStartY;
                  if (startX == null) return;
                  const touch = e.changedTouches[0];
                  const dx = touch.clientX - startX;
                  const dy = touch.clientY - startY;
                  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                    if (dx < 0) next();
                    else prev();
                  }
                }
              }}
            >
              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.img
                  key={selected}
                  src={images[selected]}
                  alt={`${title} - Imagem ${selected + 1}`}
                  className="max-w-full max-h-full object-contain px-2 transition-transform duration-300 ease-out"
                  style={{
                    transform: zoomed ? 'scale(2.5)' : 'scale(1)',
                    transformOrigin: zoomed ? `${zoomOrigin.x}% ${zoomOrigin.y}%` : 'center center',
                  }}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 200 : -200 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -200 : 200 }}
                  transition={{ duration: 0.25 }}
                  draggable={false}
                />
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 justify-center px-4 py-3 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => go(i)}
                    className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      selected === i ? "border-white" : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                    aria-label={`Ir para imagem ${i + 1}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
