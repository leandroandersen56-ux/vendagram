import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";

interface ProductGalleryProps {
  images: string[];
  title: string;
  category: string;
  verified?: boolean;
}

export default function ProductGallery({ images, title, category, verified }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState(0);

  const hasImages = images.length > 0;

  const go = (idx: number) => {
    setDirection(idx > selected ? 1 : -1);
    setSelected(idx);
  };

  const next = () => go((selected + 1) % images.length);
  const prev = () => go((selected - 1 + images.length) % images.length);

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
    <div className="space-y-2.5">
      {/* Main image */}
      <div className="relative rounded-xl overflow-hidden bg-[hsl(var(--muted))] group">
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

        {/* Verified badge */}
        {verified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-[hsl(var(--success-light))] text-[hsl(var(--success))] px-2.5 py-1 rounded-full text-[10px] font-bold">
            <CheckCircle2 className="h-3 w-3" /> VERIFICADO
          </div>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute top-3 left-3 bg-[hsl(var(--foreground))]/70 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[11px] text-white font-medium">
            {selected + 1} / {images.length}
          </div>
        )}

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity shadow-sm"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="h-4 w-4 text-[hsl(var(--txt-primary))]" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity shadow-sm"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="h-4 w-4 text-[hsl(var(--txt-primary))]" />
            </button>
          </>
        )}

        {/* Dots (mobile) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
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
  );
}
