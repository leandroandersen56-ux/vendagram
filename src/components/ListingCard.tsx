import { Link } from "react-router-dom";
import { Star, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    const message = `🎮 Vendo conta ${platform.name} - ${listing.title} por ${formatBRL(listing.price)} 🔒 Compra 100% segura: ${window.location.origin}/listing/${listing.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Link to={`/listing/${listing.id}`}>
      <div className="bg-card border border-border rounded-lg overflow-hidden card-hover group relative">
        {/* Platform banner */}
        <div className="h-36 flex items-center justify-center relative" style={{ background: `linear-gradient(145deg, ${platform.color}18, ${platform.color}08)` }}>
          <PlatformIcon platformId={listing.platform} size={48} />
          <Badge className="absolute top-3 left-3 bg-[#0D0D0D]/80 text-foreground border-0 text-[10px] px-2">
            {platform.name}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleShare}
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="p-3 space-y-2.5">
          <h3 className="font-semibold text-xs text-foreground line-clamp-2 min-h-[2rem] leading-snug">
            {listing.title}
          </h3>

          {/* Key stats */}
          <div className="flex flex-wrap gap-1">
            {Object.entries(listing.fields).slice(0, 3).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="text-[9px] bg-muted text-muted-foreground border-0 px-1.5 py-0.5">
                {key}: {typeof value === 'boolean' ? (value ? '✓' : '✗') : value}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <p className="text-sm font-bold text-[#FFD700]">{formatBRL(listing.price)}</p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Star className="h-2.5 w-2.5 text-[#FFD700] fill-[#FFD700]" />
              <span>{listing.sellerRating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
