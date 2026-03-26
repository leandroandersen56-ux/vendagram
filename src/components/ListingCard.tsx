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
      <div className="bg-card rounded-xl overflow-hidden group relative hover:-translate-y-0.5 transition-all duration-200 border border-border hover:border-primary/30">
        {/* Cover image */}
        <div className="aspect-square relative overflow-hidden bg-muted">
          {coverImage ? (
            <img
              src={coverImage}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(160deg, ${platform.color}15, hsl(var(--background)))` }}
            >
              <PlatformIcon platformId={listing.platform} size={44} />
            </div>
          )}
          {/* Subtle bottom gradient for readability */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Platform pill - top left */}
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <PlatformIcon platformId={listing.platform} size={12} />
            <span className="text-[9px] font-medium text-white/90">{platform.name}</span>
          </div>

          {/* Share button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1.5 right-1.5 h-6 w-6 text-white/50 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-md"
            onClick={handleShare}
          >
            <Share2 className="h-3 w-3" />
          </Button>

          {/* Price tag - bottom left on image */}
          <div className="absolute bottom-1.5 left-1.5">
            <span className="text-sm font-extrabold text-primary drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {formatBRL(listing.price)}
            </span>
          </div>

          {/* Rating - bottom right on image */}
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5">
            <Star className="h-3 w-3 text-primary fill-primary" />
            <span className="text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{listing.sellerRating}</span>
          </div>
        </div>

        {/* Title + tags below image */}
        <div className="p-2 space-y-1.5">
          <h3 className="font-semibold text-[11px] sm:text-xs text-foreground line-clamp-2 leading-snug min-h-[2rem]">
            {listing.title}
          </h3>

          <div className="flex flex-wrap gap-1">
            {Object.entries(listing.fields).slice(0, 2).map(([key, value]) => (
              <span key={key} className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                {key}: {typeof value === 'boolean' ? (value ? '✓' : '✗') : value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
