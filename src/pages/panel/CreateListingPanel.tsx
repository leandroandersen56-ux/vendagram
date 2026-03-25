import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Eye, Plus, X } from "lucide-react";
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

const NICHES = [
  "Humor", "Sensível", "Curiosidades", "Motivacional", "Finanças", "Fitness",
  "Beleza", "Moda", "Games", "Música", "Receitas", "Animais", "Notícias",
  "Esportes", "Educação", "Tecnologia", "Empreendedorismo", "Lifestyle", "Outro"
];

const REGIONS = ["100% BR 🇧🇷", "Misto", "Internacional", "EUA", "Europa", "Outro"];

const LOGIN_TYPES: Record<string, string[]> = {
  free_fire: ["Google", "Facebook", "VK", "Apple", "Huawei"],
  valorant: ["Riot Games", "Google", "Facebook", "Apple"],
  fortnite: ["Epic Games", "PlayStation", "Xbox", "Nintendo"],
  roblox: ["Email", "Google", "Facebook", "Apple"],
  clash_royale: ["Supercell ID", "Google", "Apple"],
};

const ACCOUNT_FEATURES: Record<string, string[]> = {
  free_fire: [
    "Sem restrições", "Email de criação", "Gmail de recuperação inutilizado",
    "Conta antiga", "Skins raras", "Rank alto", "Diamantes inclusos",
    "Aceita troca + volta", "Garantia após compra"
  ],
  instagram: [
    "Sem restrições", "Sem doc vinculado", "Email de criação", "Conta verificada",
    "2FA ativo", "Monetização ativa", "Página disponível", "Alcance alto",
    "Conta engajada", "Pronto pra alterar nome"
  ],
  tiktok: [
    "Sem restrições", "Sem doc vinculado", "Email de criação", "Conta verificada",
    "2FA ativo", "Shop ativo", "Lives liberadas", "Conta engajada",
    "Faço ADM", "Pronto pra alterar nome"
  ],
  facebook: [
    "Sem restrições", "Sem doc vinculado", "Email de criação", "Marketplace ativo",
    "Página vinculada", "Conta antiga", "Pronto pra alterar nome"
  ],
  youtube: [
    "Monetizado", "Sem strikes", "Sem restrições", "Email de criação",
    "Conta antiga", "Canal engajado"
  ],
  valorant: [
    "Sem restrições", "Email de criação", "Skins raras", "Conta antiga",
    "Rank alto", "Agentes desbloqueados"
  ],
  fortnite: [
    "Sem restrições", "Email de criação", "Skins raras", "Conta antiga", "Battle Pass"
  ],
  roblox: [
    "Sem restrições", "Email de criação", "Robux inclusos", "Conta antiga", "Items raros"
  ],
  clash_royale: [
    "Sem restrições", "Email de criação", "Conta alta", "Cards maxados", "Gems inclusos"
  ],
  other: [
    "Sem restrições", "Email de criação", "Sem doc vinculado", "Conta antiga"
  ],
};

// Game item suggestions for quick add
const GAME_ITEM_SUGGESTIONS: Record<string, string[]> = {
  free_fire: [
    "Peitorais", "Passes", "Emotes", "Armas Evolutivas", "Punhos",
    "Calça Angelical", "Bandeirão", "Cabelo", "Sombra", "Prime"
  ],
  valorant: ["Skins", "Buddies", "Sprays", "Cards", "Títulos"],
  fortnite: ["Skins", "Picos", "Mochilas", "Planadores", "Emotes", "Battle Pass"],
  roblox: ["Robux", "Items Limitados", "Game Passes", "Acessórios"],
  clash_royale: ["Cards Maxados", "Emotes", "Tower Skins", "Gems"],
};

const NEEDS_NICHO = ["instagram", "tiktok", "youtube", "facebook"];
const NEEDS_REGION = ["instagram", "tiktok", "facebook", "youtube"];
const IS_GAME = ["free_fire", "valorant", "fortnite", "roblox", "clash_royale"];

export default function CreateListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [platform, setPlatform] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [followers, setFollowers] = useState("");
  const [nicho, setNicho] = useState("");
  const [region, setRegion] = useState("");
  const [loginType, setLoginType] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [step, setStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);

  const features = ACCOUNT_FEATURES[platform] || [];
  const showNicho = NEEDS_NICHO.includes(platform);
  const showRegion = NEEDS_REGION.includes(platform);
  const isGame = IS_GAME.includes(platform);
  const loginOptions = LOGIN_TYPES[platform] || [];
  const itemSuggestions = GAME_ITEM_SUGGESTIONS[platform] || [];

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const addItem = (item?: string) => {
    const value = (item || newItem).trim();
    if (value && !items.includes(value)) {
      setItems((prev) => [...prev, value]);
      setNewItem("");
    }
  };

  const removeItem = (item: string) => {
    setItems((prev) => prev.filter((i) => i !== item));
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
    const highlights: Record<string, string | boolean | string[]> = {};
    if (followers) highlights["Seguidores"] = followers;
    if (nicho) highlights["Nicho"] = nicho;
    if (region) highlights["Região"] = region;
    if (loginType) highlights["Login"] = loginType;
    if (originalPrice) highlights["Preço original"] = originalPrice;
    if (items.length > 0) highlights["Itens"] = items;
    selectedFeatures.forEach((f) => (highlights[f] = true));

    const desc = description || (items.length > 0 ? items.map(i => `> ${i}`).join("\n") : undefined);

    const { error } = await supabase.from("listings").insert({
      title,
      description: desc,
      price: parseFloat(price),
      category: platform as any,
      seller_id: user.id,
      highlights,
      includes: items.length > 0 ? items.join(", ") : null,
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

  const resetPlatform = (v: string) => {
    setPlatform(v);
    setSelectedFeatures([]);
    setNicho("");
    setRegion("");
    setLoginType("");
    setItems([]);
    setNewItem("");
  };

  if (step === "preview") {
    const platformData = PLATFORMS.find((p) => p.id === platform);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" onClick={() => setStep("form")} className="mb-6 text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <Card className="bg-card border-border p-6 space-y-3">
          <h2 className="text-lg font-bold text-foreground mb-2">Preview do Anúncio</h2>
          <p className="text-sm text-muted-foreground">Plataforma: <span className="text-foreground">{platformData?.icon} {platformData?.name}</span></p>
          <p className="text-sm text-muted-foreground">Título: <span className="text-foreground font-medium">{title}</span></p>
          
          {/* Price with promo */}
          <div className="flex items-center gap-2">
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">R$ {originalPrice}</span>
            )}
            <span className="text-primary font-bold text-lg">R$ {price}</span>
          </div>

          {loginType && <p className="text-sm text-muted-foreground">Login: <span className="text-foreground">{loginType}</span></p>}
          {followers && <p className="text-sm text-muted-foreground">Seguidores: <span className="text-foreground">{followers}</span></p>}
          {nicho && <p className="text-sm text-muted-foreground">Nicho: <span className="text-foreground">{nicho}</span></p>}
          {region && <p className="text-sm text-muted-foreground">Região: <span className="text-foreground">{region}</span></p>}

          {/* Items list */}
          {items.length > 0 && (
            <div className="space-y-1 pt-2">
              <p className="text-sm font-medium text-foreground">Itens da conta:</p>
              {items.map((item) => (
                <p key={item} className="text-sm text-muted-foreground">▸ {item}</p>
              ))}
            </div>
          )}

          {description && <p className="text-sm text-muted-foreground pt-2">{description}</p>}

          {selectedFeatures.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {selectedFeatures.map((f) => (
                <span key={f} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">✅ {f}</span>
              ))}
            </div>
          )}

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
      <p className="text-muted-foreground text-sm mb-6">Monte seu anúncio como nos grupos — rápido e direto</p>

      <div className="space-y-5 max-w-2xl">
        {/* Plataforma */}
        <div className="space-y-2">
          <Label className="text-foreground">Plataforma *</Label>
          <Select value={platform} onValueChange={resetPlatform}>
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
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isGame ? "Ex: BBZONA A VENDA! 🔥" : "Ex: VENDO CONTA TIKTOK BR 2K SEGUIDORES"}
            className="bg-card border-border"
          />
        </div>

        {/* Preço (com promo para games) */}
        <div className={`grid ${isGame ? "grid-cols-2" : "grid-cols-2"} gap-3`}>
          {isGame && (
            <div className="space-y-2">
              <Label className="text-foreground">Preço original (opcional)</Label>
              <Input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="530"
                className="bg-card border-border"
              />
              <p className="text-xs text-muted-foreground">Risca o preço antigo (promoção)</p>
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-foreground">Valor (R$) *</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="130" className="bg-card border-border" />
          </div>
          {!isGame && (
            <div className="space-y-2">
              <Label className="text-foreground">Seguidores / Nível</Label>
              <Input value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="Ex: 2k+, 5.5K" className="bg-card border-border" />
            </div>
          )}
        </div>

        {/* Login type for games */}
        {loginOptions.length > 0 && (
          <div className="space-y-2">
            <Label className="text-foreground">Tipo de Login</Label>
            <Select value={loginType} onValueChange={setLoginType}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Como acessa a conta?" />
              </SelectTrigger>
              <SelectContent>
                {loginOptions.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Nicho + Região for social */}
        {(showNicho || showRegion) && (
          <div className="grid grid-cols-2 gap-3">
            {showNicho && (
              <div className="space-y-2">
                <Label className="text-foreground">Nicho</Label>
                <Select value={nicho} onValueChange={setNicho}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Selecione o nicho" />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {showRegion && (
              <div className="space-y-2">
                <Label className="text-foreground">Região dos seguidores</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Selecione a região" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Items da conta (games) */}
        {isGame && (
          <div className="space-y-3">
            <Label className="text-foreground">Itens da Conta 🎮</Label>
            
            {/* Quick-add suggestions */}
            {itemSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {itemSuggestions.filter(s => !items.some(i => i.toLowerCase().includes(s.toLowerCase()))).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addItem(s)}
                    className="px-2.5 py-1 rounded-full text-xs border border-border bg-card text-muted-foreground hover:border-primary/30 transition-all"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            )}

            {/* Added items */}
            {items.length > 0 && (
              <div className="space-y-1.5">
                {items.map((item) => (
                  <div key={item} className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5">
                    <span className="text-sm text-foreground flex-1">▸ {item}</span>
                    <button type="button" onClick={() => removeItem(item)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Custom item input */}
            <div className="flex gap-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
                placeholder="Ex: 654 Peitorais, Calça Angelical Azul..."
                className="bg-card border-border flex-1"
              />
              <Button type="button" variant="glass" size="sm" onClick={() => addItem()} disabled={!newItem.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Adicione cada item separado — igual nos grupos</p>
          </div>
        )}

        {/* Descrição */}
        <div className="space-y-2">
          <Label className="text-foreground">Descrição (opcional)</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes extras, quantidade disponível, etc." className="bg-card border-border min-h-[70px]" />
        </div>

        {/* Screenshots */}
        <div className="space-y-2">
          <Label className="text-foreground">Screenshots (até 8)</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-5 text-center cursor-pointer hover:border-primary/30 transition-colors">
            <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">Arraste ou clique para enviar</p>
          </div>
        </div>

        {/* Features como chips */}
        {features.length > 0 && (
          <div className="space-y-2">
            <Label className="text-foreground">Características ✅</Label>
            <div className="flex flex-wrap gap-2">
              {features.map((feat) => {
                const active = selectedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
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
            Confirmo que sou o proprietário legítimo desta conta.
          </Label>
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-1 pb-6">
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
