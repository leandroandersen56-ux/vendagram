
-- Verify tables exist (they should from partial apply, but use IF NOT EXISTS pattern)
CREATE TABLE IF NOT EXISTS public.listing_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id uuid,
  session_id text,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  transaction_id uuid REFERENCES public.transactions(id),
  commission_amount numeric(10,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- This is just a no-op migration to ensure the schema is consistent
SELECT 1;
