import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Global hook: shows toast when a new transaction message arrives
 * and the user is NOT on the order detail page for that transaction.
 */
export function useMessageToasts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("global-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transaction_messages",
        },
        async (payload) => {
          const msg = payload.new as any;

          // Skip own messages and system messages
          if (msg.sender_id === user.id || msg.is_system) return;

          // Skip if user is already on this order's page
          if (location.pathname.includes(msg.transaction_id)) return;

          // Show toast
          toast("💬 Nova mensagem", {
            description: msg.message?.slice(0, 60) + (msg.message?.length > 60 ? "..." : ""),
            action: {
              label: "Ver chat",
              onClick: () => navigate(`/compras/${msg.transaction_id}`),
            },
            duration: 6000,
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, location.pathname]);
}
