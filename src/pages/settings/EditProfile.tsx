import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DesktopPageShell from "@/components/DesktopPageShell";
import { Camera, Loader2 } from "lucide-react";

export default function EditProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: "", username: "", bio: "", phone: "", whatsapp: "" });

  useEffect(() => {
    if (!user?.id) return;
    supabase.from("profiles").select("name, username, bio, phone, whatsapp, avatar_url").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setForm({ name: data.name || "", username: data.username || "", bio: data.bio || "", phone: data.phone || "", whatsapp: data.whatsapp || "" });
        setAvatarUrl(data.avatar_url || null);
      }
    });
  }, [user?.id]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Imagem muito grande", description: "Máximo 2MB", variant: "destructive" });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({ title: "Formato inválido", description: "Envie uma imagem (JPG, PNG, WEBP)", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({ title: "Foto atualizada!" });
    } catch (err: any) {
      toast({ title: "Erro ao enviar foto", description: err.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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

  const initials = (form.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <DesktopPageShell title="Editar perfil" breadcrumbs={[{ label: "Início", to: "/" }, { label: "Configurações", to: "/configuracoes" }, { label: "Editar perfil" }]}>
      <div className="space-y-3">
        {/* Avatar section */}
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="relative w-24 h-24 rounded-full overflow-hidden bg-primary/10 border-2 border-border hover:border-primary/50 transition-colors group"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </div>
            </button>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Camera className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Toque para alterar a foto</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

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
        <button onClick={handleSave} disabled={loading} className="w-full h-[52px] rounded-[14px] text-white text-base font-semibold disabled:opacity-40 bg-primary">
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </DesktopPageShell>
  );
}
