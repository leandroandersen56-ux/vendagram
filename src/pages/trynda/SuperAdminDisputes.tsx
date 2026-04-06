import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/hooks/useAdminStats";
import { AlertTriangle, CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function SuperAdminDisputes() {
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");

  const { data: disputes, isLoading, refetch } = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: async () => {
      const { data } = await supabase.from("disputes")
        .select("*, transactions(amount, buyer_id, seller_id, listing_id, listings(title))")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const resolveDispute = async (disputeId: string, transactionId: string, resolution: "refund" | "release") => {
    const fnPath = resolution === "refund" ? "open-dispute" : "release-escrow";
    
    // Update dispute status
    await supabase.from("disputes").update({
      status: "resolved",
      resolution_type: resolution,
      admin_notes: adminNote || null,
      resolved_at: new Date().toISOString(),
      resolved_by: (await supabase.auth.getUser()).data.user?.id,
    }).eq("id", disputeId);

    // Log action
    await supabase.from("admin_actions").insert({
      admin_id: (await supabase.auth.getUser()).data.user?.id ?? "",
      action: `dispute_${resolution}`,
      target_type: "dispute",
      target_id: disputeId,
      details: { transaction_id: transactionId, note: adminNote },
    });

    toast.success(resolution === "refund" ? "Comprador reembolsado" : "Valor liberado para vendedor");
    setSelectedDispute(null);
    setAdminNote("");
    refetch();
  };

  const getUrgency = (createdAt: string) => {
    const hours = (Date.now() - new Date(createdAt).getTime()) / 3600000;
    if (hours > 24) return { label: `⚠️ URGENTE (há ${Math.floor(hours)}h)`, cls: "border-red-500/50" };
    return { label: `há ${Math.floor(hours)}h`, cls: "border-white/[0.06]" };
  };

  const statusColors: Record<string, string> = {
    open: "bg-red-500/20 text-red-400",
    under_review: "bg-yellow-500/20 text-yellow-400",
    resolved: "bg-emerald-500/20 text-emerald-400",
    closed: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Disputas ({disputes?.length ?? 0})</h1>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Carregando...</div>
      ) : disputes?.length === 0 ? (
        <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] p-10 text-center">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <p className="text-gray-300 font-medium">Nenhuma disputa aberta</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes?.map(d => {
            const urgency = getUrgency(d.created_at);
            const tx = d.transactions as any;
            return (
              <div key={d.id} className={`bg-[#1e1e35] rounded-xl border ${urgency.cls} p-5`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[d.status]}`}>
                      {d.status}
                    </span>
                    <span className="text-xs text-gray-400">{urgency.label}</span>
                  </div>
                  <span className="text-white font-bold">{formatBRL(tx?.amount ?? 0)}</span>
                </div>
                <p className="text-white text-sm font-medium mb-1">{tx?.listings?.title || "Produto"}</p>
                <p className="text-gray-400 text-sm mb-3">"{d.description}"</p>
                
                {d.status === "open" && (
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setSelectedDispute(d)}
                      className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs px-4 py-2 rounded-lg font-medium">
                      Resolver
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resolve modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedDispute(null)} />
          <div className="relative bg-[#1a1a2e] rounded-xl border border-white/[0.06] w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Resolver disputa</h3>
            <p className="text-gray-400 text-sm">{selectedDispute.description}</p>
            <textarea
              placeholder="Nota da resolução (opcional)"
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              className="w-full bg-[#0f0f1a] border border-white/[0.06] rounded-lg p-3 text-sm text-white min-h-[80px] focus:outline-none focus:border-[#7c3aed]"
            />
            <div className="flex gap-3">
              <button
                onClick={() => resolveDispute(selectedDispute.id, selectedDispute.transaction_id, "refund")}
                className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2">
                <XCircle className="h-4 w-4" /> Reembolsar comprador
              </button>
              <button
                onClick={() => resolveDispute(selectedDispute.id, selectedDispute.transaction_id, "release")}
                className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" /> Liberar vendedor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
