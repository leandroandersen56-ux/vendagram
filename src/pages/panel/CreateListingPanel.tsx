import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Plus, X, Upload, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { PLATFORMS } from "@/lib/mock-data";
import PlatformIcon from "@/components/PlatformIcon";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ── Config por plataforma ──────────────────────────────────────
const FEATURES: Record<string, string[]> = {
  free_fire: [
    "Sem restrições", "Email de criação", "Gmail recuperação inutilizado",
    "Conta antiga", "Skins raras", "Rank alto", "Diamantes inclusos",
    "Aceita troca + volta", "Garantia após compra"
  ],
  instagram: [
    "Sem restrições", "Sem doc vinculado", "Email de criação", "Conta verificada",
    "2FA ativo", "Monetização ativa", "Página disponível", "Conta engajada",
    "Pronto pra alterar nome", "Podemos negociar"
  ],
  tiktok: [
    "Sem restrições", "Sem doc vinculado", "Email de criação", "Conta verificada",
    "2FA ativo", "Shop ativo", "Lives liberadas", "Conta engajada",
    "Pronto pra alterar nome"
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
    "Sem restrições", "Email de criação", "Full acesso", "Conta antiga",
    "Todos agentes desbloqueados", "Aceita negociação", "Garantia após compra"
  ],
  fortnite: [
    "Sem restrições", "Email de criação", "Full acesso", "Conta OG",
    "Skins raras", "Aceita negociação", "Garantia após compra"
  ],
  roblox: [
    "Sem restrições", "Email de criação", "Full acesso", "Conta antiga",
    "Items limitados", "Aceita negociação", "Garantia após compra"
  ],
  clash_royale: [
    "Sem restrições", "Email de criação", "Full acesso", "Conta maxada",
    "Aceita negociação", "Garantia após compra"
  ],
  other: ["Sem restrições", "Email de criação", "Sem doc vinculado", "Conta antiga"],
};

const GAME_ITEMS: Record<string, string[]> = {
  free_fire: [
    "Peitorais", "Passes", "Emotes", "Armas Evolutivas", "Punhos",
    "Calça Angelical", "Bandeirão", "Sombra", "Cabelo", "Prime"
  ],
  valorant: [
    "Skins de Vandal", "Skins de Phantom", "Facas", "Buddies", "Sprays",
    "Cards", "Títulos", "Valorant Points", "Radianite"
  ],
  fortnite: [
    "Skins OG", "Picos", "Mochilas", "Planadores", "Emotes",
    "V-Bucks", "Battle Pass", "Wraps"
  ],
  roblox: [
    "Robux", "Items Limitados", "Game Passes", "Acessórios",
    "Roupas exclusivas", "Badges"
  ],
  clash_royale: [
    "Cards Maxados", "Emotes", "Tower Skins", "Gems",
    "Troféus", "Nível do Rei"
  ],
};

const GAME_RANKS: Record<string, string[]> = {
  free_fire: ["Bronze", "Prata", "Ouro", "Platina", "Diamante", "Mestre", "Desafiante", "Grandmaster"],
  valorant: ["Ferro", "Bronze", "Prata", "Ouro", "Platina", "Diamante", "Ascendente", "Imortal", "Radiante"],
  fortnite: [],
  roblox: [],
  clash_royale: ["Arena 1-5", "Arena 6-10", "Arena 11-15", "Desafiante", "Mestre", "Campeão", "Top Ladder"],
};

const LOGIN_TYPES: Record<string, string[]> = {
  free_fire: ["Google", "Facebook", "VK", "Apple", "Huawei"],
  valorant: ["Riot Games", "Google", "Facebook", "Apple"],
  fortnite: ["Epic Games", "PlayStation", "Xbox", "Nintendo", "PC"],
  roblox: ["Email", "Google", "Facebook", "Apple"],
  clash_royale: ["Supercell ID", "Google", "Apple"],
};

const NICHES = [
  "Humor", "Sensível", "Curiosidades", "Motivacional", "Finanças", "Fitness",
  "Beleza", "Moda", "Games", "Música", "Receitas", "Animais", "Notícias",
  "Esportes", "Educação", "Tecnologia", "Empreendedorismo", "Lifestyle", "Outro"
];

const REGIONS = ["100% BR 🇧🇷", "Misto", "Internacional", "EUA", "Europa"];

const IS_GAME = ["free_fire", "valorant", "fortnite", "roblox", "clash_royale"];
const IS_SOCIAL = ["instagram", "tiktok", "facebook", "youtube"];

// ── Component ──────────────────────────────────────────────────
export default function CreateListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [platform, setPlatform] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [followers, setFollowers] = useState("");
  const [nicho, setNicho] = useState("");
  const [region, setRegion] = useState("");
  const [alcance, setAlcance] = useState("");
  const [genero, setGenero] = useState("");
  const [loginType, setLoginType] = useState("");
  const [rank, setRank] = useState("");
  const [description, setDescription] = useState("");
  const [feats, setFeats] = useState<string[]>([]);
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(false);

  const isGame = IS_GAME.includes(platform);
  const isSocial = IS_SOCIAL.includes(platform);

  const toggleFeat = (f: string) =>
    setFeats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const addItem = (val?: string) => {
    const v = (val || newItem).trim();
    if (v && !items.includes(v)) { setItems((p) => [...p, v]); setNewItem(""); }
  };

  const selectPlatform = (id: string) => {
    setPlatform(id);
    setFeats([]);
    setItems([]);
    setNicho("");
    setRegion("");
    setAlcance("");
    setGenero("");
    setLoginType("");
    setRank("");
  };

  const handlePublish = async () => {
    if (!platform || !title || !price) {
      toast({ title: "Preencha plataforma, título e preço", variant: "destructive" });
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
    if (alcance) highlights["Alcance"] = alcance;
    if (genero) highlights["Gênero"] = genero;
    if (loginType) highlights["Login"] = loginType;
    if (rank) highlights["Rank"] = rank;
    if (originalPrice) highlights["Preço original"] = originalPrice;
    if (items.length > 0) highlights["Itens"] = items;
    feats.forEach((f) => (highlights[f] = true));

    const { error } = await supabase.from("listings").insert({
      title,
      description: description || null,
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
      toast({ title: "Anúncio publicado! 🎉" });
      navigate("/painel/anuncios");
    }
  };

  // ── STEP 1: Escolher plataforma ──
  if (!platform) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-1">O que você quer vender?</h1>
        <p className="text-muted-foreground text-sm mb-5">Toque na plataforma pra começar</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPlatform(p.id)}
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
            >
              <PlatformIcon platformId={p.id} size={28} />
              <div>
                <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{p.name}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  // ── STEP 2: Preencher dados ──
  const platformData = PLATFORMS.find((p) => p.id === platform)!;
  const featureList = FEATURES[platform] || [];
  const itemSuggestions = GAME_ITEMS[platform] || [];
  const loginOptions = LOGIN_TYPES[platform] || [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
      {/* Header com plataforma selecionada */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setPlatform("")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          <PlatformIcon platformId={platformData.id} size={18} className="mr-1" /> {platformData.name} ✕
        </button>
        <span className="text-muted-foreground text-sm">Criar anúncio</span>
      </div>

      <div className="space-y-4">
        {/* ── Título + Preço (os únicos obrigatórios) ── */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs uppercase tracking-wide">Título do anúncio *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isGame ? "Ex: BBZONA A VENDA! PROMOÇÃO 🔥" : "Ex: VENDO CONTA TIKTOK BR 2K SEGUIDORES"}
            className="bg-card border-border text-base font-medium h-12"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs uppercase tracking-wide">Valor (R$) *</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="130"
              className="bg-card border-border h-12 text-lg font-bold"
            />
          </div>
          {isGame ? (
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">De (riscado)</Label>
              <Input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="530 (opcional)"
                className="bg-card border-border h-12"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs uppercase tracking-wide">Seguidores</Label>
              <Input
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                placeholder="Ex: 5,500K"
                className="bg-card border-border h-12"
              />
            </div>
          )}
        </div>

        {/* ── Features: toque pra marcar ── */}
        {featureList.length > 0 && (
          <div className="space-y-2">
            <Label className="text-foreground text-xs uppercase tracking-wide">Marque o que se aplica ✅</Label>
            <div className="flex flex-wrap gap-2">
              {featureList.map((f) => {
                const on = feats.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFeat(f)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      on
                        ? "bg-primary/20 border-primary text-primary font-medium"
                        : "bg-card border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {on ? "✅" : "○"} {f}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Login (games) ── */}
        {loginOptions.length > 0 && (
          <div className="space-y-2">
            <Label className="text-foreground text-xs uppercase tracking-wide">Login da conta</Label>
            <div className="flex flex-wrap gap-2">
              {loginOptions.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLoginType(loginType === l ? "" : l)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    loginType === l
                      ? "bg-primary/20 border-primary text-primary font-medium"
                      : "bg-card border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {loginType === l ? "✅" : "○"} {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Rank (games com rank) ── */}
        {(GAME_RANKS[platform] || []).length > 0 && (
          <div className="space-y-2">
            <Label className="text-foreground text-xs uppercase tracking-wide">Rank / Elo</Label>
            <div className="flex flex-wrap gap-2">
              {GAME_RANKS[platform].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRank(rank === r ? "" : r)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    rank === r
                      ? "bg-primary/20 border-primary text-primary font-medium"
                      : "bg-card border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {rank === r ? "✅" : "○"} {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Nicho (social) ── */}
        {isSocial && (
          <div className="space-y-2">
            <Label className="text-foreground text-xs uppercase tracking-wide">Nicho</Label>
            <div className="flex flex-wrap gap-1.5">
              {NICHES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNicho(nicho === n ? "" : n)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                    nicho === n
                      ? "bg-primary/20 border-primary text-primary font-medium"
                      : "bg-card border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Região (social) ── */}
        {isSocial && (
          <div className="space-y-2">
            <Label className="text-foreground text-xs uppercase tracking-wide">Região dos seguidores</Label>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion(region === r ? "" : r)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    region === r
                      ? "bg-primary/20 border-primary text-primary font-medium"
                      : "bg-card border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Alcance + Gênero (instagram) ── */}
        {platform === "instagram" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">Alcance</Label>
              <Input value={alcance} onChange={(e) => setAlcance(e.target.value)} placeholder="4,1 milhões" className="bg-card border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">Gênero do público</Label>
              <Input value={genero} onChange={(e) => setGenero(e.target.value)} placeholder="M: 93% / F: 7%" className="bg-card border-border" />
            </div>
          </div>
        )}

        {/* ── Itens da conta (games) ── */}
        {isGame && (
          <div className="space-y-2">
            <Label className="text-foreground text-xs uppercase tracking-wide">Itens da conta 🎮</Label>

            {/* Sugestões rápidas */}
            <div className="flex flex-wrap gap-1.5">
              {itemSuggestions.filter((s) => !items.some((i) => i.toLowerCase().includes(s.toLowerCase()))).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addItem(s)}
                  className="px-2.5 py-1 rounded-full text-xs border border-dashed border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
                >
                  + {s}
                </button>
              ))}
            </div>

            {/* Itens adicionados */}
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5"
                >
                  <span className="text-sm text-foreground flex-1">▸ {item}</span>
                  <button type="button" onClick={() => setItems((p) => p.filter((i) => i !== item))} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Input customizado */}
            <div className="flex gap-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
                placeholder="Ex: 654 Peitorais, Calça Angelical..."
                className="bg-card border-border flex-1"
              />
              <Button type="button" variant="glass" size="sm" onClick={() => addItem()} disabled={!newItem.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Screenshots ── */}
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs uppercase tracking-wide">Screenshots (opcional)</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/30 transition-colors">
            <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Arraste ou clique</p>
          </div>
        </div>

        {/* ── Descrição extra ── */}
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs uppercase tracking-wide">Observações (opcional)</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Algo mais que queira dizer? Ex: tenho 4 contas assim, aceito parcelado..."
            className="bg-card border-border min-h-[60px]"
          />
        </div>

        {/* ── Botão de publicar ── */}
        <div className="flex gap-3 pt-2 pb-6">
          <Button
            variant="hero"
            className="flex-1 h-12 text-base"
            onClick={handlePublish}
            disabled={!title || !price || loading}
          >
            {loading ? "Publicando..." : "Publicar Anúncio 🚀"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
