
-- Enable RLS on listing_views
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert views" ON public.listing_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anon can insert views" ON public.listing_views FOR INSERT TO anon WITH CHECK (user_id IS NULL);
CREATE POLICY "Users can view own history" ON public.listing_views FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own history" ON public.listing_views FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage views" ON public.listing_views FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "System can insert referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage referrals" ON public.referrals FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add referral_code to profiles (if not already added)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE DEFAULT substr(md5(random()::text), 1, 8);

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_listing_views_user ON public.listing_views (user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_views_listing ON public.listing_views (listing_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals (referrer_id);
