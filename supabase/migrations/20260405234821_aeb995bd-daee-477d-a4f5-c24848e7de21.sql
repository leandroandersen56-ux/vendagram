
-- Fix views to use SECURITY INVOKER instead of SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS
SELECT 
  id, user_id, username, name, avatar_url, bio, 
  is_verified, avg_rating, total_reviews, total_sales, 
  total_purchases, created_at, referral_code
FROM public.profiles;

DROP VIEW IF EXISTS public.public_listings;
CREATE VIEW public.public_listings
WITH (security_invoker = true) AS
SELECT 
  id, seller_id, title, description, category, price, status,
  platform_username, followers_count, level, highlights, includes,
  views_count, created_at, updated_at, screenshots, accepts_offers, min_price
FROM public.listings;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT SELECT ON public.public_listings TO anon, authenticated;

-- Drop unused function
DROP FUNCTION IF EXISTS public.mask_profile_pii();
