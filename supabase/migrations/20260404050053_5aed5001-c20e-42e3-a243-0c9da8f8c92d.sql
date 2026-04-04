
-- Audit logs table for critical actions
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Add dispute resolution fields
ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS resolution_type TEXT;
ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS resolved_by UUID;
ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Add pix_key_type to withdrawals
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS pix_key_type TEXT DEFAULT 'cpf';

-- Allow dispute participants to update their own disputes (add evidence)
CREATE POLICY "Dispute opener can update own dispute"
  ON public.disputes FOR UPDATE
  USING (opened_by = auth.uid());
