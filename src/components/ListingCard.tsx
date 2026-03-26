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
      <div className="rounded-2xl overflow-hidden group relative hover:-translate-y-0.5 transition-all duration-200 shadow-md">
        {/* Image area - tall, prominent like Bonoxs */}
        <div className="aspect-[3/4] relative overflow-hidden bg-neutral-800">
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
              style={{ background: `linear-gradient(160deg, ${platform.color}25, #1a1a1a)` }}
            >
              <PlatformIcon platformId={listing.platform} size={56} />
            </div>
          )}

          {/* Platform badge - dark bg with neon yellow icon */}
          <div className="absolute top-2 left-2 h-7 w-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <PlatformIcon platformId={listing.platform} size={16} className="brightness-150 drop-shadow-[0_0_4px_hsl(60,100%,50%)]" />
          </div>

          {/* Share button - top right */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 bg-black/40 backdrop-blur-sm rounded-lg text-white/70 hover:text-primary hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-all"
            onClick={handleShare}
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Light gray bottom panel */}
        <div style={{ backgroundColor: '#e5e5e5' }} className="px-2.5 py-2.5">
          <h3 className="font-bold text-xs text-neutral-900 line-clamp-1 mb-1">
            {listing.title}
          </h3>

          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold text-neutral-900">{formatBRL(listing.price)}</p>
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-bold text-neutral-600">{listing.sellerRating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
