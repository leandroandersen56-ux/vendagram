import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/hooks/useAdminStats";
import { Bell, Send } from "lucide-react";
import { toast } from "sonner";

interface LiveEvent {
  id: string;
  type: string;
  message: string;
  time: Date;
}

export default function SuperAdminNotifications() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [filter, setFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const channel = supabase.channel("admin-notif-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions" }, (p) => {
        setEvents(prev => [{ id: crypto.randomUUID(), type: "sale", message: `Nova venda — ${formatBRL(Number(p.new.amount))}`, time: new Date() }, ...prev].slice(0, 50));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, (p) => {
        setEvents(prev => [{ id: crypto.randomUUID(), type: "signup", message: `Novo cadastro — ${p.new.email || p.new.name}`, time: new Date() }, ...prev].slice(0, 50));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "listings" }, (p) => {
        setEvents(prev => [{ id: crypto.randomUUID(), type: "listing", message: `Novo anúncio — ${p.new.title}`, time: new Date() }, ...prev].slice(0, 50));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "disputes" }, () => {
        setEvents(prev => [{ id: crypto.randomUUID(), type: "dispute", message: "Nova disputa aberta", time: new Date() }, ...prev].slice(0, 50));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "withdrawals" }, (p) => {
        setEvents(prev => [{ id: crypto.randomUUID(), type: "withdrawal", message: `Novo saque — ${formatBRL(Number(p.new.amount))}`, time: new Date() }, ...prev].slice(0, 50));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMassNotification = async () => {
    if (!title || !body) { toast.error("Preencha título e mensagem"); return; }
    setSending(true);
    const { data: users } = await supabase.from("profiles").select("user_id");
    if (users) {
      const notifs = users.map(u => ({ user_id: u.user_id, title, body }));
      const { error } = await supabase.from("notifications").insert(notifs);
      if (error) toast.error("Erro ao enviar");
      else toast.success(`Enviado para ${users.length} usuários`);
    }
    setSending(false);
    setTitle("");
    setBody("");
  };

  const filters = ["all", "sale", "signup", "listing", "dispute", "withdrawal"];
  const icons: Record<string, string> = { sale: "🟢", signup: "🔵", listing: "🟡", dispute: "🔴", withdrawal: "💸" };
  const filtered = filter === "all" ? events : events.filter(e => e.type === filter);

  const timeAgo = (d: Date) => {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return `há ${s}s`;
    if (s < 3600) return `há ${Math.floor(s / 60)}min`;
    return `há ${Math.floor(s / 3600)}h`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Notificações em Tempo Real</h1>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              filter === f ? "bg-[#7c3aed] text-white" : "bg-[#1a1a2e] text-gray-400 hover:text-white"
            }`}>
            {f === "all" ? "Tudo" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-semibold text-gray-300">Feed ao vivo</span>
        </div>
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-10">Aguardando eventos...</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filtered.map(e => (
              <div key={e.id} className="flex items-center gap-3 bg-[#0f0f1a] rounded-lg px-4 py-3 text-sm">
                <span>{icons[e.type] || "📌"}</span>
                <span className="text-gray-200 flex-1">{e.message}</span>
                <span className="text-gray-500 text-xs">{timeAgo(e.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mass notification */}
      <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Send className="h-4 w-4" /> Enviar notificação em massa
        </h3>
        <input type="text" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)}
          className="w-full bg-[#0f0f1a] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7c3aed]" />
        <textarea placeholder="Mensagem" value={body} onChange={e => setBody(e.target.value)}
          className="w-full bg-[#0f0f1a] border border-white/[0.06] rounded-lg p-3 text-sm text-white min-h-[80px] focus:outline-none focus:border-[#7c3aed]" />
        <button onClick={sendMassNotification} disabled={sending}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">
          {sending ? "Enviando..." : "Enviar para todos"}
        </button>
      </div>
    </div>
  );
}
