import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { MOCK_LISTINGS, formatBRL } from "@/lib/mock-data";
import ListingCard from "@/components/ListingCard";

interface RelatedProductsProps {
  currentId: string;
  category: string;
}

export default function RelatedProducts({ currentId, category }: RelatedProductsProps) {
  const related = MOCK_LISTINGS
    .filter((l) => l.id !== currentId && l.platform === category)
    .slice(0, 6);

  const otherRelated = related.length < 4
    ? MOCK_LISTINGS.filter((l) => l.id !== currentId && l.platform !== category).slice(0, 4 - related.length)
    : [];

  const all = [...related, ...otherRelated];
  if (all.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[hsl(var(--txt-primary))]">📦 Contas semelhantes</h3>
        <Link to="/marketplace" className="text-[13px] text-primary font-semibold hover:underline">
          Ver todos →
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {all.map((listing) => (
          <div key={listing.id} className="flex-shrink-0 w-[160px]">
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>
    </div>
  );
}
