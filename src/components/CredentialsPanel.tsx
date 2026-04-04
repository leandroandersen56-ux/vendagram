
import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Lock, Loader2, AlertTriangle, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CredentialField {
  label: string;
  key: string;
  value: string;
}

interface CredentialsPanelProps {
  transactionId: string;
  isSeller: boolean;
  transactionStatus: string;
  credentials?: {
    login?: string;
    password?: string;
    email?: string;
    twofa?: string;
    notes?: string;
  } | null;
  deliveredAt?: string | null;
  onCredentialsSent?: () => void;
}

export default function CredentialsPanel({
  transactionId,
  isSeller,
  transactionStatus,
  credentials,
  deliveredAt,
  onCredentialsSent,
}: CredentialsPanelProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Seller form
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [twofa, setTwofa] = useState("");
  const [notes, setNotes] = useState("");

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(label);
    toast.success("Copiado!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendCredentials = async () => {
    if (!login.trim() || !password.trim()) {
      toast.error("Login e senha são obrigatórios");
      return;
    }
    setSending(true);
    try {
      const res = await supabase.functions.invoke("manage-credentials", {
        body: {
          transaction_id: transactionId,
          action: "send",
          credentials: {
            login: login.trim(),
            password: password.trim(),
            email: email.trim() || undefined,
            twofa: twofa.trim() || undefined,
            notes: notes.trim() || undefined,
          },
        },
      });
      if (res.error) throw new Error(res.error.message);
      toast.success("Credenciais enviadas com segurança!");
      onCredentialsSent?.();
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar credenciais");
    } finally {
      setSending(false);
    }
  };

  // Seller: send form
  if (isSeller && !deliveredAt && ["paid", "transfer_in_progress"].includes(transactionStatus)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#FFF8E0] border border-[#FFD700] rounded-xl p-4"
      >
        <h3 className="text-sm font-semibold text-[#111] mb-3 flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" /> Enviar credenciais da conta
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-[#999] uppercase font-medium">Login / Usuário *</label>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full mt-1 h-9 px-3 rounded-lg border border-[#DDD] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="ex: @usuario_conta"
            />
          </div>
          <div>
            <label className="text-[11px] text-[#999] uppercase font-medium">Senha *</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full mt-1 h-9 px-3 rounded-lg border border-[#DDD] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Senha da conta"
            />
          </div>
          <div>
            <label className="text-[11px] text-[#999] uppercase font-medium">Email vinculado</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 h-9 px-3 rounded-lg border border-[#DDD] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label className="text-[11px] text-[#999] uppercase font-medium">Código 2FA</label>
            <input
              value={twofa}
              onChange={(e) => setTwofa(e.target.value)}
              className="w-full mt-1 h-9 px-3 rounded-lg border border-[#DDD] text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
              placeholder="JBSWY3DPEHPK3PXP"
            />
          </div>
          <div>
            <label className="text-[11px] text-[#999] uppercase font-medium">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-1 h-16 p-3 rounded-lg border border-[#DDD] text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Ex: Troque a senha imediatamente"
            />
          </div>
          <button
            onClick={handleSendCredentials}
            disabled={sending || !login.trim() || !password.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-[14px] font-semibold disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                <Lock className="h-4 w-4" /> Enviar com segurança
              </>
            )}
          </button>
        </div>
      </motion.div>
    );
  }

  // Seller: already sent
  if (isSeller && deliveredAt) {
    return (
      <div className="bg-success/10 border border-success rounded-xl p-4 flex items-center gap-3">
        <Check className="h-5 w-5 text-success shrink-0" />
        <div>
          <p className="text-[14px] font-semibold text-success">Credenciais enviadas</p>
          <p className="text-[12px] text-[#666]">
            Enviadas em {new Date(deliveredAt).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>
    );
  }

  // Buyer: view credentials
  if (!isSeller && credentials && deliveredAt) {
    const fields: CredentialField[] = [
      { label: "Login", key: "login", value: credentials.login || "" },
      { label: "Senha", key: "password", value: credentials.password || "" },
      ...(credentials.email ? [{ label: "Email vinculado", key: "email", value: credentials.email }] : []),
      ...(credentials.twofa ? [{ label: "Código 2FA", key: "twofa", value: credentials.twofa }] : []),
      ...(credentials.notes ? [{ label: "Observações", key: "notes", value: credentials.notes }] : []),
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#F0F8FF] border border-primary rounded-xl p-4"
      >
        <h3 className="text-sm font-semibold text-[#111] mb-3 flex items-center gap-2">
          🔐 Dados de acesso da conta
        </h3>
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.key} className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[#999] uppercase font-medium">{field.label}</p>
                <p className="text-[14px] text-[#111] font-mono">{field.value}</p>
              </div>
              <button
                onClick={() => handleCopy(field.value, field.key)}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors"
              >
                {copiedField === field.key ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4 text-primary" />
                )}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-start gap-2 bg-[#FFF8E0] rounded-lg p-3">
          <AlertTriangle className="h-4 w-4 text-[#FF6900] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#666]">
            Altere a senha após o acesso. Você tem <strong>24h para verificar</strong> a conta antes da liberação automática.
          </p>
        </div>
      </motion.div>
    );
  }

  // Buyer: waiting for credentials
  if (!isSeller && !deliveredAt && ["paid"].includes(transactionStatus)) {
    return (
      <div className="bg-[#FFF8E0] border border-[#FFD700] rounded-xl p-4 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-[#FF6900] shrink-0" />
        <div>
          <p className="text-[14px] font-semibold text-[#111]">Aguardando credenciais</p>
          <p className="text-[12px] text-[#666]">O vendedor enviará os dados de acesso em breve.</p>
        </div>
      </div>
    );
  }

  return null;
}
