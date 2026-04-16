
-- Update link trigger to also check profiles.referral_code
CREATE OR REPLACE FUNCTION public.link_ambassador_referral()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_amb_code text;
  v_amb_id uuid;
BEGIN
  SELECT raw_user_meta_data ->> 'ambassador_code' INTO v_amb_code
  FROM auth.users WHERE id = NEW.user_id;

  IF v_amb_code IS NOT NULL AND v_amb_code <> '' THEN
    -- Try direct ambassador code first
    SELECT id INTO v_amb_id FROM public.ambassadors WHERE code = v_amb_code AND is_active = true;
    
    -- Fallback: check if code matches a profile's referral_code linked to an ambassador
    IF v_amb_id IS NULL THEN
      SELECT a.id INTO v_amb_id
      FROM public.ambassadors a
      JOIN public.profiles p ON p.user_id = a.user_id
      WHERE p.referral_code = v_amb_code AND a.is_active = true;
    END IF;

    IF v_amb_id IS NOT NULL THEN
      INSERT INTO public.ambassador_referrals (ambassador_id, referred_seller_id)
      VALUES (v_amb_id, NEW.user_id)
      ON CONFLICT (referred_seller_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

-- Auto-create ambassador for partners on profile creation
CREATE OR REPLACE FUNCTION public.auto_create_ambassador_for_partner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ref_code text;
BEGIN
  -- Check if user is an active partner
  IF EXISTS (
    SELECT 1 FROM public.partners
    WHERE lower(email) = lower(NEW.email) AND is_active = true
  ) THEN
    -- Use profile's referral_code as ambassador code
    v_ref_code := COALESCE(NEW.referral_code, substr(md5(random()::text), 1, 8));
    
    INSERT INTO public.ambassadors (user_id, code, is_active)
    VALUES (NEW.user_id, v_ref_code, true)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_auto_ambassador
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_ambassador_for_partner();
