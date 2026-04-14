DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT id, user_id, username, name, avatar_url, cover_url, bio, is_verified, avg_rating, total_reviews, total_sales, total_purchases, created_at, referral_code
FROM profiles;