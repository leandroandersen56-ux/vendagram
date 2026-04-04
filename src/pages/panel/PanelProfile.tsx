import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Star, Loader2 } from "lucide-react";

export default function PanelProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [cpf, setCpf] = useState("");
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
      setPhone(data.phone || "");
      setPixKey(data.pix_key || "");
      setBio(data.bio || "");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name, username: username || null, cpf: cpf || null,
      phone: phone || null, pix_key: pixKey || null, bio: bio || null,
    }).eq("user_id", user!.id);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado!" });
    }
    setSaving(false);
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
          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-2xl mx-auto mb-4">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
            ) : name?.[0]?.toUpperCase() || "?"}
          </div>
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground mb-1">@{username || "usuario"}</p>
          <p className="text-xs text-muted-foreground mb-3">{profile?.email}</p>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Star className="h-4 w-4 text-warning fill-warning" />
            <span className="text-sm font-medium text-foreground">{profile?.avg_rating?.toFixed(1) || "5.0"}</span>
            <span className="text-xs text-muted-foreground">· {profile?.total_reviews || 0} avaliações</span>
          </div>
          {profile?.is_verified && (
            <Badge className="bg-primary/10 text-primary border-0">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Vendedor Verificado
            </Badge>
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
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">CPF</Label>
              <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" className="bg-muted/30 border-border" />
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
