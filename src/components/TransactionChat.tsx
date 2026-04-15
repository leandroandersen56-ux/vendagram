import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, MessageSquare, Key, Unlock, Bot, Check, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  is_system?: boolean;
  allow_sensitive_data?: boolean;
  read_at?: string | null;
}

interface TransactionChatProps {
  transactionId: string;
  otherUserName?: string;
  isSeller?: boolean;
  transactionStatus?: string;
  onCredentialsSent?: () => void;
}

export default function TransactionChat({
  transactionId,
  otherUserName = "Usuário",
  isSeller = false,
  transactionStatus = "",
  onCredentialsSent,
}: TransactionChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [credentials, setCredentials] = useState<{email?:string;login?:string;password?:string;twofa?:string;notes?:string} | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    loadMessages();
    loadCredentials();

    const channel = supabase
      .channel(`chat-order-${transactionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transaction_messages",
          filter: `transaction_id=eq.${transactionId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Mark as read if from other person
          if (newMsg.sender_id !== user?.id) {
            markAsRead();
          }
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const online = Object.values(state).some(
          (p: any) => p[0]?.user_id !== user?.id
        );
        setOtherUserOnline(online);
      })
      .subscribe();

    // Track presence
    channel.track({ user_id: user?.id, online_at: new Date().toISOString() });
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("transaction_messages")
      .select("*")
      .eq("transaction_id", transactionId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data as Message[]);
    setLoading(false);
    markAsRead();
  };

  const decodeCredentials = (raw: string): Record<string, string> => {
    // Try base64 decode first
    try {
      const decoded = atob(raw);
      const json = decodeURIComponent(escape(decoded));
      return JSON.parse(json);
    } catch { /* not base64 */ }
    // Try plain JSON
    try {
      return JSON.parse(raw);
    } catch { /* not JSON */ }
    return { notes: raw };
  };

  const loadCredentials = async () => {
    const { data } = await supabase
      .from("credentials")
      .select("data_encrypted")
      .eq("transaction_id", transactionId)
      .maybeSingle();

    if (data?.data_encrypted) {
      setCredentials(decodeCredentials(data.data_encrypted));
    }
  };

  const markAsRead = async () => {
    if (!user) return;
    await supabase
      .from("transaction_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("transaction_id", transactionId)
      .neq("sender_id", user.id)
      .is("read_at", null);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    // NO content moderation in credential delivery chat
    // allow_sensitive_data = true for all messages in this context

    setSending(true);
    const msg = newMessage.trim();
    setNewMessage("");

    const { error } = await supabase.from("transaction_messages").insert({
      transaction_id: transactionId,
      sender_id: user.id,
      message: msg,
      allow_sensitive_data: true,
    });

    if (error) {
      toast.error("Erro ao enviar mensagem");
      setNewMessage(msg);
    } else if (isSeller && transactionStatus === "transfer_in_progress") {
      // When seller sends first message, update status to credentials_sent
      await supabase
        .from("transactions")
        .update({ status: "credentials_sent", updated_at: new Date().toISOString() })
        .eq("id", transactionId)
        .eq("status", "transfer_in_progress");

      onCredentialsSent?.();
    }

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E8E8E8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-[14px] font-semibold text-[#111]">Chat da transação</span>
          </div>
          <div className="flex items-center gap-2">
            {otherUserOnline && (
              <span className="flex items-center gap-1 text-[11px] text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <Unlock className="h-3 w-3 text-green-600" />
          <span className="text-[11px] text-green-700 font-medium">
            Compartilhamento de credenciais liberado
          </span>
          <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
            Credenciais liberadas
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="h-80 overflow-y-auto px-4 py-3 space-y-3 bg-[#F9F9F9]"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-[#999]" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-[12px] text-[#999] pt-8">
            Nenhuma mensagem ainda.
          </p>
        ) : (
          messages.map((msg) => {
            // System message
            if (msg.is_system) {
              return (
                <div key={msg.id} className="mx-auto max-w-[90%]">
                  <div className="bg-[#F0F8FF] border-l-[3px] border-primary rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Bot className="h-3.5 w-3.5 text-[#999]" />
                      <span className="text-[11px] text-[#999] font-medium">Froiv</span>
                    </div>
                    <p className="text-[12px] text-[#333] leading-relaxed whitespace-pre-line">
                      {msg.message}
                    </p>
                  </div>
                  <p className="text-[10px] text-[#CCC] mt-1 text-center">{formatTime(msg.created_at)}</p>
                </div>
              );
            }

            const isOwn = msg.sender_id === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[75%]`}>
                  <div
                    className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                      isOwn
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-[#F0F0F0] text-[#111] rounded-bl-md"
                    }`}
                  >
                    {msg.message}
                  </div>
                  <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? "justify-end" : ""}`}>
                    <span className="text-[10px] text-[#999]">{formatTime(msg.created_at)}</span>
                    {isOwn && (
                      msg.read_at ? (
                        <CheckCheck className="h-3 w-3 text-primary" />
                      ) : (
                        <Check className="h-3 w-3 text-[#999]" />
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Credentials card */}
      {credentials && !isSeller && (
        <div className="mx-3 my-2 bg-[#F0FFF4] border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-4 w-4 text-green-600" />
            <span className="text-[13px] font-semibold text-green-700">Dados de acesso</span>
          </div>
          <div className="space-y-1.5 bg-white rounded-lg p-3 border border-green-100">
            {credentials.email && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#999]">Email</span>
                <span className="text-[13px] font-mono text-[#111] select-all">{credentials.email}</span>
              </div>
            )}
            {credentials.login && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#999]">Login</span>
                <span className="text-[13px] font-mono text-[#111] select-all">{credentials.login}</span>
              </div>
            )}
            {credentials.password && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#999]">Senha</span>
                <span className="text-[13px] font-mono text-[#111] select-all">{credentials.password}</span>
              </div>
            )}
            {credentials.twofa && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#999]">2FA</span>
                <span className="text-[13px] font-mono text-[#111] select-all">{credentials.twofa}</span>
              </div>
            )}
            {credentials.notes && (
              <div className="pt-1 border-t border-[#F0F0F0]">
                <span className="text-[11px] text-[#999]">Observações</span>
                <p className="text-[12px] text-[#333] mt-0.5 whitespace-pre-line select-all">{credentials.notes}</p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-[#999] mt-2">⚠️ Troque a senha imediatamente após o primeiro acesso.</p>
        </div>
      )}

      {/* Seller hint banner */}
      {isSeller && transactionStatus === "transfer_in_progress" && (
        <div className="mx-3 my-2 bg-[#FFF3CD] rounded-lg px-3 py-2 flex items-start gap-2">
          <Key className="h-3.5 w-3.5 text-[#856404] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#856404] leading-tight">
            Envie aqui: login, senha, email da conta e qualquer informação de acesso.
          </p>
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-2 border-t border-[#E8E8E8] flex items-center gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isSeller
              ? "Envie as credenciais aqui (login, senha, email...)"
              : "Aguardando credenciais do vendedor..."
          }
          className="flex-1 h-10 px-4 rounded-full border-[1.5px] border-[#E8E8E8] text-[13px] bg-[#F9F9F9] focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !newMessage.trim()}
          className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0 disabled:opacity-50 transition-colors hover:bg-primary/90"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Send className="h-4 w-4 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
