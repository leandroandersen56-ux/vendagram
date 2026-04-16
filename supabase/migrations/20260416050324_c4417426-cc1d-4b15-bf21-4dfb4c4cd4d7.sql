CREATE POLICY "Anyone can read public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);