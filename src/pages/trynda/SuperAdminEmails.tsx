import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, Mail } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminEmails() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const sendEmail = async () => {
    if (!to || !subject || !body) { toast.error("Preencha todos os campos"); return; }
    setSending(true);
    const { error } = await supabase.functions.invoke("send-email", {
      body: { to, subject, html: `<p>${body}</p>` },
    });
    if (error) toast.error("Erro ao enviar email");
    else toast.success("Email enviado!");
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Emails</h1>

      <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Mail className="h-4 w-4 text-[#7c3aed]" /> Enviar email manual
        </h3>
        <input type="email" placeholder="Destinatário (email)" value={to} onChange={e => setTo(e.target.value)}
          className="w-full bg-[#0f0f1a] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7c3aed]" />
        <input type="text" placeholder="Assunto" value={subject} onChange={e => setSubject(e.target.value)}
          className="w-full bg-[#0f0f1a] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7c3aed]" />
        <textarea placeholder="Corpo do email" value={body} onChange={e => setBody(e.target.value)}
          className="w-full bg-[#0f0f1a] border border-white/[0.06] rounded-lg p-3 text-sm text-white min-h-[120px] focus:outline-none focus:border-[#7c3aed]" />
        <button onClick={sendEmail} disabled={sending}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 disabled:opacity-50">
          <Send className="h-4 w-4" /> {sending ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
