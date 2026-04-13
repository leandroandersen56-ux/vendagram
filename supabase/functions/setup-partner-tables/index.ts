import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const serviceKey = Deno.env.get("PERSONAL_SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) return new Response("Missing key", { status: 500 });

  const db = createClient(
    "https://yzwncktlibdfycqhvlqg.supabase.co",
    serviceKey,
    { db: { schema: "public" } }
  );

  const statements = [
    `CREATE TABLE IF NOT EXISTS public.partners (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      pix_key TEXT,
      pix_key_type TEXT,
      profit_percent DECIMAL(5,2) DEFAULT 5.00,
      is_active BOOLEAN DEFAULT true,
      created_by UUID,
      created_at TIMESTAMPTZ DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS public.partner_withdrawals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      partner_id UUID REFERENCES public.partners(id),
      amount DECIMAL(10,2) NOT NULL,
      pix_key TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      requested_at TIMESTAMPTZ DEFAULT now(),
      processed_at TIMESTAMPTZ,
      approved_by UUID,
      notes TEXT
    )`,
    `ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.partner_withdrawals ENABLE ROW LEVEL SECURITY`,
    `CREATE POLICY IF NOT EXISTS "partner_sees_own" ON public.partners FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))`,
    `CREATE POLICY IF NOT EXISTS "partner_withdrawal_select" ON public.partner_withdrawals FOR SELECT USING (partner_id IN (SELECT id FROM public.partners WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())))`,
    `CREATE POLICY IF NOT EXISTS "partner_withdrawal_insert" ON public.partner_withdrawals FOR INSERT WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())))`,
    `CREATE OR REPLACE FUNCTION public.get_partner_id_by_auth() RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT id FROM partners WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) LIMIT 1 $$`
  ];

  const results: any[] = [];

  for (const sql of statements) {
    try {
      const { data, error } = await db.rpc("exec_sql", { sql_text: sql });
      results.push({ sql: sql.substring(0, 60), data, error: error?.message || null });
    } catch (e: any) {
      results.push({ sql: sql.substring(0, 60), error: e.message });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
