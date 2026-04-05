import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Plus, X, Upload, ChevronLeft, ChevronRight, Gamepad2, Image as ImageIcon, Lock, ShieldCheck, Check, Globe } from "lucide-react";
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
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  // Check verification status on mount
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("is_verified")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setIsVerified(data?.is_verified ?? false));
  }, [user?.id]);

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
  const [preSelected, setPreSelected] = useState("");
  const [screenshots, setScreenshots] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Credential fields (pre-fill)
  const [credLogin, setCredLogin] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credEmail, setCredEmail] = useState("");
  const [cred2fa, setCred2fa] = useState("");
  const [credNotes, setCredNotes] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newScreenshots = files.slice(0, 6 - screenshots.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setScreenshots((prev) => [...prev, ...newScreenshots].slice(0, 6));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

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
    if (!credLogin.trim() || !credPassword.trim()) {
      toast({ title: "Preencha login e senha da conta para entrega automática", variant: "destructive" });
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

    // Encode credentials (base64 for now, decrypted server-side)
    const credentialsData = JSON.stringify({
      login: credLogin.trim(),
      password: credPassword.trim(),
      ...(credEmail.trim() && { email: credEmail.trim() }),
      ...(cred2fa.trim() && { twofa: cred2fa.trim() }),
      ...(credNotes.trim() && { notes: credNotes.trim() }),
    });
    const encoded = btoa(unescape(encodeURIComponent(credentialsData)));

    const { error } = await supabase.from("listings").insert({
      title,
      description: description || null,
      price: parseFloat(price),
      category: platform as any,
      seller_id: user.id,
      highlights,
      includes: items.length > 0 ? items.join(", ") : null,
      status: "active",
      prefilled_credentials: encoded,
    } as any);

    setLoading(false);
    if (error) {
      toast({ title: "Erro ao criar anúncio", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Anúncio publicado!" });
      navigate("/vendedor", { state: { tab: "anuncios" } });
    }
  };

  // ── Platform selection data with gradients ──
  const PLATFORM_VISUAL: Record<string, { gradient: string; color: string; group: 'social' | 'game' }> = {
    instagram: { gradient: 'linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #F77737 100%)', color: '#E1306C', group: 'social' },
    tiktok: { gradient: 'linear-gradient(135deg, #010101 0%, #2D2D2D 50%, #69C9D0 100%)', color: '#010101', group: 'social' },
    youtube: { gradient: 'linear-gradient(135deg, #CC0000 0%, #FF0000 100%)', color: '#FF0000', group: 'social' },
    facebook: { gradient: 'linear-gradient(135deg, #0D5FBF 0%, #1877F2 100%)', color: '#1877F2', group: 'social' },
    free_fire: { gradient: 'linear-gradient(135deg, #992200 0%, #FF6B00 100%)', color: '#FF6B00', group: 'game' },
    valorant: { gradient: 'linear-gradient(135deg, #7B1F2A 0%, #FF4655 100%)', color: '#FF4655', group: 'game' },
    fortnite: { gradient: 'linear-gradient(135deg, #0A2EA4 0%, #1F69FF 100%)', color: '#1F69FF', group: 'game' },
    roblox: { gradient: 'linear-gradient(135deg, #8B0000 0%, #E2231A 100%)', color: '#E2231A', group: 'game' },
    clash_royale: { gradient: 'linear-gradient(135deg, #005F8A 0%, #00ADEF 100%)', color: '#00ADEF', group: 'game' },
    other: { gradient: 'linear-gradient(135deg, #374151 0%, #6B7280 100%)', color: '#6B7280', group: 'game' },
  };

  const socialPlatforms = PLATFORMS.filter(p => PLATFORM_VISUAL[p.id]?.group === 'social');
  const gamePlatforms = PLATFORMS.filter(p => PLATFORM_VISUAL[p.id]?.group === 'game');
  const selectedVisual = preSelected ? PLATFORM_VISUAL[preSelected] : null;
  const selectedPlatformData = PLATFORMS.find(p => p.id === preSelected);

  // ── STEP 1: Escolher plataforma ──
  if (!platform) {
    const PlatformCard = ({ p }: { p: typeof PLATFORMS[0] }) => {
      const vis = PLATFORM_VISUAL[p.id] || PLATFORM_VISUAL.other;
      const isSelected = preSelected === p.id;
      return (
        <motion.button
          key={p.id}
          onClick={() => setPreSelected(p.id)}
          whileTap={{ scale: 0.97 }}
          className="relative flex flex-col items-center justify-center gap-[10px] h-[100px] rounded-2xl cursor-pointer"
          style={{
            background: isSelected ? `${vis.color}14` : '#FFFFFF',
            border: isSelected ? `2px solid ${vis.color}` : '1.5px solid #E8E8E8',
            boxShadow: isSelected
              ? `0 4px 20px ${vis.color}38`
              : '0 2px 8px rgba(0,0,0,0.05)',
            padding: '16px 12px',
            transition: 'all 0.18s ease',
            transform: isSelected ? 'scale(1.03)' : undefined,
          }}
        >
          {/* Checkmark */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="absolute top-2 right-2 w-[22px] h-[22px] rounded-full flex items-center justify-center"
                style={{ background: vis.color }}
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Icon container */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: vis.gradient }}
          >
            {p.id === 'other' ? (
              <Globe className="w-7 h-7 text-white" />
            ) : (
              <PlatformIcon platformId={p.id} size={28} className="[&_svg]:!text-white [&_path]:!fill-white [&_rect]:!stroke-white [&_circle]:!stroke-white" />
            )}
          </div>

          {/* Name */}
          <span className="text-[13px] font-bold text-[#111] whitespace-nowrap text-center">{p.name}</span>
        </motion.button>
      );
    };

    return (
      <div className="min-h-screen" style={{ background: '#F5F5F5' }}>
        {/* Header azul Froiv */}
        <div className="sticky top-0 z-30 flex items-center h-14 px-5" style={{ background: '#2D6FF0' }}>
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="flex-1 text-center text-[17px] font-bold text-white">Criar Anúncio</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="pb-[180px]">
          <div className="px-5 pt-5 pb-2">
            <h2 className="text-[22px] font-extrabold text-[#111]" style={{ letterSpacing: '-0.5px' }}>
              O que você quer vender?
            </h2>
            <p className="text-sm text-[#888] mt-1">Escolha a plataforma para começar</p>
          </div>

          <div className="px-4">
            {/* Redes Sociais */}
            <p className="text-[11px] font-bold text-[#999] uppercase tracking-[0.8px] mt-4 mb-[10px]">
              📱 Redes Sociais
            </p>
            <div className="grid grid-cols-2 gap-3">
              {socialPlatforms.map(p => <PlatformCard key={p.id} p={p} />)}
            </div>

            {/* Jogos */}
            <p className="text-[11px] font-bold text-[#999] uppercase tracking-[0.8px] mt-4 mb-[10px]">
              🎮 Contas de Jogos
            </p>
            <div className="grid grid-cols-2 gap-3">
              {gamePlatforms.map(p => <PlatformCard key={p.id} p={p} />)}
            </div>
          </div>
        </div>

        {/* Sticky bottom button */}
        <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
          <AnimatePresence>
            {preSelected && selectedPlatformData && (
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="pointer-events-auto"
                style={{ background: 'linear-gradient(to top, #FFFFFF 60%, transparent)', padding: '16px 20px 32px' }}
              >
                <button
                  onClick={() => selectPlatform(preSelected)}
                  className="w-full h-[52px] rounded-[14px] flex items-center justify-center gap-[10px] text-white text-base font-bold border-none cursor-pointer active:opacity-85 transition-opacity"
                  style={{ background: '#2D6FF0', boxShadow: '0 4px 16px rgba(45,111,240,0.40)' }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{ background: selectedVisual?.gradient }}
                  >
                    {preSelected === 'other' ? (
                      <Globe className="w-4 h-4 text-white" />
                    ) : (
                      <PlatformIcon platformId={preSelected} size={18} className="[&_svg]:!text-white [&_path]:!fill-white" />
                    )}
                  </div>
                  Continuar com {selectedPlatformData.name} →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
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

      {/* Verification banner */}
      {isVerified === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Conta não verificada</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Você pode vender, mas contas verificadas transmitem mais confiança e vendem mais rápido.
            </p>
            <button
              onClick={() => navigate("/vendedor/verificacao")}
              className="text-xs font-semibold text-primary mt-2 hover:underline"
            >
              Verificar minha conta →
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* ── Título + Preço (os únicos obrigatórios) ── */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs uppercase tracking-wide">Título do anúncio *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isGame ? "Ex: BBZONA A VENDA! PROMOÇÃO" : "Ex: VENDO CONTA TIKTOK BR 2K SEGUIDORES"}
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
              className="bg-card border-border h-12 text-lg font-semibold"
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
            <Label className="text-foreground text-xs uppercase tracking-wide">Marque o que se aplica</Label>
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
                    {on ? "●" : "○"} {f}
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
                  {loginType === l ? "●" : "○"} {l}
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
                  {rank === r ? "●" : "○"} {r}
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
            <Label className="text-foreground text-xs uppercase tracking-wide flex items-center gap-1.5"><Gamepad2 className="h-3.5 w-3.5 text-primary" /> Itens da conta</Label>

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
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wide">Screenshots (até 6)</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          
          <div className="grid grid-cols-3 gap-2">
            {screenshots.map((s, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted">
                <img src={s.preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeScreenshot(i)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-foreground/70 text-background flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {screenshots.length < 6 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary/40 transition-colors active:scale-95"
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Adicionar</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Credenciais para entrega automática ── */}
        <div className="space-y-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="h-4 w-4 text-primary" />
            <Label className="text-foreground text-xs uppercase tracking-wide font-semibold">Dados de acesso da conta *</Label>
          </div>
          <p className="text-[12px] text-muted-foreground -mt-1">
            Preencha os acessos. Serão entregues automaticamente ao comprador após o pagamento.
          </p>

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground uppercase font-medium">Login / Usuário *</label>
              <Input value={credLogin} onChange={(e) => setCredLogin(e.target.value)} placeholder="ex: @usuario_conta" className="bg-card border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground uppercase font-medium">Senha *</label>
              <Input type="password" value={credPassword} onChange={(e) => setCredPassword(e.target.value)} placeholder="Senha da conta" className="bg-card border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground uppercase font-medium">Email vinculado</label>
              <Input value={credEmail} onChange={(e) => setCredEmail(e.target.value)} placeholder="email@exemplo.com (opcional)" className="bg-card border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground uppercase font-medium">Código 2FA</label>
              <Input value={cred2fa} onChange={(e) => setCred2fa(e.target.value)} placeholder="JBSWY3DPEHPK3PXP (opcional)" className="bg-card border-border font-mono" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground uppercase font-medium">Observações</label>
              <Textarea value={credNotes} onChange={(e) => setCredNotes(e.target.value)} placeholder="Ex: Troque a senha imediatamente" className="bg-card border-border min-h-[50px]" />
            </div>
          </div>

          <div className="flex items-start gap-2 bg-[#FFF8E0] rounded-lg p-3">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground">
              Os dados são criptografados e só serão revelados ao comprador após a confirmação do pagamento. 
              O valor é liberado em <strong>24h</strong> automaticamente ou quando o comprador confirmar.
            </p>
          </div>
        </div>

        {/* ── Descrição extra ── */}
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs uppercase tracking-wide">Observações públicas (opcional)</Label>
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
            {loading ? "Publicando..." : "Publicar Anúncio"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
