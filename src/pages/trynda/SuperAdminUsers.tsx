import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { supabase as prodSupabase } from "@/lib/supabase-custom-client";
import { formatBRL } from "@/hooks/useAdminStats";
import { Search, ChevronLeft, ChevronRight, X, Eye, Ban, DollarSign, Mail, LogIn, Trash2 } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { toast } from "sonner";

const PARTNER_EMAILS = [
  "sparckonmeta@gmail.com",
  "contabanco743@gmail.com",
  "vg786674@gmail.com",
  "costawlc7@gmail.com",
  "eduardoklunck95@gmail.com",
];

const isPartnerVerified = (email?: string | null) =>
  !!email && PARTNER_EMAILS.includes(email.toLowerCase());

export default function SuperAdminUsers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [impersonating, setImpersonating] = useState(false);
  const PAGE_SIZE = 50;

  const handleImpersonate = async (userId: string, userName: string) => {
    if (impersonating) return;
    const confirm = window.confirm(`Logar como "${userName}"? Você será deslogado da sua conta atual.`);
    if (!confirm) return;

    setImpersonating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Sessão expirada"); return; }

      const res = await supabase.functions.invoke("impersonate-user", {
        body: { user_id: userId },
      });

      console.log("Impersonate response:", res);

      if (res.error) {
        toast.error("Erro ao gerar link: " + (res.error?.message || "falha de rede/CORS"));
        console.error("Invoke error:", res.error);
        return;
      }

      if (!res.data?.url) {
        toast.error("Resposta inválida da função");
        console.error("Response data:", res.data);
        return;
      }

      toast.success("Redirecionando...");
      window.open(res.data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Erro de rede ao chamar a função");
    } finally {
      setImpersonating(false);
    }
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", search, page],
    queryFn: async () => {
      let q = supabase.from("profiles").select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (search) {
        q = q.or(`email.ilike.%${search}%,name.ilike.%${search}%,username.ilike.%${search}%`);
      }
      const { data, count } = await q;
      return { users: data ?? [], total: count ?? 0 };
    },
  });

  const { data: wallets } = useQuery({
    queryKey: ["admin-wallets"],
    queryFn: async () => {
      const { data } = await supabase.from("wallets").select("*");
      return data ?? [];
    },
  });

  const getWallet = (userId: string) => wallets?.find(w => w.user_id === userId);

  const handleAdjustBalance = async () => {
    if (!selectedUser || !adjustAmount) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount)) { toast.error("Valor inválido"); return; }
    
    const { error } = await supabase.rpc("increment_wallet", {
      user_uuid: selectedUser.user_id,
      field: "balance",
      amount,
    });
    if (error) { toast.error("Erro ao ajustar saldo"); return; }

    await supabase.from("admin_actions").insert({
      admin_id: (await supabase.auth.getUser()).data.user?.id ?? "",
      action: "adjust_balance",
      target_type: "user",
      target_id: selectedUser.user_id,
      details: { amount, reason: adjustReason },
    });

    toast.success(`Saldo ajustado em ${formatBRL(amount)}`);
    setAdjustAmount("");
    setAdjustReason("");
    refetch();
  };

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">Usuários ({data?.total ?? 0})</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por email, nome..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full bg-[#1a1a2e] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#7c3aed]"
          />
        </div>
      </div>

      <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Usuário", "Email", "Cadastro", "Compras", "Vendas", "Saldo", "Ações"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] text-gray-400 uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">Carregando...</td></tr>
              ) : data?.users.map(user => {
                const wallet = getWallet(user.user_id);
                return (
                  <tr key={user.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#7c3aed]/30 flex items-center justify-center text-[#c4b5fd] text-xs font-bold">
                          {(user.name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium flex items-center gap-1">{user.name || "—"} {(user.is_verified || isPartnerVerified(user.email)) && <VerifiedBadge size={14} />}</p>
                          {user.username && <p className="text-gray-500 text-xs">@{user.username}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{user.email || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(user.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{user.total_purchases}</td>
                    <td className="px-4 py-3 text-gray-300">{user.total_sales}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">
                      {formatBRL(wallet?.balance ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-[#7c3aed] hover:text-[#c4b5fd]"
                          title="Detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleImpersonate(user.user_id, user.name || user.email || "usuário")}
                          className="text-orange-400 hover:text-orange-300"
                          title="Logar como este usuário"
                          disabled={impersonating}
                        >
                          <LogIn className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="text-gray-400 hover:text-white disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-xs text-gray-400">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="text-gray-400 hover:text-white disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>

      {/* User Detail Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-md bg-[#1a1a2e] border-l border-white/[0.06] overflow-y-auto">
            <div className="p-6 border-b border-white/[0.06] flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedUser.name || "Sem nome"}</h2>
                <p className="text-sm text-gray-400">{selectedUser.email}</p>
                {selectedUser.username && <p className="text-xs text-gray-500">@{selectedUser.username}</p>}
                <div className="flex gap-2 mt-2">
                  {selectedUser.is_verified && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Verificado</span>}
                  <button
                    onClick={() => handleImpersonate(selectedUser.user_id, selectedUser.name || selectedUser.email || "usuário")}
                    disabled={impersonating}
                    className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full hover:bg-orange-500/30 flex items-center gap-1"
                  >
                    <LogIn className="h-3 w-3" /> Logar como
                  </button>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info */}
              <div className="space-y-3">
                <h3 className="text-xs text-gray-400 uppercase font-medium">Informações</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Telefone</span><p className="text-white">{selectedUser.phone || "—"}</p></div>
                  <div><span className="text-gray-500">CPF</span><p className="text-white">{selectedUser.cpf || "—"}</p></div>
                  <div><span className="text-gray-500">Compras</span><p className="text-white">{selectedUser.total_purchases}</p></div>
                  <div><span className="text-gray-500">Vendas</span><p className="text-white">{selectedUser.total_sales}</p></div>
                  <div><span className="text-gray-500">Avaliação</span><p className="text-white">⭐ {selectedUser.avg_rating}</p></div>
                  <div><span className="text-gray-500">Cadastro</span><p className="text-white">{new Date(selectedUser.created_at).toLocaleDateString("pt-BR")}</p></div>
                </div>
              </div>

              {/* Wallet */}
              <div className="space-y-3">
                <h3 className="text-xs text-gray-400 uppercase font-medium">Carteira</h3>
                {(() => {
                  const w = getWallet(selectedUser.user_id);
                  return (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#0f0f1a] rounded-lg p-3 text-center">
                        <p className="text-[10px] text-gray-500">Disponível</p>
                        <p className="text-sm text-emerald-400 font-bold">{formatBRL(w?.balance ?? 0)}</p>
                      </div>
                      <div className="bg-[#0f0f1a] rounded-lg p-3 text-center">
                        <p className="text-[10px] text-gray-500">Pendente</p>
                        <p className="text-sm text-yellow-400 font-bold">{formatBRL(w?.pending ?? 0)}</p>
                      </div>
                      <div className="bg-[#0f0f1a] rounded-lg p-3 text-center">
                        <p className="text-[10px] text-gray-500">Total</p>
                        <p className="text-sm text-white font-bold">{formatBRL(w?.total_earned ?? 0)}</p>
                      </div>
                    </div>
                  );
                })()}

                <div className="bg-[#0f0f1a] rounded-lg p-3 space-y-2">
                  <p className="text-xs text-gray-400 font-medium">Ajuste manual de saldo</p>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor (ex: 50.00 ou -20.00)"
                    value={adjustAmount}
                    onChange={e => setAdjustAmount(e.target.value)}
                    className="w-full bg-[#1a1a2e] border border-white/[0.06] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7c3aed]"
                  />
                  <input
                    type="text"
                    placeholder="Motivo"
                    value={adjustReason}
                    onChange={e => setAdjustReason(e.target.value)}
                    className="w-full bg-[#1a1a2e] border border-white/[0.06] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7c3aed]"
                  />
                  <button
                    onClick={handleAdjustBalance}
                    className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded py-2 text-sm font-medium"
                  >
                    Aplicar ajuste
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
