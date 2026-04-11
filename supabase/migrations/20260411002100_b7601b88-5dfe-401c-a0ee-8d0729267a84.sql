-- 1. Remove overly permissive disputes bucket upload policy
DROP POLICY IF EXISTS "Authenticated users can upload dispute screenshots" ON storage.objects;

-- 2. Fix realtime policy to scope by user channel
DROP POLICY IF EXISTS "Authenticated users can listen to own changes" ON realtime.messages;
CREATE POLICY "Authenticated users can listen to own changes"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    realtime.topic() LIKE '%' || auth.uid()::text || '%'
    OR realtime.topic() = 'public'
  );

-- 3. Restrict audit_logs insert to a security definer function
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));