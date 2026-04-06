import { Monitor } from "lucide-react";
import DesktopPageShell from "@/components/DesktopPageShell";

export default function AccessHistory() {
  const mockSessions = [
    { device: "Chrome — Windows", ip: "187.xxx.xxx.12", date: "Hoje, 19:45", current: true },
    { device: "Safari — iPhone", ip: "187.xxx.xxx.12", date: "Hoje, 14:20", current: false },
    { device: "Chrome — Android", ip: "189.xxx.xxx.44", date: "Ontem, 08:30", current: false },
  ];

  return (
    <DesktopPageShell title="Histórico de acessos" breadcrumbs={[{ label: "Início", to: "/" }, { label: "Configurações", to: "/configuracoes" }, { label: "Histórico de acessos" }]}>
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden divide-y divide-[#F0F0F0]">
          {mockSessions.map((s, i) => (
            <div key={i} className="p-4 flex items-start gap-3">
              <Monitor className="h-5 w-5 text-[#999] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#111]">{s.device}</p>
                <p className="text-xs text-[#999] mt-0.5">IP: {s.ip}</p>
                <p className="text-xs text-[#999]">{s.date}</p>
              </div>
              {s.current && <span className="text-xs font-semibold text-[#00A650] bg-green-50 px-2 py-0.5 rounded-full">Atual</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-[#999] text-center px-4">
          Os dados de acesso são mantidos por 30 dias para sua segurança.
        </p>
      </div>
    </DesktopPageShell>
  );
}
