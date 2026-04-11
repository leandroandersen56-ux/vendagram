import { Link } from "react-router-dom";
import { Star, Shield, Zap } from "lucide-react";
import type { Listing } from "@/lib/mock-data";
import { formatBRL, getPlatform, PLATFORM_COVERS } from "@/lib/mock-data";
import PlatformIcon from "@/components/PlatformIcon";

interface ListingCardProps {
  listing: Listing;
}

const PLATFORM_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  instagram: { bg: "bg-gradient-to-r from-[#833AB4] to-[#E1306C]", text: "text-white" },
  tiktok: { bg: "bg-[#111]", text: "text-white" },
  youtube: { bg: "bg-[#FF0000]", text: "text-white" },
  facebook: { bg: "bg-[#1877F2]", text: "text-white" },
  free_fire: { bg: "bg-[#FF6B35]", text: "text-white" },
  valorant: { bg: "bg-[#FF4655]", text: "text-white" },
  fortnite: { bg: "bg-[#9D4DBB]", text: "text-white" },
  roblox: { bg: "bg-[#E2231A]", text: "text-white" },
  clash_royale: { bg: "bg-[#F5C518]", text: "text-[#111]" },
  kwai: { bg: "bg-[#FF4906]", text: "text-white" },
  twitter: { bg: "bg-[#000]", text: "text-white" },
  other: { bg: "bg-[#666]", text: "text-white" },
};

export default function ListingCard({ listing }: ListingCardProps) {
  const platform = getPlatform(listing.platform);
  const firstScreenshot = listing.screenshots?.find((s) => typeof s === "string" && s.trim().length > 0);
  const coverImage = firstScreenshot || PLATFORM_COVERS[listing.platform] || null;
  const badge = PLATFORM_BADGE_COLORS[listing.platform] || PLATFORM_BADGE_COLORS.other;

  return (
    <Link to={`/listing/${listing.id}`} className="block h-full group">
      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.08)] hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full">
        {/* Thumbnail */}
        <div className="relative overflow-hidden bg-muted aspect-[4/3] m-2 rounded-md ring-1 ring-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          {coverImage ? (
            <img
              src={coverImage}
              alt={listing.title}
              className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <PlatformIcon platformId={listing.platform} size={48} />
            </div>
          )}
          {listing.sellerId === "00000000-0000-0000-0000-000000000001" && (
            <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Anúncio Demo
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-medium text-[13px] leading-[1.4] line-clamp-2 text-txt-primary">
            {listing.title}
          </h3>

          {/* Platform badge */}
          <div className="mt-0.5">
            <span className={`inline-flex items-center gap-1 ${badge.bg} rounded-[4px] px-2 py-0.5`}>
              <span style={{ filter: "brightness(0) invert(1)", display: "inline-flex", lineHeight: 0 }}>
                <PlatformIcon platformId={listing.platform} size={10} />
              </span>
              <span className={`text-[10px] font-semibold ${badge.text} uppercase leading-none`}>{platform.name}</span>
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <Star className="h-3 w-3 text-[#FFB800] fill-[#FFB800]" />
            <span className="text-[11px] font-medium text-txt-primary">{listing.sellerRating}</span>
            {listing.sellerSales > 0 && (
              <span className="text-[10px] text-txt-hint">· {listing.sellerSales} vendas</span>
            )}
          </div>

          {/* Price */}
          <div className="mt-2">
            <p className="text-[16px] font-semibold text-txt-primary leading-none tracking-tight">
              {formatBRL(listing.price)}
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-border">
            <span className="flex items-center gap-0.5 text-[10px] text-escrow font-semibold border border-escrow/30 rounded px-1.5 py-0.5">
              <Shield className="h-2.5 w-2.5" /> Escrow
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-success font-semibold border border-success/30 rounded px-1.5 py-0.5">
              <Zap className="h-2.5 w-2.5" /> Imediata
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
