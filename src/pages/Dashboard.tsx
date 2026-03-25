import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, ShoppingBag, AlertTriangle, DollarSign,
  TrendingUp, ArrowUpRight, ArrowDownRight, Shield, Search,
  Ban, Eye, Settings, Percent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatBRL } from "@/lib/mock-data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from "recharts";

const chartData = [
  { month: 'Jan', transactions: 45, revenue: 4500 },
  { month: 'Fev', transactions: 62, revenue: 6200 },
  { month: 'Mar', transactions: 78, revenue: 7800 },
  { month: 'Abr', transactions: 95, revenue: 9500 },
  { month: 'Mai', transactions: 110, revenue: 11000 },
  { month: 'Jun', transactions: 145, revenue: 14500 },
];

const mockUsers = [
  { id: '1', name: 'GameMaster99', email: 'gm99@email.com', role: 'seller', sales: 23, status: 'active', rating: 4.8 },
  { id: '2', name: 'SocialSeller', email: 'ss@email.com', role: 'seller', sales: 12, status: 'active', rating: 4.5 },
  { id: '3', name: 'Buyer001', email: 'b1@email.com', role: 'buyer', sales: 0, status: 'active', rating: 4.9 },
  { id: '4', name: 'FlaggedUser', email: 'fu@email.com', role: 'seller', sales: 2, status: 'banned', rating: 2.1 },
];

const mockTransactions = [
  { id: 'TX001', listing: 'Conta FF Nível 75', buyer: 'Buyer001', seller: 'GameMaster99', amount: 350, status: 'completed', date: '2024-03-20' },
  { id: 'TX002', listing: 'Instagram 50K', buyer: 'Buyer002', seller: 'SocialSeller', amount: 1200, status: 'transfer_in_progress', date: '2024-03-21' },
  { id: 'TX003', listing: 'TikTok 100K', buyer: 'Buyer003', seller: 'TikTokPro', amount: 2500, status: 'disputed', date: '2024-03-22' },
  { id: 'TX004', listing: 'Valorant Imortal', buyer: 'Buyer004', seller: 'ValPlayer', amount: 800, status: 'pending_payment', date: '2024-03-23' },
];

const statusColors: Record<string, string> = {
  completed: 'bg-success/10 text-success',
  transfer_in_progress: 'bg-warning/10 text-warning',
  disputed: 'bg-destructive/10 text-destructive',
  pending_payment: 'bg-muted text-muted-foreground',
  credentials_pending: 'bg-info/10 text-info',
  cancelled: 'bg-muted text-muted-foreground',
  active: 'bg-success/10 text-success',
  banned: 'bg-destructive/10 text-destructive',
};

export default function Dashboard() {
  const [tab, setTab] = useState("overview");

  const kpis = [
    { label: "Transações", value: "1,247", change: "+12%", up: true, icon: <ShoppingBag className="h-5 w-5" /> },
    { label: "Volume (BRL)", value: "R$ 2.4M", change: "+18%", up: true, icon: <DollarSign className="h-5 w-5" /> },
    { label: "Receita Plataforma", value: "R$ 240K", change: "+15%", up: true, icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Disputas Ativas", value: "3", change: "-25%", up: false, icon: <AlertTriangle className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Visão geral da plataforma</p>
            </div>
            <Button variant="glass" size="sm">
              <Settings className="h-4 w-4 mr-2" /> Configurações
            </Button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi) => (
              <Card key={kpi.label} className="bg-card border-border p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <div className={`flex items-center gap-1 text-xs mt-2 ${kpi.up ? 'text-success' : 'text-destructive'}`}>
                      {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {kpi.change} vs mês anterior
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {kpi.icon}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-card border border-border mb-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="transactions">Transações</TabsTrigger>
              <TabsTrigger value="disputes">Disputas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Transações por Mês</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 8%, 18%)" />
                      <XAxis dataKey="month" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                      <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                      <Tooltip contentStyle={{ background: 'hsl(240, 10%, 10%)', border: '1px solid hsl(240, 8%, 18%)', borderRadius: '8px', color: 'hsl(220, 20%, 95%)' }} />
                      <Area type="monotone" dataKey="transactions" stroke="hsl(263, 70%, 50%)" fill="url(#colorTx)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="bg-card border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Receita por Mês (R$)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 8%, 18%)" />
                      <XAxis dataKey="month" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                      <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                      <Tooltip contentStyle={{ background: 'hsl(240, 10%, 10%)', border: '1px solid hsl(240, 8%, 18%)', borderRadius: '8px', color: 'hsl(220, 20%, 95%)' }} />
                      <Bar dataKey="revenue" fill="hsl(187, 94%, 43%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Quick settings */}
                <Card className="bg-card border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Configurações Rápidas</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-primary" />
                        <span className="text-sm text-foreground">Taxa da Plataforma</span>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-0">10%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-success" />
                        <span className="text-sm text-foreground">Modo Manutenção</span>
                      </div>
                      <Badge className="bg-success/10 text-success border-0">Desativado</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-info" />
                        <span className="text-sm text-foreground">Novos Usuários Hoje</span>
                      </div>
                      <Badge className="bg-info/10 text-info border-0">14</Badge>
                    </div>
                  </div>
                </Card>

                {/* Top categories */}
                <Card className="bg-card border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Top Categorias</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Free Fire', pct: 35, color: 'bg-orange-500' },
                      { name: 'Instagram', pct: 28, color: 'bg-pink-500' },
                      { name: 'TikTok', pct: 20, color: 'bg-cyan-400' },
                      { name: 'Valorant', pct: 12, color: 'bg-red-500' },
                      { name: 'Outros', pct: 5, color: 'bg-primary' },
                    ].map((cat) => (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground">{cat.name}</span>
                          <span className="text-muted-foreground">{cat.pct}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${cat.color} rounded-full transition-all`} style={{ width: `${cat.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card className="bg-card border-border">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar usuários..." className="pl-10 bg-muted border-border" />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-xs text-muted-foreground font-medium">Usuário</th>
                        <th className="text-left p-4 text-xs text-muted-foreground font-medium">Função</th>
                        <th className="text-left p-4 text-xs text-muted-foreground font-medium">Vendas</th>
                        <th className="text-left p-4 text-xs text-muted-foreground font-medium">Rating</th>
                        <th className="text-left p-4 text-xs text-muted-foreground font-medium">Status</th>
                        <th className="text-left p-4 text-xs text-muted-foreground font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map((user) => (
                        <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="text-sm font-medium text-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </td>
                          <td className="p-4"><Badge className="bg-muted text-muted-foreground border-0 text-xs capitalize">{user.role}</Badge></td>
                          <td className="p-4 text-sm text-foreground">{user.sales}</td>
                          <td className="p-4 text-sm text-foreground">⭐ {user.rating}</td>
                          <td className="p-4"><Badge className={`${statusColors[user.status]} border-0 text-xs capitalize`}>{user.status}</Badge></td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3 w-3" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Ban className="h-3 w-3" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card className="bg-card border-border">
                <div className="p-4 border-b border-border flex gap-3">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48 bg-muted border-border">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="completed">Concluídas</SelectItem>
                      <SelectItem value="transfer_in_progress">Em progresso</SelectItem>
                      <SelectItem value="disputed">Disputadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-xs text-muted-foreground font-medium">ID</th>
                        <th className="text-left p-4 text-xs text-muted-foreground font-medium">Anúncio</th>
                        <th className="text-left p-4 text-xs text-muted-foreground font-medium">Comprador</th>
                        <th className="text-left p-4 text-xs text-muted-foreground font-medium">Vendedor</th>
                        <th className="text-left p-4 text-xs text-muted-foreground font-medium">Valor</th>
                        <th className="text-left p-4 text-xs text-muted-foreground font-medium">Status</th>
                        <th className="text-left p-4 text-xs text-muted-foreground font-medium">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="p-4 text-xs text-primary font-mono">{tx.id}</td>
                          <td className="p-4 text-sm text-foreground">{tx.listing}</td>
                          <td className="p-4 text-sm text-foreground">{tx.buyer}</td>
                          <td className="p-4 text-sm text-foreground">{tx.seller}</td>
                          <td className="p-4 text-sm text-foreground font-medium">{formatBRL(tx.amount)}</td>
                          <td className="p-4"><Badge className={`${statusColors[tx.status]} border-0 text-xs`}>{tx.status.replace(/_/g, ' ')}</Badge></td>
                          <td className="p-4 text-xs text-muted-foreground">{tx.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="disputes">
              <Card className="bg-card border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <h3 className="font-semibold text-foreground">Disputas Ativas</h3>
                  <Badge className="bg-destructive/10 text-destructive border-0">1</Badge>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 border border-destructive/20 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">TX003 — TikTok 100K</p>
                        <p className="text-xs text-muted-foreground mt-1">Aberta por: Buyer003 · Motivo: "Conta com seguidores falsos"</p>
                        <p className="text-xs text-muted-foreground">Data: 2024-03-22</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="hero" className="text-xs h-8">Resolver</Button>
                        <Button size="sm" variant="glass" className="text-xs h-8">Ver Detalhes</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
