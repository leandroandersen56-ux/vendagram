
-- Enable pg_net extension for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function that calls notify-whatsapp edge function on notification insert
CREATE OR REPLACE FUNCTION public.trigger_whatsapp_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _supabase_url text;
  _service_key text;
BEGIN
  -- Get Supabase URL and service key from vault or config
  SELECT decrypted_secret INTO _supabase_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
  SELECT decrypted_secret INTO _service_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;

  -- Fallback: use current_setting if vault not available
  IF _supabase_url IS NULL THEN
    _supabase_url := current_setting('app.settings.supabase_url', true);
  END IF;
  IF _service_key IS NULL THEN
    _service_key := current_setting('app.settings.service_role_key', true);
  END IF;

  -- If we still don't have credentials, skip silently
  IF _supabase_url IS NULL OR _service_key IS NULL THEN
    RAISE LOG 'WhatsApp trigger: missing supabase credentials, skipping';
    RETURN NEW;
  END IF;

  -- Call notify-whatsapp edge function asynchronously
  PERFORM extensions.http_post(
    url := _supabase_url || '/functions/v1/notify-whatsapp',
    body := jsonb_build_object('notification_id', NEW.id)::text,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || _service_key
    )::text
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block notification insert if WhatsApp fails
  RAISE LOG 'WhatsApp trigger error: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_notification_send_whatsapp ON public.notifications;
CREATE TRIGGER on_notification_send_whatsapp
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_whatsapp_on_notification();
