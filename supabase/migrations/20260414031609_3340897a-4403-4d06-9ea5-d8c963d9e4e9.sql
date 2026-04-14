
-- Attach the auto_verify_partner_profile trigger to profiles table
CREATE TRIGGER trg_auto_verify_partner_profile
  BEFORE INSERT OR UPDATE OF email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_verify_partner_profile();

-- Also retroactively verify existing partner profiles
UPDATE public.profiles
SET is_verified = true
WHERE lower(email) IN (
  SELECT lower(email) FROM public.partners WHERE is_active = true
)
AND is_verified = false;
