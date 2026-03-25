import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Eye, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PLATFORMS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

const PLATFORM_FIELDS: Record<string, { key: string; label: string; type: 'text' | 'number' | 'boolean' }[]> = {
  freefire: [
    { key: 'level', label: 'Nível da conta', type: 'number' },
    { key: 'diamonds', label: 'Número de diamantes', type: 'number' },
    { key: 'skins', label: 'Número de skins', type: 'number' },
    { key: 'rank', label: 'Rank atual', type: 'text' },
    { key: 'facebook_linked', label: 'Vinculada ao Facebook?', type: 'boolean' },
    { key: 'google_linked', label: 'Vinculada ao Google?', type: 'boolean' },
    { key: 'region', label: 'Região da conta', type: 'text' },
  ],
  instagram: [
    { key: 'followers', label: 'Número de seguidores', type: 'text' },
    { key: 'following', label: 'Número de seguindo', type: 'text' },
    { key: 'engagement', label: 'Nível de engajamento (%)', type: 'text' },
    { key: 'niche', label: 'Nicho/tema do perfil', type: 'text' },
    { key: 'verified', label: 'Conta verificada?', type: 'boolean' },
    { key: '2fa', label: 'Autenticação em dois fatores?', type: 'boolean' },
  ],
  tiktok: [
    { key: 'followers', label: 'Número de seguidores', type: 'text' },
    { key: 'likes', label: 'Total de likes', type: 'text' },
    { key: 'niche', label: 'Nicho/tema', type: 'text' },
    { key: 'verified', label: 'Conta verificada?', type: 'boolean' },
    { key: '2fa', label: '2FA ativo?', type: 'boolean' },
  ],
  facebook: [
    { key: 'friends', label: 'Número de amigos', type: 'number' },
    { key: 'page_linked', label: 'Tem página vinculada?', type: 'boolean' },
    { key: 'marketplace', label: 'Marketplace ativo?', type: 'boolean' },
    { key: 'restrictions', label: 'Conta tem restrições?', type: 'boolean' },
  ],
  youtube: [
    { key: 'subscribers', label: 'Inscritos', type: 'text' },
    { key: 'total_views', label: 'Total de visualizações', type: 'text' },
    { key: 'monetized', label: 'Monetizado?', type: 'boolean' },
    { key: 'niche', label: 'Nicho', type: 'text' },
  ],
  valorant: [
    { key: 'rank', label: 'Rank atual', type: 'text' },
    { key: 'skins', label: 'Número de skins', type: 'number' },
    { key: 'agents', label: 'Agentes desbloqueados', type: 'text' },
  ],
};

export default function CreateListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [platform, setPlatform] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [fields, setFields] = useState<Record<string, string | boolean>>({});
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [step, setStep] = useState<'form' | 'preview'>('form');

  const platformFields = PLATFORM_FIELDS[platform] || [];

  const handleSubmit = () => {
    if (!platform || !title || !price || !acceptTerms) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    toast({ title: "Anúncio criado com sucesso!", description: "Seu anúncio está sendo revisado." });
    navigate("/marketplace");
  };

  if (step === 'preview') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
          <Button variant="ghost" onClick={() => setStep('form')} className="mb-6 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao formulário
          </Button>
          <Card className="bg-card border-border p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Preview do Anúncio</h2>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Plataforma: <span className="text-foreground">{PLATFORMS.find(p => p.id === platform)?.name}</span></p>
              <p className="text-sm text-muted-foreground">Título: <span className="text-foreground">{title}</span></p>
              <p className="text-sm text-muted-foreground">Preço: <span className="text-primary font-bold">R$ {price}</span></p>
              <p className="text-sm text-muted-foreground">Descrição: <span className="text-foreground">{description}</span></p>
              {Object.entries(fields).map(([k, v]) => (
                <p key={k} className="text-sm text-muted-foreground">{k}: <span className="text-foreground">{typeof v === 'boolean' ? (v ? 'Sim' : 'Não') : v}</span></p>
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="glass" onClick={() => setStep('form')}>Editar</Button>
              <Button variant="hero" onClick={handleSubmit}>Publicar Anúncio</Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Criar Anúncio</h1>
          <p className="text-muted-foreground mb-8">Preencha os detalhes da conta que deseja vender</p>

          <div className="space-y-6">
            {/* Platform */}
            <div className="space-y-2">
              <Label className="text-foreground">Plataforma *</Label>
              <Select value={platform} onValueChange={(v) => { setPlatform(v); setFields({}); }}>
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

            {/* Title */}
            <div className="space-y-2">
              <Label className="text-foreground">Título *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Conta Free Fire Nível 70" className="bg-card border-border" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-foreground">Descrição</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva sua conta em detalhes..." className="bg-card border-border min-h-[100px]" />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label className="text-foreground">Preço (R$) *</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" className="bg-card border-border" />
            </div>

            {/* Screenshots */}
            <div className="space-y-2">
              <Label className="text-foreground">Screenshots (até 8)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/30 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Arraste ou clique para enviar imagens</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 5MB cada</p>
              </div>
            </div>

            {/* Dynamic fields */}
            {platformFields.length > 0 && (
              <div className="space-y-4 p-4 bg-card border border-border rounded-lg">
                <h3 className="font-semibold text-foreground text-sm">Detalhes da Conta</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {platformFields.map((f) => (
                    <div key={f.key} className="space-y-1">
                      <Label className="text-sm text-muted-foreground">{f.label}</Label>
                      {f.type === 'boolean' ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Checkbox
                            checked={fields[f.label] as boolean || false}
                            onCheckedChange={(checked) => setFields({ ...fields, [f.label]: !!checked })}
                          />
                          <span className="text-sm text-foreground">{fields[f.label] ? 'Sim' : 'Não'}</span>
                        </div>
                      ) : (
                        <Input
                          type={f.type === 'number' ? 'number' : 'text'}
                          value={fields[f.label] as string || ''}
                          onChange={(e) => setFields({ ...fields, [f.label]: e.target.value })}
                          className="bg-muted border-border"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom fields for "other" */}
            {platform === 'other' && (
              <div className="space-y-3">
                <Label className="text-foreground">Campos Personalizados</Label>
                {customFields.map((cf, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="Nome do campo" value={cf.key} onChange={(e) => {
                      const updated = [...customFields];
                      updated[i].key = e.target.value;
                      setCustomFields(updated);
                    }} className="bg-card border-border" />
                    <Input placeholder="Valor" value={cf.value} onChange={(e) => {
                      const updated = [...customFields];
                      updated[i].value = e.target.value;
                      setCustomFields(updated);
                    }} className="bg-card border-border" />
                    <Button variant="ghost" size="icon" onClick={() => setCustomFields(customFields.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="glass" size="sm" onClick={() => setCustomFields([...customFields, { key: '', value: '' }])}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar Campo
                </Button>
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-2">
              <Checkbox checked={acceptTerms} onCheckedChange={(c) => setAcceptTerms(!!c)} />
              <Label className="text-sm text-muted-foreground leading-relaxed">
                Aceito os termos de uso e confirmo que sou o proprietário legítimo da conta anunciada.
              </Label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="glass" onClick={() => setStep('preview')} disabled={!title || !platform}>
                <Eye className="h-4 w-4 mr-2" /> Preview
              </Button>
              <Button variant="hero" onClick={handleSubmit} disabled={!acceptTerms || !title || !platform || !price}>
                Publicar Anúncio
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
