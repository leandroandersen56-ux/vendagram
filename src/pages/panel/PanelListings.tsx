import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Eye, Pause, Play, Trash2, Edit, Loader2 } from "lucide-react";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBRL, PLATFORMS } from "@/lib/mock-data";
import PlatformIcon from "@/components/PlatformIcon";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ListingRow = {
  id: string;
  title: string;
  price: number;
  category: string;
  status: string;
  created_at: string;
};

const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

const statusMap: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-success/10 text-success" },
  sold: { label: "Vendido", className: "bg-primary/10 text-primary" },
  draft: { label: "Rascunho", className: "bg-warning/10 text-warning" },
  removed: { label: "Removido", className: "bg-destructive/10 text-destructive" },
};

function getCategoryInfo(category: string) {
  const map: Record<string, { name: string; color: string }> = {};
  PLATFORMS.forEach((p) => {
    map[p.id] = p;
  });
  return map[category] || { name: category, color: "#7C3AED" };
}

export default function PanelListings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!roleData;

    let query = supabase
      .from("listings")
      .select("id, title, price, category, status, created_at")
      .order("created_at", { ascending: false });

    // Admins see all listings, regular users see only their own
    if (!isAdmin) {
      query = query.eq("seller_id", user.id);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      setListings(data);
    } else {
      // Show demo data when user has no listings
      setListings(MOCK_LISTINGS.map((m) => ({
        id: m.id,
        title: m.title,
        price: m.price,
        category: m.platform,
        status: m.status === "paused" ? "draft" : m.status,
        created_at: m.createdAt,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  const toggleStatus = async (listing: ListingRow) => {
    const newStatus = listing.status === "active" ? "draft" : "active";
    const { error } = await supabase
      .from("listings")
      .update({ status: newStatus as any })
      .eq("id", listing.id);

    if (error) {
      toast({ title: "Erro ao alterar status", variant: "destructive" });
    } else {
      toast({ title: newStatus === "active" ? "Anúncio ativado!" : "Anúncio pausado!" });
      fetchListings();
    }
  };

  const deleteListing = async (id: string) => {
    const { error } = await supabase
      .from("listings")
      .update({ status: "removed" as any })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao remover", variant: "destructive" });
    } else {
      toast({ title: "Anúncio removido!" });
      fetchListings();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const visibleListings = listings.filter((l) => l.status !== "removed");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Meus Anúncios</h1>
        <Link to="/vendedor/novo">
          <Button variant="hero" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Novo Anúncio
          </Button>
        </Link>
      </div>

      {visibleListings.length > 0 ? (
        <div className="space-y-3">
          {visibleListings.map((listing) => {
            const cat = getCategoryInfo(listing.category);
            const st = statusMap[listing.status] || statusMap.draft;
            const isReal = isUUID(listing.id);
            const demoClick = () => toast({ title: "Anúncio de demonstração", description: "Crie um anúncio real para usar esta ação." });
            return (
              <Card key={listing.id} className="w-full overflow-hidden border-border bg-card">
                <div className="flex min-w-0 flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
                  <div className="flex min-w-0 items-center gap-3 sm:flex-1 sm:gap-4">
                    <div className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cat.color}15` }}>
                      <PlatformIcon platformId={listing.category} size={32} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 break-words text-sm font-medium leading-snug text-foreground sm:line-clamp-1">
                        {listing.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge className={`${st.className} border-0 text-[10px]`}>{st.label}</Badge>
                        <span className="text-xs text-muted-foreground">{cat.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3 sm:ml-auto sm:border-t-0 sm:pt-0">
                    <p className="shrink-0 text-base font-semibold text-primary sm:text-lg">{formatBRL(listing.price)}</p>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => isReal ? navigate(`/listing/${listing.id}`) : demoClick()} title="Ver anúncio">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => isReal ? navigate(`/painel/anuncios/editar/${listing.id}`) : demoClick()} title="Editar">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => isReal ? toggleStatus(listing) : demoClick()}
                        title={listing.status === "active" ? "Pausar" : "Ativar"}
                      >
                        {listing.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Remover" onClick={(e) => { if (!isReal) { e.preventDefault(); demoClick(); } }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover anúncio?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação irá remover o anúncio do marketplace. Você não poderá desfazer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteListing(listing.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-card border-border p-12 text-center">
          <p className="text-3xl mb-3">📦</p>
          <p className="font-medium text-foreground mb-2">Nenhum anúncio</p>
          <p className="text-sm text-muted-foreground mb-4">Crie seu primeiro anúncio e comece a vender</p>
          <Link to="/painel/anuncios/novo">
            <Button variant="hero">Criar Anúncio</Button>
          </Link>
        </Card>
      )}
    </motion.div>
  );
}
