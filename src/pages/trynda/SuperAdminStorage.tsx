import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HardDrive, Trash2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const BUCKETS = ["listings", "avatars", "disputes", "verification-docs"];

export default function SuperAdminStorage() {
  const [activeBucket, setActiveBucket] = useState<string | null>(null);

  const { data: files, isLoading, refetch } = useQuery({
    queryKey: ["admin-storage", activeBucket],
    enabled: !!activeBucket,
    queryFn: async () => {
      const { data } = await supabase.storage.from(activeBucket!).list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
      return data ?? [];
    },
  });

  const deleteFile = async (name: string) => {
    if (!activeBucket) return;
    const { error } = await supabase.storage.from(activeBucket).remove([name]);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Arquivo excluído"); refetch(); }
  };

  const copyUrl = (name: string) => {
    const { data } = supabase.storage.from(activeBucket!).getPublicUrl(name);
    navigator.clipboard.writeText(data.publicUrl);
    toast.success("URL copiada!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Storage</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {BUCKETS.map(b => (
          <button key={b} onClick={() => setActiveBucket(b)}
            className={`bg-[#1e1e35] rounded-xl border p-5 text-left transition-colors ${
              activeBucket === b ? "border-[#7c3aed]" : "border-white/[0.06] hover:border-white/[0.12]"
            }`}>
            <HardDrive className="h-5 w-5 text-[#7c3aed] mb-2" />
            <p className="text-white text-sm font-medium">{b}</p>
          </button>
        ))}
      </div>

      {activeBucket && (
        <div className="bg-[#1e1e35] rounded-xl border border-white/[0.06] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-gray-300">{activeBucket} — Arquivos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Nome", "Tamanho", "Criado", "Ações"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] text-gray-400 uppercase font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-10 text-gray-500">Carregando...</td></tr>
                ) : files?.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-gray-500">Bucket vazio</td></tr>
                ) : files?.map(f => (
                  <tr key={f.name} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white text-xs font-mono max-w-[200px] truncate">{f.name}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {f.metadata?.size ? `${(f.metadata.size / 1024).toFixed(1)} KB` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {f.created_at ? new Date(f.created_at).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => copyUrl(f.name)} className="text-gray-400 hover:text-white">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteFile(f.name)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
