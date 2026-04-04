import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3, Users, ShoppingBag, AlertTriangle, DollarSign,
  TrendingUp, ArrowUpRight, ArrowDownRight, Shield, Search,
  Ban, Eye, Settings, Percent, CheckCircle2, Loader2, Wallet,
  ChevronRight, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const statusColors: Record<string, string> = {
  completed: "bg-success/10 text-success",
  transfer_in_progress: "bg-warning/10 text-warning",
  disputed: "bg-destructive/10 text-destructive",
  pending_payment: "bg-muted text-muted-foreground",
  paid: "bg-primary/10 text-primary",
  cancelled: "bg-muted text-muted-foreground",
  refunded: "bg-warning/10 text-warning",
  open: "bg-destructive/10 text-destructive",
  under_review: "bg-warning/10 text-warning",
  resolved: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
  processing: "bg-primary/10 text-primary",
  processed: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  completed: "Concluída", transfer_in_progress: "Transferindo",
  disputed: "Disputada", pending_payment: "Aguardando pagamento",
  paid: "Pago", cancelled: "Cancelada", refunded: "Reembolsada",
  open: "Aberta", under_review: "Em análise", resolved: "Resolvida", closed: "Fechada",
  pending: "Pendente", processing: "Processando", processed: "Processado", rejected: "Rejeitado",
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Data
  const [kpis, setKpis] = useState({ users: 0, volume: 0, platformFee: 0, disputes: 0, escrow: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    checkAdmin();
  }, [user?.id]);

  const checkAdmin = async () => {
    if (!user?.id) return;
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    if (!data || data.length === 0) { navigate("/"); return; }
    setIsAdmin(true);
    loadAll();
  };

  const loadAll = async () => {
    setLoading(true);
    const [profilesRes, txRes, disputesRes, walletsRes, withdrawalsRes, verificationsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("transactions").select("*, listings(title)").order("created_at", { ascending: false }).limit(100),
      supabase.from("disputes").select("*, transactions(amount, listings(title)), profiles!disputes_opened_by_fkey(name)").order("created_at", { ascending: false }),
      supabase.from("wallets").select("pending"),
      supabase.from("withdrawals").select("*, profiles!withdrawals_user_id_fkey(name, email)").order("created_at", { ascending: false }),
      supabase.from("verification_requests").select("*").order("created_at", { ascending: false }),
    ]);

    const allUsers = profilesRes.data || [];
    const allTx = txRes.data || [];
    const allDisputes = disputesRes.data || [];
    const allWallets = walletsRes.data || [];
    const allWithdrawals = withdrawalsRes.data || [];

    const completedTx = allTx.filter((t: any) => t.status === "completed");
    const volume = completedTx.reduce((s: number, t: any) => s + Number(t.amount), 0);
    const fees = completedTx.reduce((s: number, t: any) => s + Number(t.platform_fee), 0);
    const escrow = allWallets.reduce((s: number, w: any) => s + Number(w.pending || 0), 0);
    const openDisputes = allDisputes.filter((d: any) => d.status === "open" || d.status === "under_review").length;

    setKpis({ users: allUsers.length, volume, platformFee: fees, disputes: openDisputes, escrow });
    setUsers(allUsers);
    setTransactions(allTx);
    setDisputes(allDisputes);
    setWithdrawals(allWithdrawals);
    setVerifications(verificationsRes.data || []);

    // Chart: group transactions by month
    const monthMap: Record<string, { transactions: number; revenue: number }> = {};
    allTx.forEach((t: any) => {
      const m = new Date(t.created_at).toLocaleDateString("pt-BR", { month: "short" });
      if (!monthMap[m]) monthMap[m] = { transactions: 0, revenue: 0 };
      monthMap[m].transactions++;
      if (t.status === "completed") monthMap[m].revenue += Number(t.amount);
    });
    setChartData(Object.entries(monthMap).map(([month, v]) => ({ month, ...v })).slice(-6));
    setLoading(false);
  };

  const handleReleaseEscrow = async (txId: string) => {
    const { error } = await supabase.functions.invoke("release-escrow", { body: { transaction_id: txId } });
    if (error) toast.error("Erro ao liberar escrow");
    else { toast.success("Escrow liberado!"); loadAll(); }
  };

  const handleProcessWithdrawal = async (wId: string) => {
    const { error } = await supabase.functions.invoke("process-withdrawal", { body: { withdrawal_id: wId } });
    if (error) toast.error("Erro ao processar saque");
    else { toast.success("Saque processado!"); loadAll(); }
  };

  const handleVerification = async (vId: string, action: "approved" | "rejected", reason?: string) => {
    const { error } = await supabase.from("verification_requests").update({
      status: action,
      rejection_reason: action === "rejected" ? (reason || "Documentos não atenderam os requisitos") : null,
      reviewed_by: user!.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", vId);

    if (error) { toast.error("Erro ao processar verificação"); return; }

    if (action === "approved") {
      const vr = verifications.find((v: any) => v.id === vId);
      if (vr) {
        await supabase.from("profiles").update({ is_verified: true }).eq("user_id", vr.user_id);
        await supabase.from("notifications").insert({
          user_id: vr.user_id,
          title: "Conta verificada!",
          body: "Parabéns! Sua conta foi verificada. O selo de vendedor verificado já aparece no seu perfil.",
          link: "/vendedor/verificacao",
        });
      }
    } else {
      const vr = verifications.find((v: any) => v.id === vId);
      if (vr) {
        await supabase.from("notifications").insert({
          user_id: vr.user_id,
          title: "Verificação recusada",
          body: reason || "Seus documentos não atenderam aos requisitos. Envie novamente.",
          link: "/vendedor/verificacao",
        });
      }
    }

    toast.success(action === "approved" ? "Conta verificada!" : "Verificação recusada");
    loadAll();
  };

  const filteredUsers = users.filter((u: any) =>
    !searchUser || (u.name || "").toLowerCase().includes(searchUser.toLowerCase()) || (u.email || "").toLowerCase().includes(searchUser.toLowerCase())
  );

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: "Usuários", value: String(kpis.users), icon: <Users className="h-5 w-5" />, color: "text-primary" },
    { label: "Volume Total", value: `R$ ${kpis.volume.toLocaleString("pt-BR")}`, icon: <DollarSign className="h-5 w-5" />, color: "text-success" },
    { label: "Receita Plataforma", value: `R$ ${kpis.platformFee.toLocaleString("pt-BR")}`, icon: <TrendingUp className="h-5 w-5" />, color: "text-primary" },
    { label: "Em Escrow", value: `R$ ${kpis.escrow.toLocaleString("pt-BR")}`, icon: <Shield className="h-5 w-5" />, color: "text-warning" },
    { label: "Disputas Abertas", value: String(kpis.disputes), icon: <AlertTriangle className="h-5 w-5" />, color: kpis.disputes > 0 ? "text-destructive" : "text-success" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Visão geral da plataforma Froiv</p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {kpiCards.map((k) => (
              <Card key={k.label} className="bg-card border-border p-4">
                <div className={`h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center ${k.color} mb-2`}>{k.icon}</div>
                <p className="text-xl font-semibold text-foreground">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </Card>
            ))}
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-card border border-border mb-6 flex-wrap">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="transactions">Transações</TabsTrigger>
              <TabsTrigger value="disputes">Disputas {kpis.disputes > 0 && <Badge className="bg-destructive text-white ml-1 text-[10px] h-4 px-1">{kpis.disputes}</Badge>}</TabsTrigger>
              <TabsTrigger value="withdrawals">Saques</TabsTrigger>
              <TabsTrigger value="verifications">
                Verificações
                {verifications.filter((v: any) => v.status === "pending").length > 0 && (
                  <Badge className="bg-primary text-white ml-1 text-[10px] h-4 px-1">
                    {verifications.filter((v: any) => v.status === "pending").length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Transações por Mês</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip />
                      <Area type="monotone" dataKey="transactions" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
                <Card className="bg-card border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Receita por Mês (R$)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </TabsContent>

            {/* Users */}
            <TabsContent value="users">
              <Card className="bg-card border-border">
                <div className="p-4 border-b border-border">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar por nome ou email..." value={searchUser} onChange={(e) => setSearchUser(e.target.value)} className="pl-10 bg-muted border-border" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Usuário</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Vendas</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Rating</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Verificado</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Desde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.slice(0, 50).map((u: any) => (
                        <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="p-3">
                            <p className="text-sm font-medium text-foreground">{u.name || "Sem nome"}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </td>
                          <td className="p-3 text-sm text-foreground">{u.total_sales || 0}</td>
                          <td className="p-3 text-sm text-foreground">⭐ {(u.avg_rating || 0).toFixed(1)}</td>
                          <td className="p-3">{u.is_verified ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}</td>
                          <td className="p-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* Transactions */}
            <TabsContent value="transactions">
              <Card className="bg-card border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">ID</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Anúncio</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Valor</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Taxa</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Status</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Data</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 50).map((tx: any) => (
                        <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="p-3 text-xs text-primary font-mono">{tx.id.slice(0, 8)}</td>
                          <td className="p-3 text-sm text-foreground">{tx.listings?.title || "—"}</td>
                          <td className="p-3 text-sm font-medium text-foreground">R$ {Number(tx.amount).toFixed(2)}</td>
                          <td className="p-3 text-xs text-muted-foreground">R$ {Number(tx.platform_fee).toFixed(2)}</td>
                          <td className="p-3"><Badge className={`${statusColors[tx.status] || "bg-muted text-muted-foreground"} border-0 text-xs`}>{statusLabels[tx.status] || tx.status}</Badge></td>
                          <td className="p-3 text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString("pt-BR")}</td>
                          <td className="p-3">
                            {tx.status === "paid" && (
                              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleReleaseEscrow(tx.id)}>Liberar</Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* Disputes */}
            <TabsContent value="disputes">
              <Card className="bg-card border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">ID</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Descrição</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Valor</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Status</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Aberta em</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disputes.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">Nenhuma disputa encontrada</td></tr>
                      ) : disputes.map((d: any) => (
                        <tr key={d.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="p-3 text-xs text-primary font-mono">{d.id.slice(0, 8)}</td>
                          <td className="p-3 text-sm text-foreground max-w-[200px] truncate">{d.description}</td>
                          <td className="p-3 text-sm text-foreground">R$ {Number(d.transactions?.amount || 0).toFixed(2)}</td>
                          <td className="p-3"><Badge className={`${statusColors[d.status] || ""} border-0 text-xs`}>{statusLabels[d.status] || d.status}</Badge></td>
                          <td className="p-3 text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString("pt-BR")}</td>
                          <td className="p-3">
                            {(d.status === "open" || d.status === "under_review") && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleReleaseEscrow(d.transaction_id)}>Liberar vendedor</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* Withdrawals */}
            <TabsContent value="withdrawals">
              <Card className="bg-card border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">ID</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Usuário</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Valor</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Chave Pix</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Status</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Data</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.length === 0 ? (
                        <tr><td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">Nenhum saque encontrado</td></tr>
                      ) : withdrawals.map((w: any) => (
                        <tr key={w.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="p-3 text-xs text-primary font-mono">{w.id.slice(0, 8)}</td>
                          <td className="p-3 text-sm text-foreground">{w.profiles?.name || w.profiles?.email || "—"}</td>
                          <td className="p-3 text-sm font-medium text-foreground">R$ {Number(w.amount).toFixed(2)}</td>
                          <td className="p-3 text-xs text-muted-foreground font-mono">{w.pix_key}</td>
                          <td className="p-3"><Badge className={`${statusColors[w.status] || ""} border-0 text-xs`}>{statusLabels[w.status] || w.status}</Badge></td>
                          <td className="p-3 text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString("pt-BR")}</td>
                          <td className="p-3">
                            {w.status === "pending" && (
                              <Button size="sm" variant="hero" className="text-xs h-7" onClick={() => handleProcessWithdrawal(w.id)}>Processar</Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* Verifications */}
            <TabsContent value="verifications">
              <Card className="bg-card border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">ID</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Usuário</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Tipo</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Documentos</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Status</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Data</th>
                        <th className="text-left p-3 text-xs text-muted-foreground font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifications.length === 0 ? (
                        <tr><td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">Nenhuma verificação encontrada</td></tr>
                      ) : verifications.map((v: any) => {
                        const vUser = users.find((u: any) => u.user_id === v.user_id);
                        return (
                          <tr key={v.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="p-3 text-xs text-primary font-mono">{v.id.slice(0, 8)}</td>
                            <td className="p-3 text-sm text-foreground">{vUser?.name || vUser?.email || v.user_id.slice(0, 8)}</td>
                            <td className="p-3 text-sm text-foreground">{v.doc_type === "cnpj" ? "PJ (CNPJ)" : "PF (CPF)"}</td>
                            <td className="p-3 text-xs text-muted-foreground">
                              {(v.documents?.length || 0) + (v.selfie_path ? 1 : 0)} arquivo(s)
                            </td>
                            <td className="p-3">
                              <Badge className={`${statusColors[v.status] || ""} border-0 text-xs`}>
                                {statusLabels[v.status] || v.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString("pt-BR")}</td>
                            <td className="p-3">
                              {v.status === "pending" && (
                                <div className="flex gap-1">
                                  <Button size="sm" variant="hero" className="text-xs h-7" onClick={() => handleVerification(v.id, "approved")}>
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Aprovar
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs h-7 text-destructive border-destructive/30" onClick={() => handleVerification(v.id, "rejected")}>
                                    <XCircle className="h-3 w-3 mr-1" /> Recusar
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
