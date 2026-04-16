
INSERT INTO storage.buckets (id, name, public)
VALUES ('ambassador-proofs', 'ambassador-proofs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'ambassador-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ambassador-proofs');

CREATE POLICY "Admins manage proofs"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'ambassador-proofs' AND has_role(auth.uid(), 'admin'::app_role));
