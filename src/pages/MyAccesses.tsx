import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Loader2, Copy, ExternalLink, Eye, EyeOff } from "lucide-react";
import DesktopPageShell from "@/components/DesktopPageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getListingImage, handleListingImageError } from "@/lib/utils";

interface AccessItem {
  transaction_id: string;
  listing_title: string;
  listing_category: string;
  listing_screenshots: string[] | null;
  credentials: Record<string, string>;
  purchased_at: string;
}

export default function MyAccesses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<AccessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) loadAccesses();
  }, [user]);

  const loadAccesses = async () => {
    setLoading(true);
    const { data: credentials } = await supabase
      .from("credentials")
      .select("transaction_id, data_encrypted, delivered_at")
      .order("delivered_at", { ascending: false });

    if (!credentials?.length) {
      setLoading(false);
      return;
    }

    const txIds = credentials.map((c) => c.transaction_id);
    const { data: transactions } = await supabase
      .from("transactions")
      .select("id, listing_id, created_at, buyer_id, listings(title, category, screenshots)")
      .in("id", txIds)
      .eq("buyer_id", user!.id);

    if (!transactions?.length) {
      setLoading(false);
      return;
    }

    const accessItems: AccessItem[] = transactions.map((tx: any) => {
      const cred = credentials.find((c) => c.transaction_id === tx.id);
      let parsed: Record<string, string> = {};
      const raw = cred?.data_encrypted || "";
      // Try base64 decode first
      try {
        const decoded = atob(raw);
        parsed = JSON.parse(decodeURIComponent(escape(decoded)));
      } catch {
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = raw ? { notes: raw } : {};
        }
      }

      return {
        transaction_id: tx.id,
        listing_title: tx.listings?.title || "Conta Digital",
        listing_category: tx.listings?.category || "other",
        listing_screenshots: tx.listings?.screenshots || null,
        credentials: parsed,
        purchased_at: tx.created_at,
      };
    });

    setItems(accessItems);
    setLoading(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const togglePassword = (txId: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(txId)) next.delete(txId);
      else next.add(txId);
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <DesktopPageShell
      title="Meus Acessos"
      breadcrumbs={[
        { label: "Início", to: "/" },
        { label: "Meus Acessos" },
      ]}
    >
      {loading ? (
        <div className="flex items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center pt-16">
          <Key className="h-12 w-12 text-[#CCC] mx-auto mb-4" />
          <p className="text-[15px] font-semibold text-[#111]">Nenhum acesso encontrado</p>
          <p className="text-[13px] text-[#999] mt-1">Suas credenciais de compras aparecerão aqui.</p>
          <button
            onClick={() => navigate("/marketplace")}
            className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl text-[14px] font-semibold"
          >
            Explorar marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.transaction_id}
              className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-[#F0F0F0]">
                <img
                  src={getListingImage(item.listing_category, item.listing_screenshots)}
                  alt={item.listing_title}
                  className="h-12 w-12 rounded-lg object-cover shrink-0"
                  loading="lazy"
                  onError={(e) => handleListingImageError(e, item.listing_category)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#111] truncate">{item.listing_title}</p>
                  <p className="text-[11px] text-[#999]">Comprado em {formatDate(item.purchased_at)}</p>
                </div>
                <button
                  onClick={() => navigate(`/compras/${item.transaction_id}`)}
                  className="text-primary text-[12px] font-medium flex items-center gap-1 shrink-0"
                >
                  Ver pedido <ExternalLink className="h-3 w-3" />
                </button>
              </div>

              {/* Credentials */}
              <div className="p-4 space-y-2">
                {item.credentials.email && (
                  <CredentialRow
                    label="Email"
                    value={item.credentials.email}
                    onCopy={() => copyToClipboard(item.credentials.email, "Email")}
                  />
                )}
                {(item.credentials.login || item.credentials.username) && (
                  <CredentialRow
                    label="Login"
                    value={item.credentials.login || item.credentials.username}
                    onCopy={() => copyToClipboard(item.credentials.login || item.credentials.username, "Login")}
                  />
                )}
                {(item.credentials.password || item.credentials.senha) && (
                  <div className="flex items-center justify-between bg-[#F9F9F9] rounded-lg px-3 py-2.5">
                    <div>
                      <span className="text-[10px] text-[#999] block">Senha</span>
                      <span className="text-[13px] font-mono text-[#111]">
                        {visiblePasswords.has(item.transaction_id)
                          ? (item.credentials.password || item.credentials.senha)
                          : "••••••••"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => togglePassword(item.transaction_id)}
                        className="h-8 w-8 rounded-lg hover:bg-[#E8E8E8] flex items-center justify-center transition-colors"
                      >
                        {visiblePasswords.has(item.transaction_id) ? (
                          <EyeOff className="h-4 w-4 text-[#666]" />
                        ) : (
                          <Eye className="h-4 w-4 text-[#666]" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(item.credentials.password || item.credentials.senha, "Senha")}
                        className="h-8 w-8 rounded-lg hover:bg-[#E8E8E8] flex items-center justify-center transition-colors"
                      >
                        <Copy className="h-4 w-4 text-[#666]" />
                      </button>
                    </div>
                  </div>
                )}
                {(item.credentials.twofa || item.credentials["2fa"]) && (
                  <CredentialRow
                    label="2FA"
                    value={item.credentials.twofa || item.credentials["2fa"]}
                    onCopy={() => copyToClipboard(item.credentials.twofa || item.credentials["2fa"], "2FA")}
                  />
                )}
                {(item.credentials.notes || item.credentials.observacoes) && (
                  <div className="bg-[#F9F9F9] rounded-lg px-3 py-2.5">
                    <span className="text-[10px] text-[#999] block">Observações</span>
                    <p className="text-[12px] text-[#333] whitespace-pre-line mt-0.5">
                      {item.credentials.notes || item.credentials.observacoes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DesktopPageShell>
  );
}

function CredentialRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex items-center justify-between bg-[#F9F9F9] rounded-lg px-3 py-2.5">
      <div>
        <span className="text-[10px] text-[#999] block">{label}</span>
        <span className="text-[13px] font-mono text-[#111] select-all">{value}</span>
      </div>
      <button
        onClick={onCopy}
        className="h-8 w-8 rounded-lg hover:bg-[#E8E8E8] flex items-center justify-center transition-colors"
      >
        <Copy className="h-4 w-4 text-[#666]" />
      </button>
    </div>
  );
}
