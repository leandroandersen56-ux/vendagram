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
      <div className="bg-card border border-border rounded-lg overflow-hidden group relative hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200">
        {/* Cover image */}
        <div className="h-32 sm:h-36 relative overflow-hidden">
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
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          {/* Small discrete platform icon */}
          <div className="absolute bottom-2 right-2">
            <PlatformIcon platformId={listing.platform} size={18} />
          </div>

          {/* Share button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1.5 right-1.5 h-6 w-6 text-neutral-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleShare}
          >
            <Share2 className="h-3 w-3" />
          </Button>

          {/* Platform name badge */}
          <span className="absolute bottom-2 left-2 bg-black/70 text-[9px] text-neutral-300 font-medium px-2 py-0.5 rounded">
            {platform.name}
          </span>
        </div>

        <div className="p-2.5 space-y-2">
          <h3 className="font-semibold text-[11px] text-foreground line-clamp-2 min-h-[2rem] leading-snug">
            {listing.title}
          </h3>

          {/* Key stats */}
          <div className="flex flex-wrap gap-1">
            {Object.entries(listing.fields).slice(0, 2).map(([key, value]) => (
              <span key={key} className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                {key}: {typeof value === 'boolean' ? (value ? '✓' : '✗') : value}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-border">
            <p className="text-sm font-extrabold text-primary">{formatBRL(listing.price)}</p>
            <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
              <Star className="h-2.5 w-2.5 text-primary fill-primary" />
              {listing.sellerRating}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
