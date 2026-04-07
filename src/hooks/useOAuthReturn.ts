import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * After Google OAuth on vendagram.lovable.app, if the user originally came
 * from froiv.com, redirect them back with session tokens so the Supabase
 * client on froiv.com can pick up the session.
 */
export function useOAuthReturn() {
  useEffect(() => {
    const returnOrigin = localStorage.getItem("oauth_return_origin");
    if (!returnOrigin) return;

    // Only act when we're on the lovable.app domain (not on froiv.com)
    if (!window.location.hostname.includes("lovable.app")) return;

    // Wait for Supabase to finish processing the OAuth callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_IN") {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            localStorage.removeItem("oauth_return_origin");
            // Redirect back to froiv.com with tokens in the hash
            const params = new URLSearchParams({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_in: String(session.expires_in),
              token_type: "bearer",
              type: "recovery",
            });
            window.location.href = `${returnOrigin}#${params.toString()}`;
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);
}
