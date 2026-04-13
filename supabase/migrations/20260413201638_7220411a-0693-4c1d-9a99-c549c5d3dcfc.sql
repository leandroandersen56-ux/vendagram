
CREATE POLICY "partner_updates_own_pix" ON public.partners
  FOR UPDATE TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
