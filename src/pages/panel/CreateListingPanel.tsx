import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { PLATFORMS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const FOLLOWER_RANGES = [
  "0 - 500", "500 - 1K", "1K - 5K", "5K - 10K", "10K - 50K", "50K - 100K", "100K - 500K", "500K+"
];

const ACCOUNT_FEATURES: Record<string, string[]> = {
  free_fire: ["Sem restrições", "Email de criação", "Vinculada ao Facebook", "Vinculada ao Google", "Conta antiga", "Skins raras"],
  instagram: ["Sem restrições", "Sem doc vinculado", "Email de criação", "100% seguidores BR", "Conta verificada", "2FA ativo", "Monetização ativa"],
  tiktok: ["Sem restrições", "Sem doc vinculado", "Email de criação", "100% seguidores BR", "Conta verificada", "2FA ativo", "Shop ativo", "Lives liberadas"],
  facebook: ["Sem restrições", "Marketplace ativo", "Página vinculada", "Conta antiga", "Sem doc vinculado"],
  youtube: ["Monetizado", "Sem strikes", "Sem restrições", "Conta antiga", "100% inscritos BR"],
  valorant: ["Sem restrições", "Skins raras", "Conta antiga", "Rank alto"],
  fortnite: ["Sem restrições", "Skins raras", "Conta antiga", "Battle Pass"],
  roblox: ["Sem restrições", "Robux inclusos", "Conta antiga", "Items raros"],
  clash_royale: ["Sem restrições", "Conta alta", "Cards maxados", "Gems inclusos"],
  other: ["Sem restrições", "Email de criação", "Conta antiga"],
};

export default function CreateListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [platform, setPlatform] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [followers, setFollowers] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [step, setStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);

  const features = ACCOUNT_FEATURES[platform] || [];

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const handleSubmit = async () => {
    if (!platform || !title || !price || !acceptTerms) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Faça login para publicar", variant: "destructive" });
      return;
    }

    setLoading(true);
    const highlights: Record<string, string | boolean> = {};
    if (followers) highlights["Seguidores"] = followers;
    selectedFeatures.forEach((f) => (highlights[f] = true));

    const { error } = await supabase.from("listings").insert({
      title,
      description,
      price: parseFloat(price),
      category: platform as any,
      seller_id: user.id,
      highlights,
      status: "active",
    });

    setLoading(false);
    if (error) {
      toast({ title: "Erro ao criar anúncio", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Anúncio publicado com sucesso!" });
      navigate("/painel/anuncios");
    }
  };

  if (step === "preview") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" onClick={() => setStep("form")} className="mb-6 text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao formulário
        </Button>
        <Card className="bg-card border-border p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Preview do Anúncio</h2>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Plataforma: <span className="text-foreground">{PLATFORMS.find((p) => p.id === platform)?.name}</span></p>
            <p className="text-sm text-muted-foreground">Título: <span className="text-foreground">{title}</span></p>
            <p className="text-sm text-muted-foreground">Preço: <span className="text-primary font-bold">R$ {price}</span></p>
            {followers && <p className="text-sm text-muted-foreground">Seguidores: <span className="text-foreground">{followers}</span></p>}
            {description && <p className="text-sm text-muted-foreground">Descrição: <span className="text-foreground">{description}</span></p>}
            {selectedFeatures.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedFeatures.map((f) => (
                  <span key={f} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">✅ {f}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="glass" onClick={() => setStep("form")}>Editar</Button>
            <Button variant="hero" onClick={handleSubmit} disabled={loading}>
              {loading ? "Publicando..." : "Publicar Anúncio"}
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-xl font-bold text-foreground mb-2">Criar Anúncio</h1>
      <p className="text-muted-foreground text-sm mb-6">Preencha os detalhes da conta que deseja vender</p>

      <div className="space-y-5 max-w-2xl">
        {/* Plataforma */}
        <div className="space-y-2">
          <Label className="text-foreground">Plataforma *</Label>
          <Select value={platform} onValueChange={(v) => { setPlatform(v); setSelectedFeatures([]); }}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Selecione a plataforma" />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.icon} {p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <Label className="text-foreground">Título *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Conta TikTok BR 2K seguidores" className="bg-card border-border" />
        </div>

        {/* Seguidores */}
        <div className="space-y-2">
          <Label className="text-foreground">Seguidores / Nível</Label>
          <Select value={followers} onValueChange={setFollowers}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Selecione a faixa" />
            </SelectTrigger>
            <SelectContent>
              {FOLLOWER_RANGES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preço */}
        <div className="space-y-2">
          <Label className="text-foreground">Preço (R$) *</Label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="130" className="bg-card border-border" />
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label className="text-foreground">Descrição</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes adicionais da conta..." className="bg-card border-border min-h-[80px]" />
        </div>

        {/* Screenshots */}
        <div className="space-y-2">
          <Label className="text-foreground">Screenshots (até 8)</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/30 transition-colors">
            <Upload className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Arraste ou clique para enviar</p>
          </div>
        </div>

        {/* Features como chips selecionáveis */}
        {features.length > 0 && (
          <div className="space-y-3">
            <Label className="text-foreground">Características da conta</Label>
            <div className="flex flex-wrap gap-2">
              {features.map((feat) => {
                const active = selectedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      active
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-card border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {active ? "✅" : "○"} {feat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Termos */}
        <div className="flex items-start gap-2">
          <Checkbox checked={acceptTerms} onCheckedChange={(c) => setAcceptTerms(!!c)} />
          <Label className="text-sm text-muted-foreground leading-relaxed">
            Aceito os termos de uso e confirmo que sou o proprietário legítimo da conta.
          </Label>
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-2">
          <Button variant="glass" onClick={() => setStep("preview")} disabled={!title || !platform}>
            <Eye className="h-4 w-4 mr-2" /> Preview
          </Button>
          <Button variant="hero" onClick={handleSubmit} disabled={!acceptTerms || !title || !platform || !price || loading}>
            {loading ? "Publicando..." : "Publicar Anúncio"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
