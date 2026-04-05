import { useState, useEffect } from "react";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/menu/PageHeader";

export default function PixKeys() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pixKey, setPixKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from("profiles").select("pix_key").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data?.pix_key) { setSavedKey(data.pix_key); setPixKey(data.pix_key); }
    });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ pix_key: pixKey || null }).eq("user_id", user.id);
    setLoading(false);
    if (error) toast({ title: "Erro", variant: "destructive" });
    else { toast({ title: "Chave Pix salva!" }); setSavedKey(pixKey); }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      <PageHeader title="Chaves Pix salvas" />
      <div className="p-4 space-y-3">
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-[#111]">Chave Pix para saques</p>
          </div>
          <p className="text-xs text-[#888]">Esta chave será usada para receber saques da sua carteira.</p>
          <Input value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="CPF, email, telefone ou chave aleatória" className="bg-transparent border-[#E8E8E8] h-11 rounded-xl" />
          {savedKey && <p className="text-xs text-[#00A650]">✓ Chave cadastrada: {savedKey}</p>}
        </div>
      </div>
      <div className="fixed bottom-[60px] left-0 right-0 z-40 px-4 pb-4 pt-3" style={{ background: 'linear-gradient(to top, #F5F5F5 60%, transparent)' }}>
        <button onClick={handleSave} disabled={loading} className="w-full h-[52px] rounded-[14px] text-white text-base font-semibold disabled:opacity-40" style={{ background: '#2D6FF0', boxShadow: '0 4px 16px rgba(45,111,240,0.40)' }}>
          {loading ? "Salvando..." : "Salvar chave Pix"}
        </button>
      </div>
    </div>
  );
}