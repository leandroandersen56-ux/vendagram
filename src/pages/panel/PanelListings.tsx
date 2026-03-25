import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Plus, Eye, Pause, Trash2, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_LISTINGS, formatBRL, getPlatform } from "@/lib/mock-data";

export default function PanelListings() {
  // Mock: user's own listings
  const myListings = MOCK_LISTINGS.slice(0, 3);

  const statusMap: Record<string, { label: string; className: string }> = {
    active: { label: "Ativo", className: "bg-success/10 text-success" },
    sold: { label: "Vendido", className: "bg-primary/10 text-primary" },
    paused: { label: "Pausado", className: "bg-warning/10 text-warning" },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">Meus Anúncios</h1>
        <Link to="/painel/anuncios/novo">
          <Button variant="hero" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Novo Anúncio
          </Button>
        </Link>
      </div>

      {myListings.length > 0 ? (
        <div className="space-y-3">
          {myListings.map((listing) => {
            const platform = getPlatform(listing.platform);
            const st = statusMap[listing.status] || statusMap.active;
            return (
              <Card key={listing.id} className="bg-card border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg flex items-center justify-center text-2xl shrink-0" style={{ background: `${platform.color}15` }}>
                    {platform.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{listing.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${st.className} border-0 text-[10px]`}>{st.label}</Badge>
                      <span className="text-xs text-muted-foreground">{platform.name}</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-primary shrink-0">{formatBRL(listing.price)}</p>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3 w-3" /></Button>
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
