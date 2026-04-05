-- Atomic wallet increment function
CREATE OR REPLACE FUNCTION public.increment_wallet(user_uuid UUID, field TEXT, amount DECIMAL)
RETURNS void AS $$
BEGIN
  IF field = 'pending' THEN
    UPDATE wallets SET pending = pending + amount, updated_at = now() WHERE user_id = user_uuid;
  ELSIF field = 'balance' THEN
    UPDATE wallets SET balance = balance + amount, updated_at = now() WHERE user_id = user_uuid;
  ELSIF field = 'total_earned' THEN
    UPDATE wallets SET total_earned = total_earned + amount, updated_at = now() WHERE user_id = user_uuid;
  ELSE
    RAISE EXCEPTION 'Invalid field: %', field;
  END IF;
  IF NOT FOUND THEN
    INSERT INTO wallets (user_id, balance, pending, total_earned)
    VALUES (
      user_uuid,
      CASE WHEN field = 'balance' THEN amount ELSE 0 END,
      CASE WHEN field = 'pending' THEN amount ELSE 0 END,
      CASE WHEN field = 'total_earned' THEN amount ELSE 0 END
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure triggers exist for auto-creating profiles and wallets
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_admin_role();