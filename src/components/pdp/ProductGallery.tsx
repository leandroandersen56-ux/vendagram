import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, X } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";

interface ProductGalleryProps {
  images: string[];
  title: string;
  category: string;
  verified?: boolean;
  isDemo?: boolean;
}

export default function ProductGallery({ images, title, category, verified }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const hasImages = images.length > 0;

  const go = useCallback((idx: number) => {
    setDirection(idx > selected ? 1 : -1);
    setSelected(idx);
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
          className="relative rounded-xl overflow-hidden bg-[hsl(var(--muted))] group cursor-zoom-in"
          onClick={() => setLightbox(true)}
        >
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
              loading="lazy"
            />
          </AnimatePresence>

          {verified && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-[hsl(var(--success-light))] text-[hsl(var(--success))] px-2.5 py-1 rounded-full text-[10px] font-semibold">
              <CheckCircle2 className="h-3 w-3" /> VERIFICADO
            </div>
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

        {/* Thumbnails (desktop) */}
        {images.length > 1 && (
          <div className="hidden sm:flex gap-2 overflow-x-auto scrollbar-hide">
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

            {/* Image area */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.img
                  key={selected}
                  src={images[selected]}
                  alt={`${title} - Imagem ${selected + 1}`}
                  className="max-w-full max-h-full object-contain px-2"
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 200 : -200 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -200 : 200 }}
                  transition={{ duration: 0.25 }}
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
