import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, Search, Eye, ShoppingCart, DollarSign, TrendingUp, Users } from "lucide-react";
import { formatBRL } from "@/hooks/useAdminStats";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  processing: { label: "Processando", color: "bg-yellow-500/20 text-yellow-400" },
  completed: { label: "Concluído", color: "bg-emerald-500/20 text-emerald-400" },
  "on-hold": { label: "Em espera", color: "bg-orange-500/20 text-orange-400" },
  pending: { label: "Pendente", color: "bg-gray-500/20 text-gray-400" },
  cancelled: { label: "Cancelado", color: "bg-red-500/20 text-red-400" },
  refunded: { label: "Reembolsado", color: "bg-purple-500/20 text-purple-400" },
  failed: { label: "Falhou", color: "bg-red-600/20 text-red-500" },
};

export default function SuperAdminOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["external-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("external_orders")
        .select("*, external_customers(*), external_order_items(*)")
        .order("ordered_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
    refetchInterval: 60_000,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["external-orders"] });
    toast.success("Dados atualizados! O scraper externo alimenta automaticamente.");
  };

  const filtered = orders.filter((o: any) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesSearch =
      !search ||
      o.external_id?.toLowerCase().includes(search.toLowerCase()) ||
      o.external_customers?.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.external_customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.external_order_items?.some((i: any) => i.product_name?.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Metrics
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o: any) => o.ordered_at?.slice(0, 10) === today);
  const todayTotal = todayOrders.reduce((s: number, o: any) => s + Number(o.total_amount), 0);
  const totalGmv = orders.reduce((s: number, o: any) => s + Number(o.total_amount), 0);
  const avgTicket = orders.length ? totalGmv / orders.length : 0;
  const uniqueCustomers = new Set(orders.map((o: any) => o.customer_id).filter(Boolean)).size;

  const metrics = [
    { label: "Vendas Hoje", value: formatBRL(todayTotal), sub: `${todayOrders.length} pedidos`, icon: DollarSign, color: "text-emerald-400" },
    { label: "Total Pedidos", value: orders.length.toString(), sub: "capturados", icon: ShoppingCart, color: "text-blue-400" },
    { label: "Ticket Médio", value: formatBRL(avgTicket), sub: "por pedido", icon: TrendingUp, color: "text-purple-400" },
    { label: "Clientes", value: uniqueCustomers.toString(), sub: "únicos", icon: Users, color: "text-orange-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">Pedidos Externos</h1>
        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
          {syncMutation.isPending ? "Sincronizando..." : "Sincronizar agora"}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-[#1e1e35] rounded-xl border border-white/[0.06] p-4">
            <div className="flex items-center gap-2 mb-2">
              <m.icon className={`h-4 w-4 ${m.color}`} />
              <span className="text-xs text-gray-400">{m.label}</span>
            </div>
            <p className="text-lg font-bold text-white">{m.value}</p>
            <p className="text-xs text-gray-500">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por ID, email, produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1a1a2e] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#7c3aed]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#1a1a2e] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7c3aed]"
        >
          <option value="all">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Carregando pedidos...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Nenhum pedido encontrado. Clique em "Sincronizar agora" para capturar pedidos.
        </div>
      ) : (
        <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-400 text-xs">
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Produtos</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Valor</th>
                  <th className="text-center p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order: any) => {
                  const st = STATUS_LABELS[order.status] || { label: order.status, color: "bg-gray-500/20 text-gray-400" };
                  return (
                    <tr key={order.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 text-white font-mono text-xs">#{order.external_id}</td>
                      <td className="p-3 text-gray-400 text-xs">
                        {order.ordered_at ? new Date(order.ordered_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="p-3">
                        <p className="text-white text-xs">{order.external_customers?.name || "—"}</p>
                        <p className="text-gray-500 text-[10px]">{order.external_customers?.email || ""}</p>
                      </td>
                      <td className="p-3 text-gray-300 text-xs max-w-[200px] truncate">
                        {order.external_order_items?.map((i: any) => i.product_name).join(", ") || "—"}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="p-3 text-right text-white font-medium text-xs">
                        {formatBRL(Number(order.total_amount))}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-gray-400 hover:text-[#7c3aed] transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedOrder(null)}>
          <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Pedido #{selectedOrder.external_id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 text-xs">Status</span>
                  <p className="text-white">{STATUS_LABELS[selectedOrder.status]?.label || selectedOrder.status}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Data</span>
                  <p className="text-white">{selectedOrder.ordered_at ? new Date(selectedOrder.ordered_at).toLocaleString("pt-BR") : "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Pagamento</span>
                  <p className="text-white">{selectedOrder.payment_method || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Moeda</span>
                  <p className="text-white">{selectedOrder.currency}</p>
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-3">
                <span className="text-gray-500 text-xs">Cliente</span>
                <p className="text-white">{selectedOrder.external_customers?.name || "—"}</p>
                <p className="text-gray-400 text-xs">{selectedOrder.external_customers?.email || ""}</p>
                {selectedOrder.external_customers?.country && (
                  <p className="text-gray-500 text-xs">País: {selectedOrder.external_customers.country}</p>
                )}
                {selectedOrder.external_customers?.ip_address && (
                  <p className="text-gray-500 text-xs">IP: {selectedOrder.external_customers.ip_address}</p>
                )}
              </div>

              <div className="border-t border-white/[0.06] pt-3">
                <span className="text-gray-500 text-xs">Produtos</span>
                {selectedOrder.external_order_items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between mt-1">
                    <span className="text-white text-xs">{item.quantity}x {item.product_name}</span>
                    <span className="text-gray-300 text-xs">{formatBRL(Number(item.price))}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/[0.06] pt-3 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 text-xs">Total</span>
                  <p className="text-white font-bold">{formatBRL(Number(selectedOrder.total_amount))}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Taxa plataforma</span>
                  <p className="text-gray-300">{formatBRL(Number(selectedOrder.platform_fee))}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Comissão</span>
                  <p className="text-gray-300">{formatBRL(Number(selectedOrder.commission))}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Valor líquido</span>
                  <p className="text-emerald-400 font-bold">{formatBRL(Number(selectedOrder.net_amount))}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
