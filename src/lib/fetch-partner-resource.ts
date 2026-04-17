import { supabase } from "@/lib/supabase-custom-client";

type PartnerResource = "users" | "listings";

interface PartnerResourceResponse<T> {
  data?: T[];
  error?: string;
}

export async function fetchPartnerResource<T>(resource: PartnerResource): Promise<T[]> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message || "Falha ao validar sessão do sócio");
  }

  const token = sessionData.session?.access_token;
  if (!token) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ resource }),
  });

  const payload = (await response.json().catch(() => null)) as PartnerResourceResponse<T> | null;

  if (!response.ok) {
    throw new Error(payload?.error || `Erro ${response.status} ao buscar ${resource}`);
  }

  if (!payload?.data) {
    return [];
  }

  return payload.data;
}