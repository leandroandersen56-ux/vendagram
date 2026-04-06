import { useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DesktopPageShell from "@/components/DesktopPageShell";

export default function ChangePassword() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (password.length < 6) { toast({ title: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" }); return; }
    if (password !== confirm) { toast({ title: "As senhas não coincidem", variant: "destructive" }); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast({ title: "Erro ao alterar senha", description: error.message, variant: "destructive" });
    else { toast({ title: "Senha alterada com sucesso!" }); navigate(-1); }
  };

  return (
    <DesktopPageShell title="Alterar senha" breadcrumbs={[{ label: "Início", to: "/" }, { label: "Configurações", to: "/configuracoes" }, { label: "Alterar senha" }]}>
      <div className="space-y-3">
        <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden divide-y divide-[#F0F0F0]">
          <div className="p-4">
            <label className="text-[12px] text-[#999] font-medium block mb-1.5">Nova senha</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="bg-transparent border-[#E8E8E8] h-11 rounded-xl" />
          </div>
          <div className="p-4">
            <label className="text-[12px] text-[#999] font-medium block mb-1.5">Confirmar nova senha</label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repita a senha" className="bg-transparent border-[#E8E8E8] h-11 rounded-xl" />
          </div>
        </div>
        <button onClick={handleSave} disabled={loading || !password} className="w-full h-[52px] rounded-[14px] text-white text-base font-semibold disabled:opacity-40 bg-primary">
          {loading ? "Salvando..." : "Alterar senha"}
        </button>
      </div>
    </DesktopPageShell>
  );
}
