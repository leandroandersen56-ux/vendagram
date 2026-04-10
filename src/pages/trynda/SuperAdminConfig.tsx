import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, CreditCard, Mail, Database, Shield, Bell } from "lucide-react";

interface ConfigItem {
  key: string;
  value: string;
  label: string;
  type: "text" | "password" | "number" | "toggle" | "textarea";
  section: string;
}

const CONFIG_SCHEMA: ConfigItem[] = [
  { key: "mp_webhook_url", value: "", label: "Webhook URL (Mercado Pago)", type: "text", section: "mercadopago" },
  { key: "platform_fee_percent", value: "5", label: "Taxa da plataforma (%)", type: "number", section: "mercadopago" },
  { key: "resend_from_email", value: "noreply@froiv.com", label: "Email remetente (FROM)", type: "text", section: "email" },
  { key: "support_email", value: "contato@froiv.com", label: "Email de suporte", type: "text", section: "email" },
  { key: "escrow_auto_release_hours", value: "24", label: "Prazo liberação escrow (horas)", type: "number", section: "escrow" },
  { key: "offer_expiry_hours", value: "24", label: "Expiração de oferta (horas)", type: "number", section: "escrow" },
  { key: "max_offer_discount", value: "50", label: "Desconto máx. ofertas (%)", type: "number", section: "escrow" },
  { key: "maintenance_mode", value: "false", label: "Modo manutenção", type: "toggle", section: "system" },
  { key: "maintenance_message", value: "Estamos em manutenção. Voltamos em breve!", label: "Mensagem manutenção", type: "textarea", section: "system" },
  { key: "max_listings_per_user", value: "50", label: "Máx. anúncios por usuário", type: "number", section: "system" },
];

export default function SuperAdminConfig() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { isLoading } = useQuery({
    queryKey: ["admin-config"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_settings").select("*");
      const map: Record<string, string> = {};
      CONFIG_SCHEMA.forEach(c => { map[c.key] = c.value; });
      data?.forEach(d => { map[d.key] = d.value; });
      setValues(map);
      return map;
    },
  });

  const handleSave = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(values)) {
      await supabase.from("platform_settings").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    }
    await supabase.from("admin_actions").insert({
      admin_id: (await supabase.auth.getUser()).data.user?.id ?? "",
      action: "update_config",
      target_type: "config",
      details: values,
    });
    toast.success("Configurações salvas!");
    setSaving(false);
  };

  const sections = [
    { key: "mercadopago", label: "Mercado Pago", icon: CreditCard },
    { key: "email", label: "Email (Resend)", icon: Mail },
    { key: "escrow", label: "Escrow", icon: Shield },
    { key: "system", label: "Sistema", icon: Bell },
  ];

  if (isLoading) return <div className="text-center py-10 text-gray-500">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Configurações</h1>
        <button onClick={handleSave} disabled={saving}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {sections.map(section => (
        <div key={section.key} className="bg-[#1e1e35] rounded-xl border border-white/[0.06] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <section.icon className="h-4 w-4 text-[#7c3aed]" /> {section.label}
          </h3>
          <div className="grid gap-4">
            {CONFIG_SCHEMA.filter(c => c.section === section.key).map(config => (
              <div key={config.key}>
                <label className="text-xs text-gray-400 mb-1 block">{config.label}</label>
                {config.type === "toggle" ? (
                  <button
                    onClick={() => setValues(v => ({ ...v, [config.key]: v[config.key] === "true" ? "false" : "true" }))}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      values[config.key] === "true" ? "bg-[#7c3aed]" : "bg-gray-700"
                    }`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      values[config.key] === "true" ? "left-[26px]" : "left-0.5"
                    }`} />
                  </button>
                ) : config.type === "textarea" ? (
                  <textarea
                    value={values[config.key] || ""}
                    onChange={e => setValues(v => ({ ...v, [config.key]: e.target.value }))}
                    className="w-full bg-[#0f0f1a] border border-white/[0.06] rounded-lg p-3 text-sm text-white min-h-[60px] focus:outline-none focus:border-[#7c3aed]"
                  />
                ) : (
                  <input
                    type={config.type}
                    value={values[config.key] || ""}
                    onChange={e => setValues(v => ({ ...v, [config.key]: e.target.value }))}
                    className="w-full bg-[#0f0f1a] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7c3aed]"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
