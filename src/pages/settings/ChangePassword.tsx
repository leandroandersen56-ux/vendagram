import { useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/menu/PageHeader";

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
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      <PageHeader title="Alterar senha" />
      <div className="p-4 space-y-3">
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
      </div>
      <div className="fixed bottom-[60px] left-0 right-0 z-40 px-4 pb-4 pt-3" style={{ background: 'linear-gradient(to top, #F5F5F5 60%, transparent)' }}>
        <button onClick={handleSave} disabled={loading || !password} className="w-full h-[52px] rounded-[14px] text-white text-base font-semibold disabled:opacity-40" style={{ background: '#2D6FF0', boxShadow: '0 4px 16px rgba(45,111,240,0.40)' }}>
          {loading ? "Salvando..." : "Alterar senha"}
        </button>
      </div>
    </div>
  );
}