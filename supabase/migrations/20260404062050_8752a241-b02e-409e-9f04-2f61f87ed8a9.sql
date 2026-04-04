
-- Create verification_requests table
CREATE TABLE public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  doc_type text NOT NULL DEFAULT 'cpf',
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  documents text[] NOT NULL DEFAULT '{}',
  selfie_path text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can create own verification"
ON public.verification_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own verification"
ON public.verification_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all verifications"
ON public.verification_requests FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_verification_requests_updated_at
BEFORE UPDATE ON public.verification_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create private storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own verification docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own verification docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all verification docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'verification-docs' AND has_role(auth.uid(), 'admin'::app_role));
