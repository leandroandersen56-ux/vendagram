import { Link } from "react-router-dom";
import { Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/mock-data";
import { formatBRL, getPlatform, PLATFORM_COVERS } from "@/lib/mock-data";
import PlatformIcon from "@/components/PlatformIcon";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const platform = getPlatform(listing.platform);
  const coverImage = listing.screenshots?.[0] || PLATFORM_COVERS[listing.platform];

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const message = `🎮 ${listing.title} por ${formatBRL(listing.price)} 🔒 Compra segura: ${window.location.origin}/listing/${listing.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Link to={`/listing/${listing.id}`}>
      <div className="bg-card border border-border rounded-xl overflow-hidden group relative hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,0,0.08)]">
        {/* Cover image - larger, more prominent */}
        <div className="aspect-[4/3] relative overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(160deg, ${platform.color}25, hsl(var(--background)))` }}
            >
              <PlatformIcon platformId={listing.platform} size={56} />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Platform badge - top left */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
            <PlatformIcon platformId={listing.platform} size={14} />
            <span className="text-[10px] sm:text-xs font-semibold text-white">{platform.name}</span>
          </div>

          {/* Share button - top right */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 bg-black/40 backdrop-blur-sm rounded-full text-white/70 hover:text-primary hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-all"
            onClick={handleShare}
          >
            <Share2 className="h-3 w-3" />
          </Button>

          {/* Price overlay - bottom of image */}
          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
            <p className="text-lg sm:text-xl font-extrabold text-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {formatBRL(listing.price)}
            </p>
            <div className="flex items-center gap-0.5 bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5">
              <Star className="h-3 w-3 text-primary fill-primary" />
              <span className="text-[10px] sm:text-xs font-bold text-white">{listing.sellerRating}</span>
            </div>
          </div>
        </div>

        {/* Info section - compact */}
        <div className="p-2.5 sm:p-3">
          <h3 className="font-bold text-xs sm:text-sm text-foreground line-clamp-2 min-h-[2rem] sm:min-h-[2.4rem] leading-tight mb-1.5">
            {listing.title}
          </h3>

          {/* Key stats as small tags */}
          <div className="flex flex-wrap gap-1">
            {Object.entries(listing.fields).slice(0, 2).map(([key, value]) => (
              <span key={key} className="text-[9px] sm:text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-full">
                {key}: {typeof value === 'boolean' ? (value ? '✓' : '✗') : value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
