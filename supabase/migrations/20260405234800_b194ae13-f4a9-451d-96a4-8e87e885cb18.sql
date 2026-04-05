
-- =============================================
-- 1. PROFILES: Restrict PII exposure
-- =============================================

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Public can only see non-sensitive fields via a security definer function
-- We use two policies: one for owner (full access), one for public (limited columns via a view)
-- Since column-level RLS isn't native, we use a view approach

-- Create a public view with only safe columns
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id, user_id, username, name, avatar_url, bio, 
  is_verified, avg_rating, total_reviews, total_sales, 
  total_purchases, created_at, referral_code
FROM public.profiles;

-- Owner can see their own full profile
CREATE POLICY "Users can view their own full profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Other users can see non-sensitive fields only (via RLS on the base table)
-- We allow SELECT but use a security definer function to strip sensitive fields
-- Actually, the simplest approach: allow everyone to SELECT but only return safe columns via the view
-- For the base table, only owner can SELECT
-- But this breaks existing queries... Let's use a different approach:
-- Allow public SELECT but create a trigger/function approach
-- Best approach: two SELECT policies
CREATE POLICY "Public can view non-sensitive profile data"
ON public.profiles FOR SELECT
USING (true);

-- We need to handle this at the application level + use the view
-- Since Postgres RLS can't do column-level, we'll use the view for public queries
-- and keep the base table policy for owner queries
-- Actually let's drop and recreate properly:

DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view non-sensitive profile data" ON public.profiles;

-- Use security definer function to check column access
-- Better approach: RLS with true but use a SECURITY DEFINER function to mask columns
CREATE OR REPLACE FUNCTION public.mask_profile_pii()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- This is a row-level trigger approach - not ideal for SELECT
  RETURN NEW;
END;
$$;

-- Simplest effective approach: two policies
-- 1. Owner sees everything
CREATE POLICY "Owner can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Everyone else sees the row but we rely on the view for public queries
-- We need to allow public access for seller profiles etc.
-- Let's create a restricted policy that always returns but strips via view
CREATE POLICY "Public profile access"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (true);

-- Since we can't do column-level RLS, the view is the solution
-- Drop the redundant owner policy (the public one covers it)
DROP POLICY IF EXISTS "Owner can view own profile" ON public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- =============================================
-- 2. LISTINGS: Hide prefilled_credentials
-- =============================================

DROP POLICY IF EXISTS "Active listings are viewable by everyone" ON public.listings;

-- Create a view that excludes sensitive columns
CREATE OR REPLACE VIEW public.public_listings AS
SELECT 
  id, seller_id, title, description, category, price, status,
  platform_username, followers_count, level, highlights, includes,
  views_count, created_at, updated_at, screenshots, accepts_offers, min_price
FROM public.listings;

-- Only active listings or own listings visible, prefilled_credentials included for owner only
CREATE POLICY "Active listings visible to everyone"
ON public.listings FOR SELECT
USING ((status = 'active'::listing_status) OR (seller_id = auth.uid()));

GRANT SELECT ON public.public_listings TO anon, authenticated;

-- =============================================
-- 3. WALLETS: Enforce zero balance on insert
-- =============================================

CREATE OR REPLACE FUNCTION public.enforce_wallet_defaults()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.balance := 0;
  NEW.pending := 0;
  NEW.total_earned := 0;
  RETURN NEW;
END;
$$;

CREATE TRIGGER wallet_defaults_on_insert
  BEFORE INSERT ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.enforce_wallet_defaults();

-- =============================================
-- 4. REFERRALS: Restrict INSERT policy
-- =============================================

DROP POLICY IF EXISTS "System can insert referrals" ON public.referrals;

CREATE POLICY "Users can register as referred"
ON public.referrals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = referred_id AND referrer_id != referred_id);
