
-- 1. Recreate public_listings view WITHOUT prefilled_credentials
CREATE OR REPLACE VIEW public.public_listings AS
SELECT
  id, seller_id, title, description, category, price, status,
  platform_username, followers_count, level, highlights, includes,
  views_count, created_at, updated_at, screenshots, accepts_offers, min_price
FROM public.listings
WHERE status = 'active';

-- 2. Fix disputes bucket: drop old INSERT policy and create proper one
DROP POLICY IF EXISTS "Authenticated users can upload dispute files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload dispute files" ON storage.objects;

CREATE POLICY "Dispute participants can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'disputes'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM transactions t
    WHERE (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
      AND t.id::text = (storage.foldername(name))[1]
  )
);

-- 3. Fix disputes bucket: drop old SELECT policy and create proper one
DROP POLICY IF EXISTS "Users can view own dispute files" ON storage.objects;
DROP POLICY IF EXISTS "Dispute participants can view files" ON storage.objects;

CREATE POLICY "Dispute participants can view files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'disputes'
  AND EXISTS (
    SELECT 1 FROM transactions t
    WHERE (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
      AND t.id::text = (storage.foldername(name))[1]
  )
);

-- 4. Add Realtime authorization policies
CREATE POLICY "Authenticated users can listen to own changes"
ON realtime.messages FOR SELECT
USING (auth.role() = 'authenticated');
