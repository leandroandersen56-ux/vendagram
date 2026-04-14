import { useState, useRef, useEffect } from "react";
import freefireLogo from "@/assets/freefire-logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Plus, X, Upload, ChevronLeft, ChevronRight, Gamepad2, Image as ImageIcon, Lock, ShieldCheck, Check, Globe, Smartphone, MessageCircle } from "lucide-react";
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
import { moderateText, getModerationMessage } from "@/lib/content-moderation";

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
  const [stock, setStock] = useState("1");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Credential fields (pre-fill)
  const [credLogin, setCredLogin] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credEmail, setCredEmail] = useState("");
  const [cred2fa, setCred2fa] = useState("");
  const [credNotes, setCredNotes] = useState("");
  const [credDeliveryMode, setCredDeliveryMode] = useState<"prefill" | "chat">("prefill");

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
    if (credDeliveryMode === "prefill" && (!credLogin.trim() || !credPassword.trim())) {
      toast({ title: "Preencha login e senha da conta para entrega automática", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Faça login para publicar", variant: "destructive" });
      return;
    }

    // Content moderation on title and description
    const titleMod = moderateText(title);
    const descMod = moderateText(description);
    if (titleMod.blocked || descMod.blocked) {
      const msg = titleMod.blocked ? getModerationMessage(titleMod) : getModerationMessage(descMod);
      toast({ title: "Conteúdo bloqueado", description: msg, variant: "destructive" });
      return;
    }

    setLoading(true);

    // Upload screenshots to ImgBB
    let screenshotUrls: string[] = [];
    if (screenshots.length > 0) {
      try {
        const uploadPromises = screenshots.map(async (s) => {
          const formData = new FormData();
          formData.append("image", s.file);
          const { data, error } = await supabase.functions.invoke("upload-image", {
            body: formData,
          });
          if (error) throw new Error(error.message || "Upload failed");
          return data.url as string;
        });
        screenshotUrls = await Promise.all(uploadPromises);
      } catch (uploadErr: any) {
        setLoading(false);
        toast({ title: "Erro ao enviar imagens", description: uploadErr.message, variant: "destructive" });
        return;
      }
    }

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

    let encoded: string | null = null;
    if (credDeliveryMode === "prefill") {
      const credentialsData = JSON.stringify({
        login: credLogin.trim(),
        password: credPassword.trim(),
        ...(credEmail.trim() && { email: credEmail.trim() }),
        ...(cred2fa.trim() && { twofa: cred2fa.trim() }),
        ...(credNotes.trim() && { notes: credNotes.trim() }),
      });
      encoded = btoa(unescape(encodeURIComponent(credentialsData)));
    }

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
      screenshots: screenshotUrls.length > 0 ? screenshotUrls : null,
      stock: Math.max(1, parseInt(stock) || 1),
    } as any);

    setLoading(false);
    if (error) {
      toast({ title: "Erro ao criar anúncio", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Anúncio publicado!" });
      navigate("/vendedor", { state: { tab: "anuncios" } });
    }
  };

  // ── Platform selection data with brand colors ──
  const PLATFORM_VISUAL: Record<string, { bg: string; color: string; group: 'social' | 'game' }> = {
    instagram: { bg: '#E1306C', color: '#E1306C', group: 'social' },
    tiktok: { bg: '#111111', color: '#111111', group: 'social' },
    youtube: { bg: '#FF0000', color: '#FF0000', group: 'social' },
    facebook: { bg: '#1877F2', color: '#1877F2', group: 'social' },
    free_fire: { bg: '#FF6B00', color: '#FF6B00', group: 'game' },
    valorant: { bg: '#FF4655', color: '#FF4655', group: 'game' },
    fortnite: { bg: '#1F69FF', color: '#1F69FF', group: 'game' },
    roblox: { bg: '#E2231A', color: '#E2231A', group: 'game' },
    clash_royale: { bg: '#00ADEF', color: '#00ADEF', group: 'game' },
    other: { bg: '#6B7280', color: '#6B7280', group: 'game' },
  };

  // White monochromatic icons for each platform
  const WhiteIcon = ({ id }: { id: string }) => {
    switch (id) {
      case 'instagram':
        return (
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="6" stroke="#fff" strokeWidth="2" fill="none"/>
            <circle cx="12" cy="12" r="5" stroke="#fff" strokeWidth="1.8" fill="none"/>
            <circle cx="18" cy="6" r="1.5" fill="#fff"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="#fff"/>
          </svg>
        );
      case 'youtube':
        return (
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none">
            <path d="M8 5.5v13l11-6.5L8 5.5z" fill="#fff"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" fill="#fff"/>
          </svg>
        );
      case 'free_fire':
        return <img src={freefireLogo} width={30} height={30} alt="Free Fire" className="object-contain brightness-0 invert" />;
      case 'valorant':
        return (
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <path d="M23.792 2.152a.252.252 0 0 0-.098.083c-3.384 4.23-6.769 8.46-10.15 12.69-.107.093-.025.288.119.265 2.439.003 4.877 0 7.316.001a.66.66 0 0 0 .552-.25c.774-.967 1.55-1.934 2.324-2.903a.72.72 0 0 0 .144-.49c-.002-3.077 0-6.153-.003-9.23.016-.11-.1-.206-.204-.167zM.077 2.166c-.077.038-.074.132-.076.205.002 3.074.001 6.15.001 9.225a.679.679 0 0 0 .158.463l7.64 9.55c.12.152.308.25.505.247 2.455 0 4.91.003 7.365 0 .142.02.222-.174.116-.265C10.661 15.176 5.526 8.766.4 2.35c-.08-.094-.174-.272-.322-.184z" fill="#fff"/>
          </svg>
        );
      case 'fortnite':
        return (
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <path d="m15.767 14.171.097-5.05H12.4V5.197h3.99L16.872 0H7.128v24l5.271-.985V14.17z" fill="#fff"/>
          </svg>
        );
      case 'roblox':
        return (
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <path d="M18.926 23.998 0 18.892 5.075.002 24 5.108ZM15.348 10.09l-5.282-1.453-1.414 5.273 5.282 1.453z" fill="#fff"/>
          </svg>
        );
      case 'clash_royale':
        return (
          <svg width={26} height={26} viewBox="0 0 192 192" fill="none">
            <path d="m96 31.62 13.43 11.2a16 16 0 0 0 10.22 3.7h30.81l-3.06 92L96 162.74l-51.39-24.19-3.07-92h30.82a16 16 0 0 0 10.2-3.7L96 31.62M96 16 74.88 33.61a4 4 0 0 1-2.53.91H29.13l3.73 111.76L96 176l63.15-29.72 3.72-111.76h-43.22a4 4 0 0 1-2.53-.91L96 16Z" fill="#fff"/>
            <path d="M88.29 69a3.85 3.85 0 0 0-3.75 2.92l-3.12 12.51h-5.78l-3-8.94A3.85 3.85 0 0 0 69 72.86h-7.71a3.85 3.85 0 0 0-3.86 3.85v.35l3.86 42.43a3.86 3.86 0 0 0 3.85 3.51h61.72a3.86 3.86 0 0 0 3.84-3.51l3.86-42.43a3.87 3.87 0 0 0-3.5-4.19H123a3.85 3.85 0 0 0-3.66 2.63l-3 8.94h-5.78l-3.12-12.51a3.85 3.85 0 0 0-3.73-2.93Z" fill="none" stroke="#fff" strokeWidth="8" strokeMiterlimit="10"/>
          </svg>
        );
      default:
        return <Globe className="w-7 h-7 text-white" />;
    }
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
            style={{ background: vis.bg }}
          >
            <WhiteIcon id={p.id} />
          </div>

          {/* Name */}
          <span className="text-[13px] font-semibold text-[#111] whitespace-nowrap text-center">{p.name}</span>
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
          <h1 className="flex-1 text-center text-[17px] font-semibold text-white">Criar Anúncio</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="pb-[180px]">
          <div className="max-w-3xl mx-auto px-5 pt-5 sm:pt-10 pb-2">
            <h2 className="text-[22px] sm:text-2xl font-semibold text-[#111]" style={{ letterSpacing: '-0.5px' }}>
              O que você quer vender?
            </h2>
            <p className="text-sm text-[#888] mt-1">Escolha a plataforma para começar</p>
          </div>

          <div className="max-w-3xl mx-auto px-4 sm:px-5">
            {/* Redes Sociais */}
            <p className="text-[11px] font-semibold text-[#999] uppercase tracking-[0.8px] mt-4 mb-[10px] flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-primary" /> Redes Sociais
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {socialPlatforms.map(p => <PlatformCard key={p.id} p={p} />)}
            </div>

            {/* Jogos */}
            <p className="text-[11px] font-semibold text-[#999] uppercase tracking-[0.8px] mt-4 mb-[10px] flex items-center gap-1.5">
              <Gamepad2 className="h-3.5 w-3.5 text-primary" /> Contas de Jogos
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {gamePlatforms.map(p => <PlatformCard key={p.id} p={p} />)}
            </div>
          </div>
        </div>

        {/* Sticky bottom button */}
        <div className="fixed bottom-[60px] left-0 right-0 z-40 pointer-events-none">
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
                  className="w-full h-[52px] rounded-[14px] flex items-center justify-center gap-[10px] text-white text-base font-semibold border-none cursor-pointer active:opacity-85 transition-opacity"
                  style={{ background: '#2D6FF0', boxShadow: '0 4px 16px rgba(45,111,240,0.40)' }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: selectedVisual?.bg }}
                  >
                    <WhiteIcon id={preSelected} />
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
  const platformVisual = PLATFORM_VISUAL[platform] || PLATFORM_VISUAL.other;

  return (
    <div className="min-h-screen" style={{ background: '#F5F5F5' }}>
      {/* Header azul Froiv */}
      <div className="sticky top-0 z-30 flex items-center h-14 px-5" style={{ background: '#2D6FF0' }}>
        <button onClick={() => setPlatform("")} className="p-1 -ml-1 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-semibold text-white">Criar Anúncio</h1>
        <div className="w-6" />
      </div>

      <div className="pb-[100px]">
        {/* Platform badge */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: platformVisual.bg }}>
            <WhiteIcon id={platform} />
          </div>
          <span className="text-sm font-semibold text-[#111]">{platformData.name}</span>
          <button onClick={() => setPlatform("")} className="ml-1 text-xs text-primary hover:underline">Trocar</button>
        </div>

        {/* Verification banner */}
        {isVerified === false && (
          <div className="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Conta não verificada</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Contas verificadas transmitem mais confiança e vendem mais rápido.
              </p>
              <button onClick={() => navigate("/vendedor/verificacao")} className="text-xs font-semibold text-primary mt-1.5 hover:underline">
                Verificar minha conta →
              </button>
            </div>
          </div>
        )}

        {/* ── SECTION: Dados do anúncio ── */}
        <div className="mx-4 mb-3">
          <p className="text-[12px] text-[#999] uppercase font-semibold px-1 pb-2">Dados do anúncio</p>
          <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden divide-y divide-[#F0F0F0]">
            {/* Título */}
            <div className="p-4">
              <label className="text-[12px] text-[#999] font-medium block mb-1.5">Título *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isGame ? "Ex: Conta Free Fire Nível 75 Full Skin" : "Ex: Instagram 50K Seguidores Nicho Fitness"}
                className="bg-transparent border-[#E8E8E8] text-[15px] h-11 rounded-xl"
                autoFocus
              />
            </div>

            {/* Preço */}
            <div className="p-4">
              <label className="text-[12px] text-[#999] font-medium block mb-1.5">Preço *</label>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] text-sm font-medium">R$</span>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0,00"
                    className="bg-transparent border-[#E8E8E8] h-11 rounded-xl pl-10 text-[16px] font-semibold"
                  />
                </div>
                {isGame && (
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#CCC] text-xs">De</span>
                    <Input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="opcional"
                      className="bg-transparent border-[#E8E8E8] h-11 rounded-xl pl-9 text-sm text-[#999]"
                    />
                  </div>
                )}
              </div>
              </div>

              {/* Estoque */}
              <div className="p-4">
                <label className="text-[12px] text-[#999] font-medium block mb-1.5">Quantidade em estoque</label>
                <p className="text-[11px] text-[#BBB] mb-2">Para itens replicáveis (chaves, pacotes). Deixe 1 para itens únicos.</p>
                <Input
                  type="number"
                  min="1"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="1"
                  className="bg-transparent border-[#E8E8E8] h-11 rounded-xl w-32 text-center text-[16px] font-semibold"
                />
              </div>
            {isSocial && (
              <div className="p-4">
                <label className="text-[12px] text-[#999] font-medium block mb-1.5">Seguidores</label>
                <Input
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                  placeholder="Ex: 50K"
                  className="bg-transparent border-[#E8E8E8] h-11 rounded-xl"
                />
              </div>
            )}

            {/* Nicho (social) */}
            {isSocial && (
              <div className="p-4">
                <label className="text-[12px] text-[#999] font-medium block mb-1.5">Nicho</label>
                <div className="flex flex-wrap gap-1.5">
                  {NICHES.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNicho(nicho === n ? "" : n)}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                        nicho === n ? "bg-primary/10 border-primary text-primary font-medium" : "bg-[#F5F5F5] border-[#E8E8E8] text-[#666]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Região (social) */}
            {isSocial && (
              <div className="p-4">
                <label className="text-[12px] text-[#999] font-medium block mb-1.5">Região dos seguidores</label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRegion(region === r ? "" : r)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        region === r ? "bg-primary/10 border-primary text-primary font-medium" : "bg-[#F5F5F5] border-[#E8E8E8] text-[#666]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Alcance + Gênero (instagram) */}
            {platform === "instagram" && (
              <div className="p-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] text-[#999] font-medium block mb-1.5">Alcance</label>
                  <Input value={alcance} onChange={(e) => setAlcance(e.target.value)} placeholder="4,1 milhões" className="bg-transparent border-[#E8E8E8] h-11 rounded-xl" />
                </div>
                <div>
                  <label className="text-[12px] text-[#999] font-medium block mb-1.5">Gênero público</label>
                  <Input value={genero} onChange={(e) => setGenero(e.target.value)} placeholder="M: 93% / F: 7%" className="bg-transparent border-[#E8E8E8] h-11 rounded-xl" />
                </div>
              </div>
            )}

            {/* Login type (games) */}
            {loginOptions.length > 0 && (
              <div className="p-4">
                <label className="text-[12px] text-[#999] font-medium block mb-1.5">Login da conta</label>
                <div className="flex flex-wrap gap-2">
                  {loginOptions.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLoginType(loginType === l ? "" : l)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        loginType === l ? "bg-primary/10 border-primary text-primary font-medium" : "bg-[#F5F5F5] border-[#E8E8E8] text-[#666]"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rank (games) */}
            {(GAME_RANKS[platform] || []).length > 0 && (
              <div className="p-4">
                <label className="text-[12px] text-[#999] font-medium block mb-1.5">Rank / Elo</label>
                <div className="flex flex-wrap gap-2">
                  {GAME_RANKS[platform].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRank(rank === r ? "" : r)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        rank === r ? "bg-primary/10 border-primary text-primary font-medium" : "bg-[#F5F5F5] border-[#E8E8E8] text-[#666]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Descrição */}
            <div className="p-4">
              <label className="text-[12px] text-[#999] font-medium block mb-1.5">Descrição (opcional)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o que está incluído na conta, diferenciais, etc."
                className="bg-transparent border-[#E8E8E8] min-h-[70px] rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* ── SECTION: Características ── */}
        {featureList.length > 0 && (
          <div className="mx-4 mb-3">
            <p className="text-[12px] text-[#999] uppercase font-semibold px-1 pb-2">Características</p>
            <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4">
              <div className="flex flex-wrap gap-2">
                {featureList.map((f) => {
                  const on = feats.includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFeat(f)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        on ? "bg-primary/10 border-primary text-primary font-medium" : "bg-[#F5F5F5] border-[#E8E8E8] text-[#666]"
                      }`}
                    >
                      {on ? "✓" : "+"} {f}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION: Itens (games) ── */}
        {isGame && (
          <div className="mx-4 mb-3">
            <p className="text-[12px] text-[#999] uppercase font-semibold px-1 pb-2">Itens da conta</p>
            <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {itemSuggestions.filter((s) => !items.some((i) => i.toLowerCase().includes(s.toLowerCase()))).map((s) => (
                  <button key={s} type="button" onClick={() => addItem(s)} className="px-2.5 py-1 rounded-full text-xs border border-dashed border-[#DDD] bg-[#F9F9F9] text-[#888] hover:border-primary/40 hover:text-primary transition-all">
                    + {s}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div key={item} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5">
                    <span className="text-sm text-[#111] flex-1">▸ {item}</span>
                    <button type="button" onClick={() => setItems((p) => p.filter((i) => i !== item))} className="text-[#CCC] hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="flex gap-2">
                <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())} placeholder="Ex: 654 Peitorais, Calça Angelical..." className="bg-transparent border-[#E8E8E8] flex-1 rounded-xl" />
                <Button type="button" variant="glass" size="sm" onClick={() => addItem()} disabled={!newItem.trim()}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION: Fotos ── */}
        <div className="mx-4 mb-3">
          <p className="text-[12px] text-[#999] uppercase font-semibold px-1 pb-2">Fotos</p>
          <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4">
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
            <div className="grid grid-cols-3 gap-2">
              {screenshots.map((s, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[#E8E8E8] bg-[#F5F5F5]">
                  <img src={s.preview} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeScreenshot(i)} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="h-3 w-3" /></button>
                </div>
              ))}
              {screenshots.length < 6 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-[#DDD] flex flex-col items-center justify-center gap-1 hover:border-primary/40 transition-colors active:scale-95">
                  <Upload className="h-5 w-5 text-[#BBB]" />
                  <span className="text-[10px] text-[#BBB]">Adicionar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION: Dados de acesso ── */}
        <div className="mx-4 mb-3">
          <p className="text-[12px] text-[#999] uppercase font-semibold px-1 pb-2">Entrega dos dados de acesso *</p>
          <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
            {/* Toggle: Preencher agora vs Enviar via chat */}
            <div className="p-3 flex gap-2">
              <button
                type="button"
                onClick={() => setCredDeliveryMode("prefill")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  credDeliveryMode === "prefill"
                    ? "bg-primary/10 text-primary border-2 border-primary"
                    : "bg-[#F5F5F5] text-[#888] border-2 border-transparent"
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                Preencher agora
              </button>
              <button
                type="button"
                onClick={() => setCredDeliveryMode("chat")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  credDeliveryMode === "chat"
                    ? "bg-primary/10 text-primary border-2 border-primary"
                    : "bg-[#F5F5F5] text-[#888] border-2 border-transparent"
                }`}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Enviar via chat
              </button>
            </div>

            {credDeliveryMode === "prefill" ? (
              <>
                <div className="px-4 py-2.5 bg-primary/5 border-y border-primary/10 flex items-start gap-2">
                  <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#666]">
                    Preencha os acessos. Serão entregues automaticamente ao comprador após o pagamento.
                  </p>
                </div>
                <div className="divide-y divide-[#F0F0F0]">
                  <div className="p-4">
                    <label className="text-[12px] text-[#999] font-medium block mb-1.5">Login / Usuário *</label>
                    <Input value={credLogin} onChange={(e) => setCredLogin(e.target.value)} placeholder="ex: @usuario_conta" className="bg-transparent border-[#E8E8E8] h-11 rounded-xl" />
                  </div>
                  <div className="p-4">
                    <label className="text-[12px] text-[#999] font-medium block mb-1.5">Senha *</label>
                    <Input type="password" value={credPassword} onChange={(e) => setCredPassword(e.target.value)} placeholder="Senha da conta" className="bg-transparent border-[#E8E8E8] h-11 rounded-xl" />
                  </div>
                  <div className="p-4">
                    <label className="text-[12px] text-[#999] font-medium block mb-1.5">Email vinculado</label>
                    <Input value={credEmail} onChange={(e) => setCredEmail(e.target.value)} placeholder="email@exemplo.com (opcional)" className="bg-transparent border-[#E8E8E8] h-11 rounded-xl" />
                  </div>
                  <div className="p-4">
                    <label className="text-[12px] text-[#999] font-medium block mb-1.5">Código 2FA</label>
                    <Input value={cred2fa} onChange={(e) => setCred2fa(e.target.value)} placeholder="JBSWY3DPEHPK3PXP (opcional)" className="bg-transparent border-[#E8E8E8] h-11 rounded-xl font-mono" />
                  </div>
                  <div className="p-4">
                    <label className="text-[12px] text-[#999] font-medium block mb-1.5">Observações</label>
                    <Textarea value={credNotes} onChange={(e) => setCredNotes(e.target.value)} placeholder="Ex: Troque a senha imediatamente" className="bg-transparent border-[#E8E8E8] min-h-[50px] rounded-xl" />
                  </div>
                </div>
                <div className="p-4 bg-[#FFFDE7] border-t border-[#F0F0F0] flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#888]">
                    Os dados são criptografados e só serão revelados ao comprador após a confirmação do pagamento.
                  </p>
                </div>
              </>
            ) : (
              <div className="p-4 flex items-start gap-2.5 bg-[#F0F8FF] border-t border-[#E8E8E8]">
                <MessageCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#555] leading-relaxed">
                  Após o pagamento ser confirmado, um chat será aberto automaticamente entre você e o comprador. Envie os dados de acesso diretamente pela conversa.
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Spacer to prevent sticky button from covering content */}
        <div className="h-[72px]" />
      </div>

      {/* Sticky bottom publish button */}
      <div className="fixed bottom-[60px] left-0 right-0 z-40" style={{ background: 'linear-gradient(to top, #F5F5F5 60%, transparent)' }}>
        <div className="px-4 pb-4 pt-3">
          <button
            onClick={handlePublish}
            disabled={!title || !price || (credDeliveryMode === "prefill" && (!credLogin || !credPassword)) || loading}
            className="w-full h-[52px] rounded-[14px] flex items-center justify-center text-white text-base font-semibold border-none cursor-pointer transition-opacity disabled:opacity-40"
            style={{ background: '#2D6FF0', boxShadow: '0 4px 16px rgba(45,111,240,0.40)' }}
          >
            {loading ? "Publicando..." : "Publicar Anúncio"}
          </button>
        </div>
      </div>
    </div>
  );
}
