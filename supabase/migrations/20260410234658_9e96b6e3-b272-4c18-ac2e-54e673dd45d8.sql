
CREATE OR REPLACE FUNCTION public.trigger_whatsapp_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call notify-whatsapp edge function asynchronously via pg_net
  PERFORM net.http_post(
    url := 'https://tqfvhfrbeolnvjpcfckl.supabase.co/functions/v1/notify-whatsapp',
    body := jsonb_build_object('notification_id', NEW.id),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZnZoZnJiZW9sbnZqcGNmY2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTg2NjgsImV4cCI6MjA4OTk3NDY2OH0.4aKu1tJwn-9_TfA38ZdCt5ddEKlcBNMQSGCRmccvbS8'
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'WhatsApp trigger error: %', SQLERRM;
  RETURN NEW;
END;
$$;
