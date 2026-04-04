
-- Add offers columns to listings
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS accepts_offers BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS min_price NUMERIC;

-- Create offers table
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  original_price NUMERIC(10,2) NOT NULL,
  offered_price NUMERIC(10,2) NOT NULL,
  counter_price NUMERIC(10,2),
  final_price NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'pending',
  buyer_message TEXT,
  seller_message TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT buyer_not_seller CHECK (buyer_id != seller_id),
  CONSTRAINT offered_positive CHECK (offered_price > 0),
  CONSTRAINT offered_less_than_original CHECK (offered_price < original_price),
  CONSTRAINT counter_less_than_original CHECK (counter_price IS NULL OR counter_price < original_price)
);

-- Indexes
CREATE INDEX offers_listing_id_idx ON public.offers(listing_id);
CREATE INDEX offers_buyer_id_idx ON public.offers(buyer_id);
CREATE INDEX offers_seller_id_idx ON public.offers(seller_id);
CREATE INDEX offers_status_idx ON public.offers(status);

-- Validation trigger for status values (instead of CHECK for extensibility)
CREATE OR REPLACE FUNCTION public.validate_offer_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('pending','accepted','rejected','countered','expired','cancelled','paid') THEN
    RAISE EXCEPTION 'Invalid offer status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_offer_status_trigger
BEFORE INSERT OR UPDATE ON public.offers
FOR EACH ROW EXECUTE FUNCTION public.validate_offer_status();

-- RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins can manage all offers"
ON public.offers FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Buyer sees own offers
CREATE POLICY "Buyer sees own offers"
ON public.offers FOR SELECT
USING (buyer_id = auth.uid());

-- Seller sees offers on their listings
CREATE POLICY "Seller sees offers on their listings"
ON public.offers FOR SELECT
USING (seller_id = auth.uid());

-- Buyer creates offers
CREATE POLICY "Buyer creates offers"
ON public.offers FOR INSERT
WITH CHECK (buyer_id = auth.uid() AND offered_price > 0);

-- Seller responds to pending offers (accept/reject/counter)
CREATE POLICY "Seller responds to pending offers"
ON public.offers FOR UPDATE
USING (seller_id = auth.uid() AND status IN ('pending'))
WITH CHECK (status IN ('accepted','rejected','countered'));

-- Buyer cancels pending offers
CREATE POLICY "Buyer cancels pending offers"
ON public.offers FOR UPDATE
USING (buyer_id = auth.uid() AND status = 'pending')
WITH CHECK (status = 'cancelled');

-- Buyer responds to countered offers
CREATE POLICY "Buyer responds to counter offers"
ON public.offers FOR UPDATE
USING (buyer_id = auth.uid() AND status = 'countered')
WITH CHECK (status IN ('accepted','rejected'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;
