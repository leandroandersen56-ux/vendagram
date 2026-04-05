
-- Remove the permissive public SELECT policy
DROP POLICY IF EXISTS "Public profile access" ON public.profiles;

-- Only owner + admins can query the base profiles table
CREATE POLICY "Owner can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
