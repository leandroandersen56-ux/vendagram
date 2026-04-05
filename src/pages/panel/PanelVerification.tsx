import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ShieldCheck, Upload, Camera, FileText, CreditCard,
  Loader2, CheckCircle2, XCircle, Clock, AlertCircle, User, Building2
} from "lucide-react";
import PageHeader from "@/components/menu/PageHeader";

type DocType = "cpf" | "cnpj";

interface DocRequirement {
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
  required: boolean;
}

const CPF_DOCS: DocRequirement[] = [
  { key: "rg_cpf", label: "RG ou CPF", icon: CreditCard, description: "Foto legível do documento (frente e verso)", required: true },
  { key: "passport", label: "Passaporte (alternativa)", icon: FileText, description: "Caso não tenha RG/CPF", required: false },
  { key: "selfie", label: "Selfie com documento", icon: Camera, description: "Foto segurando o documento ao lado do rosto", required: true },
];

const CNPJ_DOCS: DocRequirement[] = [
  { key: "cartao_cnpj", label: "Cartão CNPJ", icon: Building2, description: "Comprovante de situação cadastral do CNPJ", required: true },
  { key: "doc_responsavel", label: "Documento do responsável", icon: CreditCard, description: "RG ou CPF do representante legal", required: true },
  { key: "selfie", label: "Selfie com documento", icon: Camera, description: "Foto do responsável segurando o documento", required: true },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  pending: { label: "Em análise", color: "bg-warning/10 text-warning", Icon: Clock },
  approved: { label: "Verificado", color: "bg-success/10 text-success", Icon: CheckCircle2 },
  rejected: { label: "Recusado", color: "bg-destructive/10 text-destructive", Icon: XCircle },
};

export default function PanelVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existing, setExisting] = useState<any>(null);
  const [docType, setDocType] = useState<DocType>("cpf");
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const docs = docType === "cpf" ? CPF_DOCS : CNPJ_DOCS;

  useEffect(() => {
    if (user?.id) loadExisting();
  }, [user?.id]);

  const loadExisting = async () => {
    const { data } = await supabase
      .from("verification_requests")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setExisting(data[0]);
      setDocType((data[0] as any).doc_type || "cpf");
    }
    setLoading(false);
  };

  const handleFileSelect = (key: string, file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 5MB por arquivo", variant: "destructive" });
      return;
    }
    setUploadedFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async () => {
    const requiredDocs = docs.filter((d) => d.required);
    const missing = requiredDocs.filter((d) => !uploadedFiles[d.key]);
    if (missing.length > 0) {
      toast({
        title: "Documentos obrigatórios",
        description: `Envie: ${missing.map((m) => m.label).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const paths: string[] = [];
      let selfiePath = "";

      for (const [key, file] of Object.entries(uploadedFiles)) {
        if (!file) continue;
        const ext = file.name.split(".").pop();
        const path = `${user!.id}/${key}_${Date.now()}.${ext}`;

        const { error } = await supabase.storage
          .from("verification-docs")
          .upload(path, file, { upsert: true });

        if (error) throw error;

        if (key === "selfie") {
          selfiePath = path;
        } else {
          paths.push(path);
        }
      }

      const { error: insertError } = await supabase
        .from("verification_requests")
        .insert({
          user_id: user!.id,
          doc_type: docType,
          documents: paths,
          selfie_path: selfiePath || null,
        });

      if (insertError) throw insertError;

      toast({ title: "Documentos enviados!", description: "Sua verificação será analisada em até 48h." });
      await loadExisting();
    } catch (err: any) {
      toast({ title: "Erro ao enviar", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F5F5F5]"><PageHeader title="Verificação de Conta" /><div className="flex justify-center pt-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></div>;
  }

  // Show existing request status
  if (existing && existing.status !== "rejected") {
    const statusInfo = STATUS_CONFIG[existing.status] || STATUS_CONFIG.pending;
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-foreground mb-6">Verificação de Conta</h1>
        <Card className="bg-card border-border p-6 max-w-lg">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full ${statusInfo.color} mb-4`}>
              <statusInfo.Icon className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-1">{statusInfo.label}</h3>
            {existing.status === "pending" && (
              <p className="text-sm text-muted-foreground">
                Seus documentos estão em análise. Você será notificado quando a verificação for concluída.
              </p>
            )}
            {existing.status === "approved" && (
              <p className="text-sm text-muted-foreground">
                Sua conta foi verificada com sucesso! O selo de verificado aparece em seu perfil.
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span className="text-foreground font-medium">{existing.doc_type === "cnpj" ? "Pessoa Jurídica" : "Pessoa Física"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enviado em</span>
                <span className="text-foreground">{new Date(existing.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
              {existing.reviewed_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Analisado em</span>
                  <span className="text-foreground">{new Date(existing.reviewed_at).toLocaleDateString("pt-BR")}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Show rejection and allow re-submit
  const rejected = existing?.status === "rejected";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-xl font-semibold text-foreground mb-2">Verificação de Conta</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Verifique sua identidade para receber o selo de vendedor verificado e aumentar a confiança dos compradores.
      </p>

      {rejected && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-destructive">Verificação recusada</p>
            <p className="text-sm text-destructive/80">{existing?.rejection_reason || "Documentos não atenderam aos requisitos. Envie novamente."}</p>
          </div>
        </div>
      )}

      {/* Doc type selector */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => { setDocType("cpf"); setUploadedFiles({}); }}
          className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
            docType === "cpf"
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/30"
          }`}
        >
          <User className={`h-5 w-5 ${docType === "cpf" ? "text-primary" : "text-muted-foreground"}`} />
          <div className="text-left">
            <p className={`text-sm font-semibold ${docType === "cpf" ? "text-primary" : "text-foreground"}`}>Pessoa Física</p>
            <p className="text-[11px] text-muted-foreground">CPF, RG ou Passaporte</p>
          </div>
        </button>
        <button
          onClick={() => { setDocType("cnpj"); setUploadedFiles({}); }}
          className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
            docType === "cnpj"
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/30"
          }`}
        >
          <Building2 className={`h-5 w-5 ${docType === "cnpj" ? "text-primary" : "text-muted-foreground"}`} />
          <div className="text-left">
            <p className={`text-sm font-semibold ${docType === "cnpj" ? "text-primary" : "text-foreground"}`}>Pessoa Jurídica</p>
            <p className="text-[11px] text-muted-foreground">CNPJ + Documento do responsável</p>
          </div>
        </button>
      </div>

      {/* Document upload cards */}
      <div className="space-y-3 mb-6">
        {docs.map((doc) => {
          const file = uploadedFiles[doc.key];
          return (
            <Card
              key={doc.key}
              className={`bg-card border-border p-4 cursor-pointer hover:border-primary/30 transition-all ${
                file ? "border-success/50 bg-success/5" : ""
              }`}
              onClick={() => fileInputRefs.current[doc.key]?.click()}
            >
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                ref={(el) => { fileInputRefs.current[doc.key] = el; }}
                onChange={(e) => handleFileSelect(doc.key, e.target.files?.[0] || null)}
              />
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  file ? "bg-success/10" : "bg-primary/10"
                }`}>
                  {file ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <doc.icon className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{doc.label}</p>
                    {doc.required && <span className="text-[10px] text-destructive font-medium">Obrigatório</span>}
                  </div>
                  {file ? (
                    <p className="text-xs text-success truncate">{file.name}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                  )}
                </div>
                <Upload className={`h-4 w-4 ${file ? "text-success" : "text-muted-foreground"}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Guidelines */}
      <Card className="bg-primary/5 border-primary/20 p-4 mb-6">
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          Dicas para aprovação rápida
        </h4>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
            Fotos devem ser nítidas e sem cortes
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
            Na selfie, segure o documento ao lado do rosto
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
            Documentos devem estar dentro da validade
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
            Máximo 5MB por arquivo (JPG, PNG ou PDF)
          </li>
        </ul>
      </Card>

      <Button
        variant="hero"
        className="w-full h-12 text-base"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Enviando documentos...
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4 mr-2" />
            Enviar para Verificação
          </>
        )}
      </Button>
    </motion.div>
  );
}
