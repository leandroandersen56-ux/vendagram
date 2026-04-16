import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Star, Loader2, Camera, ShieldCheck } from "lucide-react";
import { uploadImage } from "@/lib/upload-image";

export default function PanelProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [docType, setDocType] = useState<"cpf" | "cnpj">("cpf");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (user?.id) loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
    if (data) {
      setProfile(data);
      setName(data.name || "");
      setUsername(data.username || "");
      setCpf(data.cpf || "");
      setCnpj((data as any).cnpj || "");
      setDocType((data as any).cnpj ? "cnpj" : "cpf");
      setPhone(data.phone || "");
      setPixKey(data.pix_key || "");
      setBio(data.bio || "");
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploadingAvatar(true);
    try {
      const avatar_url = await uploadImage(file, { maxSizeMB: 5 });
      await supabase.from("profiles").update({ avatar_url }).eq("user_id", user.id);
      setProfile((p: any) => ({ ...p, avatar_url }));
      toast({ title: "Foto atualizada!" });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const updateData: any = {
      name,
      username: username || null,
      cpf: docType === "cpf" ? (cpf || null) : null,
      cnpj: docType === "cnpj" ? (cnpj || null) : null,
      phone: phone || null,
      pix_key: pixKey || null,
      bio: bio || null,
    };

    const { error } = await supabase.from("profiles").update(updateData).eq("user_id", user!.id);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado!" });
    }
    setSaving(false);
  };

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    return digits
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  if (loading) {
    return <div className="flex justify-center pt-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-xl font-semibold text-foreground mb-6">Meu Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="bg-card border-border p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="relative h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-2xl mx-auto mb-4 group overflow-hidden"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
            ) : name?.[0]?.toUpperCase() || "?"}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              {uploadingAvatar ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
          </button>
          <p className="text-[11px] text-muted-foreground mb-2">Clique para alterar a foto</p>
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground mb-1">@{username || "usuario"}</p>
          <p className="text-xs text-muted-foreground mb-3">{profile?.email}</p>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Star className="h-4 w-4 text-warning fill-warning" />
            <span className="text-sm font-medium text-foreground">{profile?.avg_rating?.toFixed(1) || "5.0"}</span>
            <span className="text-xs text-muted-foreground">· {profile?.total_reviews || 0} avaliações</span>
          </div>
          {profile?.is_verified ? (
            <Badge className="bg-primary/10 text-primary border-0">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Vendedor Verificado
            </Badge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-primary text-primary hover:bg-primary/5"
              onClick={() => navigate("/vendedor/verificacao")}
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verificar conta
            </Button>
          )}
          <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Membro desde</span><span className="text-foreground">{new Date(profile?.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}</span></div>
            <div className="flex justify-between"><span>Total de vendas</span><span className="text-foreground">{profile?.total_sales || 0}</span></div>
            <div className="flex justify-between"><span>Total de compras</span><span className="text-foreground">{profile?.total_purchases || 0}</span></div>
          </div>
        </Card>

        {/* Edit form */}
        <Card className="bg-card border-border p-6 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4">Informações Pessoais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Nome Completo</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-muted/30 border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">@Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="seu_username" className="bg-muted/30 border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <Input value={profile?.email || ""} disabled className="bg-muted/30 border-border opacity-50" />
            </div>

            {/* CPF / CNPJ selector */}
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Documento</Label>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setDocType("cpf")}
                  className={`flex-1 text-xs py-1.5 rounded-md border transition-colors ${
                    docType === "cpf"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
                  }`}
                >
                  CPF (Pessoa Física)
                </button>
                <button
                  onClick={() => setDocType("cnpj")}
                  className={`flex-1 text-xs py-1.5 rounded-md border transition-colors ${
                    docType === "cnpj"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
                  }`}
                >
                  CNPJ (Empresa)
                </button>
              </div>
              {docType === "cpf" ? (
                <Input
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="bg-muted/30 border-border"
                />
              ) : (
                <Input
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className="bg-muted/30 border-border"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Telefone (WhatsApp)</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" className="bg-muted/30 border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Chave Pix</Label>
              <Input value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="CPF, email ou chave aleatória" className="bg-muted/30 border-border" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-sm text-muted-foreground">Bio</Label>
              <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Fale sobre você..." className="bg-muted/30 border-border" />
            </div>
          </div>
          <Button variant="hero" className="mt-6" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </Card>
      </div>
    </motion.div>
  );
}
