
-- Storage buckets for screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('disputes', 'disputes', false);

-- Listings bucket: public read, authenticated upload
CREATE POLICY "Listing images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'listings');
CREATE POLICY "Authenticated users can upload listing images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own listing images" ON storage.objects FOR UPDATE USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own listing images" ON storage.objects FOR DELETE USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Disputes bucket: only participants and admins
CREATE POLICY "Authenticated users can upload dispute screenshots" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'disputes' AND auth.role() = 'authenticated');
CREATE POLICY "Users can view their own dispute files" ON storage.objects FOR SELECT USING (bucket_id = 'disputes' AND auth.uid()::text = (storage.foldername(name))[1]);
