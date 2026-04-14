
-- 1. Sincronizar profiles faltantes
INSERT INTO public.profiles (user_id, email, name, username, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'name', au.raw_user_meta_data ->> 'full_name', split_part(au.email, '@', 1)),
  split_part(au.email, '@', 1) || '_' || substr(au.id::text, 1, 4),
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 2. Sincronizar wallets faltantes
INSERT INTO public.wallets (user_id, balance, pending, total_earned)
SELECT p.user_id, 0, 0, 0
FROM public.profiles p
LEFT JOIN public.wallets w ON w.user_id = p.user_id
WHERE w.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 3. Marcar como verificados os sócios ativos
UPDATE public.profiles p
SET is_verified = true
FROM public.partners pt
WHERE lower(p.email) = lower(pt.email)
AND pt.is_active = true
AND p.is_verified = false;

-- 4. Recriar trigger robusto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.wallets (user_id, balance, pending, total_earned)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
