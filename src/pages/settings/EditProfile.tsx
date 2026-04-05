import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/menu/PageHeader";

export default function EditProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", bio: "", phone: "", whatsapp: "" });

  useEffect(() => {
    if (!user?.id) return;
    supabase.from("profiles").select("name, username, bio, phone, whatsapp").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setForm({ name: data.name || "", username: data.username || "", bio: data.bio || "", phone: data.phone || "", whatsapp: data.whatsapp || "" });
    });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({
      name: form.name || null, username: form.username || null, bio: form.bio || null,
      phone: form.phone || null, whatsapp: form.whatsapp || null,
    }).eq("user_id", user.id);
    setLoading(false);
    if (error) { toast({ title: "Erro ao salvar", variant: "destructive" }); }
    else { toast({ title: "Perfil atualizado!" }); navigate(-1); }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      <PageHeader title="Editar perfil" />
      <div className="p-4 space-y-3">
        <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden divide-y divide-[#F0F0F0]">
          <div className="p-4">
            <label className="text-[12px] text-[#999] font-medium block mb-1.5">Nome</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" className="bg-transparent border-[#E8E8E8] h-11 rounded-xl" />
          </div>
          <div className="p-4">
            <label className="text-[12px] text-[#999] font-medium block mb-1.5">@username</label>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username" className="bg-transparent border-[#E8E8E8] h-11 rounded-xl" />
          </div>
          <div className="p-4">
            <label className="text-[12px] text-[#999] font-medium block mb-1.5">Bio</label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Fale um pouco sobre você" className="bg-transparent border-[#E8E8E8] rounded-xl min-h-[60px]" />
          </div>
          <div className="p-4">
            <label className="text-[12px] text-[#999] font-medium block mb-1.5">Telefone</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" className="bg-transparent border-[#E8E8E8] h-11 rounded-xl" />
          </div>
          <div className="p-4">
            <label className="text-[12px] text-[#999] font-medium block mb-1.5">WhatsApp</label>
            <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="(11) 99999-9999" className="bg-transparent border-[#E8E8E8] h-11 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="fixed bottom-[60px] left-0 right-0 z-40 px-4 pb-4 pt-3" style={{ background: 'linear-gradient(to top, #F5F5F5 60%, transparent)' }}>
        <button onClick={handleSave} disabled={loading} className="w-full h-[52px] rounded-[14px] text-white text-base font-semibold disabled:opacity-40" style={{ background: '#2D6FF0', boxShadow: '0 4px 16px rgba(45,111,240,0.40)' }}>
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}