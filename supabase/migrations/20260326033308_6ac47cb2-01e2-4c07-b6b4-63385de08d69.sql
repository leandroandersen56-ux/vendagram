
-- Deposit requests table
CREATE TABLE public.deposit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  pix_key text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes')
);

ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deposits" ON public.deposit_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create deposits" ON public.deposit_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage deposits" ON public.deposit_requests FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Internal transfers table
CREATE TABLE public.internal_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.internal_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transfers" ON public.internal_transfers FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can create transfers" ON public.internal_transfers FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Admins can manage transfers" ON public.internal_transfers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Transaction messages table
CREATE TABLE public.transaction_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transaction_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transaction participants can view messages" ON public.transaction_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_messages.transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())));
CREATE POLICY "Transaction participants can send messages" ON public.transaction_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_messages.transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())));
CREATE POLICY "Admins can manage messages" ON public.transaction_messages FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add new columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allow_transfers_from_strangers boolean DEFAULT true;

-- Enable realtime on new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposit_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.internal_transfers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transaction_messages;
