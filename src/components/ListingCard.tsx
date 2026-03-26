import { Link } from "react-router-dom";
import { Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/mock-data";
import { formatBRL, getPlatform } from "@/lib/mock-data";
import PlatformIcon from "@/components/PlatformIcon";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const platform = getPlatform(listing.platform);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const message = `🎮 ${listing.title} por ${formatBRL(listing.price)} 🔒 Compra segura: ${window.location.origin}/listing/${listing.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Link to={`/listing/${listing.id}`}>
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden group relative hover:border-[#FFD700]/30 hover:-translate-y-0.5 transition-all duration-200">
        {/* Platform banner */}
        <div
          className="h-28 sm:h-32 flex items-center justify-center relative"
          style={{ background: `linear-gradient(160deg, ${platform.color}15, #0A0A0A)` }}
        >
          <PlatformIcon platformId={listing.platform} size={44} />
          <span className="absolute top-2 left-2 bg-black/70 text-[9px] text-neutral-300 font-medium px-2 py-0.5 rounded">
            {platform.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1.5 right-1.5 h-6 w-6 text-neutral-500 hover:text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleShare}
          >
            <Share2 className="h-3 w-3" />
          </Button>
        </div>

        <div className="p-2.5 space-y-2">
          <h3 className="font-semibold text-[11px] text-white line-clamp-2 min-h-[2rem] leading-snug">
            {listing.title}
          </h3>

          {/* Key stats */}
          <div className="flex flex-wrap gap-1">
            {Object.entries(listing.fields).slice(0, 2).map(([key, value]) => (
              <span key={key} className="text-[9px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                {key}: {typeof value === 'boolean' ? (value ? '✓' : '✗') : value}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-neutral-800">
            <p className="text-xs font-bold text-[#FFD700]">{formatBRL(listing.price)}</p>
            <div className="flex items-center gap-0.5 text-[9px] text-neutral-500">
              <Star className="h-2.5 w-2.5 text-[#FFD700] fill-[#FFD700]" />
              {listing.sellerRating}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
