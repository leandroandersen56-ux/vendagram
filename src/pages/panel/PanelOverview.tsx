import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingBag, Tag, Wallet, TrendingUp, ArrowUpRight, Plus, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { formatBRL } from "@/lib/mock-data";

export default function PanelOverview() {
  const { user } = useAuth();

  const stats = [
    { label: "Compras", value: "2", icon: ShoppingBag, change: "+1 este mês" },
    { label: "Anúncios Ativos", value: "3", icon: Tag, change: "1 vendido" },
    { label: "Saldo Disponível", value: formatBRL(890), icon: Wallet, change: formatBRL(350) + " pendente" },
    { label: "Avaliação", value: "4.8 ★", icon: Star, change: "12 avaliações" },
  ];

  const recentActivity = [
    { type: "sale", text: "Conta Free Fire vendida por R$ 350", time: "2h atrás", color: "text-success" },
    { type: "purchase", text: "Compra de conta Instagram em andamento", time: "5h atrás", color: "text-warning" },
    { type: "listing", text: "Novo anúncio publicado: TikTok 50K", time: "1d atrás", color: "text-info" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Olá, {user?.name} 👋</h1>
          <p className="text-muted-foreground text-sm">Aqui está um resumo da sua conta</p>
        </div>
        <Link to="/painel/anuncios/novo">
          <Button variant="hero" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Novo Anúncio
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card className="bg-card border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">Atividade Recente</h3>
        <div className="space-y-4">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
              <div className={`h-2 w-2 rounded-full ${a.color === "text-success" ? "bg-success" : a.color === "text-warning" ? "bg-warning" : "bg-info"}`} />
              <p className="text-sm text-foreground flex-1">{a.text}</p>
              <span className="text-xs text-muted-foreground">{a.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
