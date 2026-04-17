import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPartnerResource } from "@/lib/fetch-partner-resource";
import { Users, Search, ShieldCheck, Mail, Calendar } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PartnerUsers() {
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["partner-users-list-fn"],
    queryFn: () => fetchPartnerResource<any>("users"),
    refetchInterval: 60_000,
    retry: 1,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u: any) => {
      const hay = `${u.name ?? ""} ${u.username ?? ""} ${u.email ?? ""} ${u.whatsapp ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, search]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#F0F9FF] flex items-center gap-2">
            <Users className="h-5 w-5 text-[#0ea5e9]" />
            Usuários cadastrados
          </h1>
          <p className="text-xs sm:text-sm text-[#7DD3FC]/70">
            Visualização completa dos usuários da plataforma — apenas leitura.
          </p>
        </div>
        <span className="text-xs text-[#7DD3FC] bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 px-3 py-1.5 rounded-full">
          {users.length} {users.length === 1 ? "usuário" : "usuários"}
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7DD3FC]/50" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, usuário, email ou WhatsApp..."
          className="w-full bg-[#142952] border border-[rgba(14,165,233,0.2)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F0F9FF] placeholder:text-[#7DD3FC]/40 focus:outline-none focus:border-[#0ea5e9]"
        />
      </div>

      {/* Lista */}
      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] overflow-hidden">
        {isLoading ? (
          <p className="text-[#7DD3FC]/50 text-sm text-center py-12">Carregando...</p>
        ) : error ? (
          <div className="text-center py-12 px-4">
            <p className="text-rose-300 text-sm font-semibold">Falha ao carregar usuários</p>
            <p className="text-[#7DD3FC]/60 text-xs mt-1">{error instanceof Error ? error.message : "Tente novamente em instantes."}</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-[#7DD3FC]/50 text-sm text-center py-12">
            {search ? "Nenhum usuário encontrado para essa busca." : "Nenhum usuário cadastrado."}
          </p>
        ) : (
          <>
            {/* Desktop: tabela */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0a1628] text-[11px] uppercase tracking-wider text-[#7DD3FC]/70">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Usuário</th>
                    <th className="px-4 py-3 text-left font-semibold">Contato</th>
                    <th className="px-4 py-3 text-center font-semibold">Vendas</th>
                    <th className="px-4 py-3 text-center font-semibold">Compras</th>
                    <th className="px-4 py-3 text-center font-semibold">Nota</th>
                    <th className="px-4 py-3 text-right font-semibold">Cadastrado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(14,165,233,0.1)]">
                  {filtered.map((u: any) => (
                    <tr key={u.user_id} className="hover:bg-[rgba(14,165,233,0.05)]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center text-[#7DD3FC] text-xs font-bold shrink-0">
                              {(u.name || "?")[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[#F0F9FF] font-medium truncate flex items-center gap-1">
                              {u.name || "Usuário"}
                              {u.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-[#0ea5e9]" />}
                            </p>
                            {u.username && <p className="text-[11px] text-[#7DD3FC]/60 truncate">@{u.username}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#7DD3FC]/80 text-xs">
                        {u.email && (
                          <p className="flex items-center gap-1.5 truncate max-w-[220px]">
                            <Mail className="h-3 w-3 shrink-0" /> {u.email}
                          </p>
                        )}
                        {u.whatsapp && <p className="text-[11px] text-[#7DD3FC]/60 mt-0.5">{u.whatsapp}</p>}
                      </td>
                      <td className="px-4 py-3 text-center text-[#F0F9FF]">{u.total_sales ?? 0}</td>
                      <td className="px-4 py-3 text-center text-[#F0F9FF]">{u.total_purchases ?? 0}</td>
                      <td className="px-4 py-3 text-center text-[#F0F9FF]">
                        {u.avg_rating ? Number(u.avg_rating).toFixed(1) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-[#7DD3FC]/70 text-xs whitespace-nowrap">
                        <p>{format(new Date(u.created_at), "dd/MM/yyyy")}</p>
                        <p className="text-[10px] text-[#7DD3FC]/50">
                          {formatDistanceToNow(new Date(u.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <div className="md:hidden divide-y divide-[rgba(14,165,233,0.1)]">
              {filtered.map((u: any) => (
                <div key={u.user_id} className="p-3 flex items-center gap-3">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center text-[#7DD3FC] text-sm font-bold shrink-0">
                      {(u.name || "?")[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F0F9FF] text-sm font-medium truncate flex items-center gap-1">
                      {u.name || "Usuário"}
                      {u.is_verified && <ShieldCheck className="h-3 w-3 text-[#0ea5e9]" />}
                    </p>
                    {u.email && <p className="text-[11px] text-[#7DD3FC]/60 truncate">{u.email}</p>}
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-[#7DD3FC]/70">
                      <span>{u.total_sales ?? 0} vendas</span>
                      <span>·</span>
                      <span>{u.total_purchases ?? 0} compras</span>
                      {u.avg_rating > 0 && (
                        <>
                          <span>·</span>
                          <span>★ {Number(u.avg_rating).toFixed(1)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-[#7DD3FC]/60 flex items-center gap-1 justify-end">
                      <Calendar className="h-2.5 w-2.5" />
                      {format(new Date(u.created_at), "dd/MM/yy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
