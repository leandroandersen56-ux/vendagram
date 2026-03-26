import { Link } from "react-router-dom";
import { Star, Share2, ShieldCheck } from "lucide-react";
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
      <div className="rounded-2xl overflow-hidden group relative transition-all duration-300 card-surface">
        {/* Image area */}
        <div className="relative overflow-hidden bg-black/40 aspect-square">
          {coverImage ? (
            <img
              src={coverImage}
              alt={listing.title}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(160deg, ${platform.color}20, hsl(0 0% 6%))` }}
            >
              <PlatformIcon platformId={listing.platform} size={56} />
            </div>
          )}

          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />

          {/* Platform badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-lg px-2 py-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
            <PlatformIcon platformId={listing.platform} size={13} className="drop-shadow-[0_0_4px_hsl(60,100%,50%)]" />
            <span className="text-[9px] font-semibold tracking-wide uppercase" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {platform.name}
            </span>
          </div>

          {/* Share button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.7)' }}
            onClick={handleShare}
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Info panel */}
        <div className="px-3 py-2.5 space-y-1.5" style={{ backgroundColor: '#161616' }}>
          <h3 className="font-semibold text-[11px] sm:text-xs leading-snug line-clamp-1 text-foreground">
            {listing.title}
          </h3>

          <div className="flex items-center justify-between">
            <p className="text-[13px] sm:text-sm font-extrabold text-primary">
              {formatBRL(listing.price)}
            </p>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-primary fill-primary" />
              <span className="text-[10px] font-bold text-muted-foreground">{listing.sellerRating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
