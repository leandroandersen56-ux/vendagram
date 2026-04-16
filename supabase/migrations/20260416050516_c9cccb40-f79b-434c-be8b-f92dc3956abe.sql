-- Remove a policy ampla
DROP POLICY IF EXISTS "Anyone can read public profiles" ON public.profiles;

-- Cria policy restrita: admins e partners podem ver todos os perfis
CREATE POLICY "Admins and partners can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.partners
    WHERE partners.email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
      AND partners.is_active = true
  )
);