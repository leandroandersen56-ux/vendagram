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
    const message = `🎮 Vendo conta ${platform.name} - ${listing.title} por ${formatBRL(listing.price)} 🔒 Compra 100% segura com escrow automático: ${window.location.origin}/listing/${listing.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Link to={`/listing/${listing.id}`}>
      <div className="bg-card border border-border rounded-lg overflow-hidden card-hover group">
        {/* Platform banner */}
        <div className="h-32 flex items-center justify-center relative" style={{ background: `linear-gradient(135deg, ${platform.color}22, ${platform.color}11)` }}>
          <span className="text-5xl">{platform.icon}</span>
          <Badge className="absolute top-3 left-3 bg-muted/80 text-foreground border-0 text-xs">
            {platform.name}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 min-h-[2.5rem]">
            {listing.title}
          </h3>

          {/* Key stats */}
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(listing.fields).slice(0, 3).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="text-[10px] bg-muted text-muted-foreground border-0">
                {key}: {typeof value === 'boolean' ? (value ? '✓' : '✗') : value}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-lg font-bold text-primary">{formatBRL(listing.price)}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 text-warning fill-warning" />
              <span>{listing.sellerRating}</span>
              <span>·</span>
              <span>{listing.sellerSales} vendas</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
