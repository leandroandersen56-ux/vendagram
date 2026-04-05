import { useState } from "react";
import { Send, Loader2, CheckCircle2, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function ContactPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error("Preencha todos os campos");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from("support_tickets" as any).insert({
        name,
        email,
        subject,
        message,
        user_id: user?.id || null,
      });
      if (error) throw error;

      // Try to send email notification
      try {
        await supabase.functions.invoke("send-email", {
          body: {
            type: "generic",
            to: email,
            data: { message: `Recebemos sua mensagem sobre "${subject}". Responderemos em até 24h.` },
          },
        });
      } catch {}

      setSent(true);
      toast.success("Mensagem enviada com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-20 sm:pt-24 pb-16 max-w-lg text-center">
          <div className="bg-card border border-border rounded-2xl p-8 mt-12">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Mensagem enviada!</h2>
            <p className="text-muted-foreground text-sm mb-6">Responderemos em até 24 horas no e-mail informado.</p>
            <a href="/" className="text-primary text-sm font-medium hover:underline">← Voltar para o início</a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 sm:pt-24 pb-16 max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Fale Conosco</h1>
          <p className="text-muted-foreground text-sm">Tem dúvidas ou precisa de ajuda? Envie sua mensagem.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase">Nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Seu nome"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase">Assunto</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full mt-1 h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Problema com compra, dúvida sobre saque..."
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase">Mensagem</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full mt-1 h-28 p-3 rounded-lg border border-border bg-background text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Descreva sua dúvida ou problema..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar mensagem
            </button>
          </form>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <a href="mailto:contato@froiv.com" className="hover:text-primary transition-colors">contato@froiv.com</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
