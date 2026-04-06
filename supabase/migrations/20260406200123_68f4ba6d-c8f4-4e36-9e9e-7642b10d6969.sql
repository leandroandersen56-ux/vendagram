
-- Add columns to transaction_messages for credential delivery chat
ALTER TABLE public.transaction_messages 
  ADD COLUMN IF NOT EXISTS is_system boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_sensitive_data boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Add new transaction status for credentials sent
ALTER TYPE public.transaction_status ADD VALUE IF NOT EXISTS 'credentials_sent' AFTER 'transfer_in_progress';
