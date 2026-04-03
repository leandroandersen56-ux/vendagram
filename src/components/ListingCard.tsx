import { Link } from "react-router-dom";
import { Star, Shield, Zap } from "lucide-react";
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

  return (
    <Link to={`/listing/${listing.id}`} className="block h-full">
      <div className="rounded-2xl overflow-hidden group relative bg-background border border-border hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-200 cursor-pointer flex flex-col h-full">
        {/* Image */}
        <div className="relative overflow-hidden bg-muted aspect-[4/3]">
          {coverImage ? (
            <img
              src={coverImage}
              alt={listing.title}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <PlatformIcon platformId={listing.platform} size={48} />
            </div>
          )}

          {/* Platform badge */}
          <div className={`absolute top-2 right-2 ${badgeColor} rounded-full px-2 py-0.5 flex items-center gap-1`}>
            <PlatformIcon platformId={listing.platform} size={10} className="brightness-0 invert" />
            <span className="text-[9px] font-bold text-white uppercase">{platform.name}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-medium text-[12px] sm:text-[13px] leading-snug line-clamp-2 text-foreground min-h-[2.5em]">
            {listing.title}
          </h3>

          {/* Rating + sales */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <Star className="h-3 w-3 text-warning fill-warning" />
            <span className="text-[11px] font-medium text-foreground">{listing.sellerRating}</span>
            {listing.sellerSales > 0 && (
              <span className="text-[10px] text-muted-foreground">· {listing.sellerSales} vendas</span>
            )}
          </div>

          {/* Price */}
          <div className="mt-2">
            <p className="text-base sm:text-lg font-bold text-foreground leading-none">
              {formatBRL(listing.price)}
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
            <span className="flex items-center gap-1 text-[10px] text-success font-medium">
              <Shield className="h-3 w-3" /> Escrow
            </span>
            <span className="flex items-center gap-1 text-[10px] text-primary font-medium">
              <Zap className="h-3 w-3" /> Entrega imediata
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
