import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { MOCK_LISTINGS, formatBRL, type Listing } from "@/lib/mock-data";
import ListingCard from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";

interface RelatedProductsProps {
  currentId: string;
  category: string;
}

export default function RelatedProducts({ currentId, category }: RelatedProductsProps) {
  const [dbListings, setDbListings] = useState<Listing[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchRelated() {
      // Only fetch listings from the same category
      const { data } = await supabase
        .from("public_listings")
        .select("*")
        .eq("status", "active")
        .eq("category", category)
        .neq("id", currentId)
        .limit(6);

      if (data && data.length > 0) {
        const mapped: Listing[] = data
          .filter((d) => d.id)
          .map((d) => ({
            id: d.id!,
            sellerId: d.seller_id || "",
            sellerName: "",
            sellerRating: 0,
            sellerSales: 0,
            platform: d.category || "other",
            title: d.title || "",
            description: d.description || "",
            price: d.price || 0,
            status: (d.status as any) || "active",
            screenshots: d.screenshots || [],
            fields: {},
            createdAt: d.created_at || "",
          }));
        setDbListings(mapped);
      }
      setLoaded(true);
    }
    fetchRelated();
  }, [currentId, category]);

  // Fallback to mock if no DB results
  const mockRelated = MOCK_LISTINGS
    .filter((l) => l.id !== currentId && l.platform === category)
    .slice(0, 6);
  const mockOther = mockRelated.length < 4
    ? MOCK_LISTINGS.filter((l) => l.id !== currentId && l.platform !== category).slice(0, 4 - mockRelated.length)
    : [];
  const mockAll = [...mockRelated, ...mockOther];

  const all = dbListings.length > 0 ? dbListings : (loaded ? mockAll : []);
  if (all.length === 0 && loaded) return null;
  if (!loaded) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[hsl(var(--txt-primary))] flex items-center gap-1.5">
          <Package className="h-4 w-4 text-primary" /> Contas semelhantes
        </h3>
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
