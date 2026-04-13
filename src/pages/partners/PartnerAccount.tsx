import { usePartner } from "./PartnerGuard";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Percent, Key, Calendar, Lock } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export default function PartnerAccount() {
  const partner = usePartner();
  const { user } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Mínimo 6 caracteres");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Senha alterada!");
      setNewPassword("");
      setShowPasswordForm(false);
    }
  };

  const items = [
    { label: "Nome", value: partner.name, icon: User },
    { label: "Email", value: partner.email, icon: Mail },
    { label: "Participação", value: `${partner.profit_percent}% do faturamento`, icon: Percent },
    { label: "Chave Pix", value: partner.pix_key || "Não cadastrada", icon: Key },
    { label: "Sócio desde", value: format(new Date(partner.created_at), "dd/MM/yyyy"), icon: Calendar },
  ];

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-bold text-[#F0F9FF]">👤 Minha Conta</h1>

      <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] divide-y divide-[rgba(14,165,233,0.1)]">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 px-5 py-4">
            <item.icon className="h-4 w-4 text-[#0ea5e9] shrink-0" />
            <div className="flex-1">
              <p className="text-[11px] text-[#7DD3FC]/60 uppercase">{item.label}</p>
              <p className="text-sm text-[#F0F9FF]">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {!showPasswordForm ? (
        <button
          onClick={() => setShowPasswordForm(true)}
          className="flex items-center gap-2 bg-[#142952] border border-[rgba(14,165,233,0.15)] rounded-xl px-5 py-3 text-sm text-[#0ea5e9] hover:bg-[#0ea5e9]/10 w-full"
        >
          <Lock className="h-4 w-4" /> Alterar senha
        </button>
      ) : (
        <div className="bg-[#142952] rounded-xl border border-[rgba(14,165,233,0.15)] p-5 space-y-3">
          <label className="text-xs text-[#7DD3FC] block">Nova senha</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-[#0a1628] border border-[rgba(14,165,233,0.15)] rounded-lg px-3 py-2.5 text-[#F0F9FF] text-sm focus:outline-none focus:border-[#0ea5e9]"
            placeholder="Mínimo 6 caracteres"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowPasswordForm(false)} className="flex-1 bg-[#0a1628] text-[#7DD3FC] rounded-lg py-2 text-sm">
              Cancelar
            </button>
            <button onClick={handleChangePassword} disabled={saving} className="flex-1 bg-[#0ea5e9] text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
