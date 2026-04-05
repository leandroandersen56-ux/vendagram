import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/menu/PageHeader";

export default function DeleteAccount() {
  const { toast } = useToast();
  const [confirmation, setConfirmation] = useState("");

  const handleDelete = () => {
    toast({ title: "Solicitação recebida", description: "Sua conta será excluída em até 30 dias. Você pode cancelar a exclusão entrando em contato com nosso suporte." });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      <PageHeader title="Excluir conta" />
      <div className="p-4 space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Esta ação é irreversível</p>
            <p className="text-xs text-red-600 mt-1">Ao excluir sua conta, todos os seus dados, anúncios, histórico de transações e saldo serão permanentemente removidos após 30 dias.</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4 space-y-3">
          <p className="text-sm text-[#666]">Para confirmar, digite <strong>EXCLUIR</strong> no campo abaixo:</p>
          <Input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder='Digite "EXCLUIR"' className="bg-transparent border-[#E8E8E8] h-11 rounded-xl" />
        </div>
      </div>
      <div className="fixed bottom-[60px] left-0 right-0 z-40 px-4 pb-4 pt-3" style={{ background: 'linear-gradient(to top, #F5F5F5 60%, transparent)' }}>
        <button onClick={handleDelete} disabled={confirmation !== "EXCLUIR"} className="w-full h-[52px] rounded-[14px] text-white text-base font-semibold disabled:opacity-40 bg-red-500">
          Solicitar exclusão da conta
        </button>
      </div>
    </div>
  );
}