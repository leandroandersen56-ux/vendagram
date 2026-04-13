
-- Trigger: auto-verify partners on profile creation
CREATE OR REPLACE FUNCTION public.auto_verify_partner_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.partners
    WHERE lower(email) = lower(NEW.email)
    AND is_active = true
  ) THEN
    NEW.is_verified := true;
  END IF;
  RETURN NEW;
END;
$$;

-- Run BEFORE insert so it modifies the row before it's saved
CREATE TRIGGER auto_verify_partner_on_profile_create
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_verify_partner_profile();

-- Also auto-verify on profile update (in case email changes or partner is added later)
CREATE TRIGGER auto_verify_partner_on_profile_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_verify_partner_profile();
