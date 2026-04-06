
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, MessageSquare, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { moderateText, getModerationMessage } from "@/lib/content-moderation";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface TransactionChatProps {
  transactionId: string;
  otherUserName?: string;
}

export default function TransactionChat({ transactionId, otherUserName = "Usuário" }: TransactionChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`chat-${transactionId}`)
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
        }
      )
      .subscribe();

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

    if (data) setMessages(data);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    setSending(true);
    const msg = newMessage.trim();
    setNewMessage("");

    await supabase.from("transaction_messages").insert({
      transaction_id: transactionId,
      sender_id: user.id,
      message: msg,
    });

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

  const isSystemMessage = (msg: Message) => {
    return msg.message.startsWith("📦") || msg.message.startsWith("✅") || msg.message.startsWith("⚠️");
  };

  return (
    <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E8E8E8] flex items-center gap-2">
        <span className="text-[14px] font-semibold text-[#111] flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-primary" /> Chat da transação</span>
      </div>

      <div
        ref={scrollRef}
        className="h-64 overflow-y-auto px-4 py-3 space-y-3 bg-[#F9F9F9]"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-[#999]" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-[12px] text-[#999] pt-8">
            Nenhuma mensagem ainda. Inicie a conversa!
          </p>
        ) : (
          messages.map((msg) => {
            if (isSystemMessage(msg)) {
              return (
                <div key={msg.id} className="text-center">
                  <span className="inline-block text-[11px] text-[#999] bg-[#F0F0F0] rounded-full px-3 py-1">
                    {msg.message}
                  </span>
                  <p className="text-[10px] text-[#CCC] mt-0.5">{formatTime(msg.created_at)}</p>
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
                <div className={`max-w-[75%] ${isOwn ? "order-2" : ""}`}>
                  <div
                    className={`px-3 py-2 rounded-2xl text-[13px] ${
                      isOwn
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-[#F0F0F0] text-[#111] rounded-bl-md"
                    }`}
                  >
                    {msg.message}
                  </div>
                  <p className={`text-[10px] text-[#999] mt-0.5 ${isOwn ? "text-right" : ""}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="px-3 py-2 border-t border-[#E8E8E8] flex items-center gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva uma mensagem..."
          className="flex-1 h-9 px-4 rounded-full border border-[#DDD] text-[13px] bg-[#F9F9F9] focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !newMessage.trim()}
          className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0 disabled:opacity-50"
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
