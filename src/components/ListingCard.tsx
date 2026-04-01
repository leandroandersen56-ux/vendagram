import { Link } from "react-router-dom";
import { Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/mock-data";
import { formatBRL, getPlatform, PLATFORM_COVERS } from "@/lib/mock-data";
import PlatformIcon from "@/components/PlatformIcon";

interface ListingCardProps {
  listing: Listing;
}

const PLATFORM_BADGE_COLORS: Record<string, string> = {
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
  tiktok: "bg-black",
  youtube: "bg-red-600",
  facebook: "bg-blue-600",
  free_fire: "bg-orange-500",
  valorant: "bg-red-700",
  fortnite: "bg-blue-500",
  roblox: "bg-gray-600",
  clash_royale: "bg-amber-500",
  other: "bg-gray-500",
};

export default function ListingCard({ listing }: ListingCardProps) {
  const platform = getPlatform(listing.platform);
  const coverImage = listing.screenshots?.[0] || PLATFORM_COVERS[listing.platform];
  const badgeColor = PLATFORM_BADGE_COLORS[listing.platform] || PLATFORM_BADGE_COLORS.other;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const message = `🎮 ${listing.title} por ${formatBRL(listing.price)} 🔒 Compra segura: ${window.location.origin}/listing/${listing.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Link to={`/listing/${listing.id}`}>
      <div className="rounded-2xl overflow-hidden group relative bg-background border border-border hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-200 cursor-pointer hover:scale-[1.01]">
        {/* Image area */}
        <div className="relative overflow-hidden bg-muted aspect-square">
          {coverImage ? (
            <img
              src={coverImage}
              alt={listing.title}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <PlatformIcon platformId={listing.platform} size={56} />
            </div>
          )}

          {/* Platform badge */}
          <div className={`absolute top-2 right-2 ${badgeColor} rounded-full px-2 py-0.5 flex items-center gap-1`}>
            <PlatformIcon platformId={listing.platform} size={10} className="brightness-0 invert" />
            <span className="text-[10px] font-bold text-white uppercase">
              {platform.name}
            </span>
          </div>

          {/* Share button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/80 hover:bg-white text-foreground"
            onClick={handleShare}
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Info panel */}
        <div className="p-3 space-y-1.5">
          <h3 className="font-semibold text-[11px] sm:text-xs leading-snug line-clamp-1 text-foreground">
            {listing.title}
          </h3>

          <p className="text-xs text-muted-foreground">
            {listing.fields?.["Seguidores"] || listing.fields?.["Nível"] || listing.fields?.["Level"] || ""}
          </p>

          <div className="flex items-center justify-between">
            <p className="text-[13px] sm:text-sm font-bold text-primary">
              {formatBRL(listing.price)}
            </p>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-bold text-muted-foreground">{listing.sellerRating}</span>
            </div>
          </div>

          <button className="w-full mt-1 bg-primary text-primary-foreground text-xs font-semibold rounded-xl py-2 hover:bg-primary-dark transition-all active:scale-[0.98]">
            Ver detalhes
          </button>
        </div>
      </div>
    </Link>
  );
}
