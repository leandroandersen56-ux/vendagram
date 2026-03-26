import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PLATFORMS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function EditListingPanel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [followersCount, setFollowersCount] = useState("");
  const [includes, setIncludes] = useState("");
  const [highlights, setHighlights] = useState<Record<string, unknown>>({});

  useEffect(() => {
    async function fetchListing() {
      if (!id) return;
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        toast({ title: "Anúncio não encontrado", variant: "destructive" });
        navigate("/painel/anuncios");
        return;
      }

      setTitle(data.title);
      setDescription(data.description || "");
      setPrice(String(data.price));
      setCategory(data.category);
      setLevel(data.level ? String(data.level) : "");
      setFollowersCount(data.followers_count ? String(data.followers_count) : "");
      setIncludes(data.includes || "");
      setHighlights(typeof data.highlights === 'object' && data.highlights ? data.highlights as Record<string, unknown> : {});
      setLoading(false);
    }
    fetchListing();
  }, [id, navigate, toast]);

  const handleSave = async () => {
    if (!title || !price) {
      toast({ title: "Preencha título e preço", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("listings")
      .update({
        title,
        description: description || null,
        price: parseFloat(price),
        category: category as any,
        level: level ? parseInt(level) : null,
        followers_count: followersCount ? parseInt(followersCount) : null,
        includes: includes || null,
        highlights: highlights as any,
      })
      .eq("id", id!);

    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Anúncio atualizado!" });
      navigate("/painel/anuncios");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Button variant="ghost" onClick={() => navigate("/painel/anuncios")} className="mb-4 text-muted-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Button>

      <h1 className="text-xl font-bold text-foreground mb-2">Editar Anúncio</h1>
      <p className="text-muted-foreground text-sm mb-6">Atualize os detalhes do seu anúncio</p>

      <div className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label className="text-foreground">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Título *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-card border-border" />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Descrição</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-card border-border min-h-[100px]" />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Preço (R$) *</Label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-card border-border" />
        </div>

        <Card className="bg-card border-border p-4 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Detalhes Opcionais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Nível</Label>
              <Input type="number" value={level} onChange={(e) => setLevel(e.target.value)} className="bg-muted border-border" />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Seguidores</Label>
              <Input type="number" value={followersCount} onChange={(e) => setFollowersCount(e.target.value)} className="bg-muted border-border" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">O que inclui</Label>
            <Textarea value={includes} onChange={(e) => setIncludes(e.target.value)} className="bg-muted border-border" placeholder="Ex: Skins raras, itens exclusivos..." />
          </div>
        </Card>

        <Button variant="hero" onClick={handleSave} disabled={saving || !title || !price}>
          <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </motion.div>
  );
}
