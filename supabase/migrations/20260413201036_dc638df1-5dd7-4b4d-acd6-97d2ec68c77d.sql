
-- Tabela de sócios autorizados
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  pix_key TEXT,
  pix_key_type TEXT,
  profit_percent DECIMAL(5,2) DEFAULT 5.00,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de saques dos sócios
CREATE TABLE IF NOT EXISTS public.partner_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  pix_key TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  approved_by UUID,
  notes TEXT
);

-- Trigger para validar status de saque
CREATE OR REPLACE FUNCTION public.validate_partner_withdrawal_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('pending','approved','processing','completed','rejected') THEN
    RAISE EXCEPTION 'Invalid partner withdrawal status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_partner_withdrawal_status_trigger
  BEFORE INSERT OR UPDATE ON public.partner_withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_partner_withdrawal_status();

-- Trigger para validar pix_key_type
CREATE OR REPLACE FUNCTION public.validate_partner_pix_key_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.pix_key_type IS NOT NULL AND NEW.pix_key_type NOT IN ('cpf','cnpj','email','telefone','aleatoria') THEN
    RAISE EXCEPTION 'Invalid pix_key_type: %', NEW.pix_key_type;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_partner_pix_key_type_trigger
  BEFORE INSERT OR UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_partner_pix_key_type();

-- RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_withdrawals ENABLE ROW LEVEL SECURITY;

-- Helper function to get partner by auth email
CREATE OR REPLACE FUNCTION public.get_partner_id_by_auth()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id FROM public.partners p
  JOIN auth.users u ON u.email = p.email
  WHERE u.id = auth.uid() AND p.is_active = true
  LIMIT 1
$$;

-- Partners policies
CREATE POLICY "partner_sees_own" ON public.partners
  FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "admin_partners_full" ON public.partners
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Partner withdrawals policies
CREATE POLICY "partner_sees_own_withdrawals" ON public.partner_withdrawals
  FOR SELECT TO authenticated
  USING (partner_id = public.get_partner_id_by_auth());

CREATE POLICY "partner_creates_withdrawal" ON public.partner_withdrawals
  FOR INSERT TO authenticated
  WITH CHECK (partner_id = public.get_partner_id_by_auth());

CREATE POLICY "admin_withdrawals_full" ON public.partner_withdrawals
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
