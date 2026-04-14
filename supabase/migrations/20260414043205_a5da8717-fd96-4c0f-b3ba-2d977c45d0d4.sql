
CREATE POLICY "Anyone can view active partners"
ON public.partners
FOR SELECT
TO anon, authenticated
USING (is_active = true);
