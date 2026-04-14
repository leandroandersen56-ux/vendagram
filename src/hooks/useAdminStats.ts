import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export { formatBRL } from "@/lib/mock-data";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [users, listings, transactions, disputes, withdrawals] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("transactions").select("amount, status, created_at"),
        supabase.from("disputes").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("withdrawals").select("amount").eq("status", "pending"),
      ]);

      const completedTx = transactions.data?.filter(t => t.status === "completed") ?? [];
      const gmv = completedTx.reduce((s, t) => s + Number(t.amount), 0);
      const pendingWithdrawals = withdrawals.data?.reduce((s, w) => s + Number(w.amount), 0) ?? 0;

      // Weekly trend
      const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const thisWeekTx = completedTx.filter(t => t.created_at > oneWeekAgo);
      const thisWeekGmv = thisWeekTx.reduce((s, t) => s + Number(t.amount), 0);

      return {
        totalUsers: users.count ?? 0,
        activeListings: listings.count ?? 0,
        gmv,
        revenue: gmv * 0.10,
        openDisputes: disputes.count ?? 0,
        pendingWithdrawals,
        thisWeekGmv,
      };
    },
    refetchInterval: 30_000,
  });
}
