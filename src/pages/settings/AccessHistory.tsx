import { useState, useEffect } from "react";
import { Monitor, Loader2, ShieldAlert } from "lucide-react";
import DesktopPageShell from "@/components/DesktopPageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AccessHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadHistory();
  }, [user?.id]);

  const loadHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", user!.id)
      .in("action", ["login", "signup", "password_change", "mfa_verify"])
      .order("created_at", { ascending: false })
      .limit(20);

    setSessions(data || []);
    setLoading(false);
  };

  return (
    <DesktopPageShell title="Histórico de acessos" breadcrumbs={[{ label: "Início", to: "/" }, { label: "Configurações", to: "/configuracoes" }, { label: "Histórico de acessos" }]}>
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center pt-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ShieldAlert className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-foreground font-semibold">Nenhum registro de acesso</p>
            <p className="text-muted-foreground text-sm mt-1">Seu histórico de atividades aparecerá aqui</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            {sessions.map((s, i) => {
              const details = s.details as any;
              const device = details?.device || details?.user_agent || "Dispositivo desconhecido";
              const ip = s.ip_address || "—";
              const actionLabel = s.action === "login" ? "Login" : s.action === "signup" ? "Cadastro" : s.action === "password_change" ? "Alteração de senha" : s.action;

              return (
                <div key={s.id || i} className="p-4 flex items-start gap-3">
                  <Monitor className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{actionLabel}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{device}</p>
                    <p className="text-xs text-muted-foreground">IP: {ip}</p>
                    <p className="text-xs text-muted-foreground/70">
                      {formatDistanceToNow(new Date(s.created_at), { locale: ptBR, addSuffix: true })}
                    </p>
                  </div>
                  {i === 0 && <span className="text-xs font-semibold text-success bg-[hsl(var(--success-light))] px-2 py-0.5 rounded-full">Atual</span>}
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs text-muted-foreground text-center px-4">
          Os dados de acesso são mantidos por 30 dias para sua segurança.
        </p>
      </div>
    </DesktopPageShell>
  );
}
