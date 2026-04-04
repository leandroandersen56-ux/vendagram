import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useFavorites } from "@/hooks/useFavorites";
import { formatBRL, PLATFORM_COVERS } from "@/lib/mock-data";
import PlatformIcon from "@/components/PlatformIcon";

export default function Favorites() {
  const { favorites, loading, toggleFavorite, fetchFavorites } = useFavorites();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-[72px] pb-24 md:pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Meus Favoritos</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhum favorito ainda</p>
              <Link to="/">
                <Button variant="outline" size="sm" className="mt-4">
                  Explorar anúncios
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {favorites.map((fav) => {
                const listing = fav.listing;
                if (!listing) return null;
                const thumb = listing.screenshots?.[0];
                return (
                  <div
                    key={fav.id}
                    className="bg-card rounded-xl border border-border p-3 flex items-center gap-4 hover:shadow-md transition-shadow"
                  >
                    <Link to={`/listing/${listing.id}`} className="shrink-0">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={listing.title}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                          <PlatformIcon platformId={listing.category} className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </Link>
                    <Link to={`/listing/${listing.id}`} className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{listing.title}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {listing.category.replace("_", " ")}
                      </p>
                      <p className="text-sm font-semibold text-primary mt-1">
                        {formatBRL(listing.price)}
                      </p>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => toggleFavorite(listing.id)}
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
