import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Trash2, Loader2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import PageHeader from "@/components/menu/PageHeader";
import ListingCard from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Listing } from "@/lib/mock-data";

export default function ViewHistory() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadHistory();
  }, [user?.id]);

  const loadHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("listing_views")
      .select("listing_id, viewed_at, listings(*)")
      .eq("user_id", user!.id)
      .order("viewed_at", { ascending: false })
      .limit(100);

    if (data) {
      // Deduplicate by listing_id, keep most recent
      const seen = new Set<string>();
      const unique = data.filter((d: any) => {
        if (seen.has(d.listing_id)) return false;
        seen.add(d.listing_id);
        return d.listings;
      });
      setItems(unique.slice(0, 50));
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    await supabase.from("listing_views").delete().eq("user_id", user!.id);
    setItems([]);
    toast.success("Histórico limpo!");
  };

  const toListingCard = (item: any): Listing => {
    const l = item.listings;
    return {
      id: l.id, sellerId: l.seller_id, sellerName: "Vendedor", sellerRating: 5,
      sellerSales: 0, platform: l.category, title: l.title,
      description: l.description || "", price: Number(l.price),
      status: l.status, screenshots: l.screenshots || [],
      fields: l.highlights || {}, createdAt: l.created_at,
    };
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader
        title="Histórico de visualizações"
        rightAction={
          items.length > 0 ? (
            <button onClick={clearHistory} className="text-xs text-destructive font-medium flex items-center gap-1">
              <Trash2 className="h-3.5 w-3.5" /> Limpar
            </button>
          ) : undefined
        }
      />
      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex justify-center pt-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center pt-20">
            <Eye className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Nenhum produto visto ainda</p>
            <p className="text-xs text-muted-foreground mt-1">Navegue pelo marketplace para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((item: any) => (
              <div key={item.listing_id} className="relative">
                <ListingCard listing={toListingCard(item)} />
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(item.viewed_at), { locale: ptBR, addSuffix: false })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
