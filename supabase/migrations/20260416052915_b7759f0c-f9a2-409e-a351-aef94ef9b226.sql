
-- 1. Ambassadors table
CREATE TABLE public.ambassadors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  code text NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ambassadors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own ambassador" ON public.ambassadors FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins manage ambassadors" ON public.ambassadors FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can read active ambassadors" ON public.ambassadors FOR SELECT
  USING (is_active = true);
CREATE POLICY "Authenticated can activate themselves" ON public.ambassadors FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Ambassador referrals (lifetime link between ambassador and referred seller)
CREATE TABLE public.ambassador_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES public.ambassadors(id) ON DELETE CASCADE,
  referred_seller_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ambassador_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassador sees own referrals" ON public.ambassador_referrals FOR SELECT TO authenticated
  USING (ambassador_id IN (SELECT id FROM public.ambassadors WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage referrals" ON public.ambassador_referrals FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Ambassador commissions (one per transaction)
CREATE TABLE public.ambassador_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES public.ambassadors(id) ON DELETE CASCADE,
  transaction_id uuid NOT NULL REFERENCES public.transactions(id),
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ambassador_id, transaction_id)
);

ALTER TABLE public.ambassador_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassador sees own commissions" ON public.ambassador_commissions FOR SELECT TO authenticated
  USING (ambassador_id IN (SELECT id FROM public.ambassadors WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage commissions" ON public.ambassador_commissions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Trigger: auto-link referred seller to ambassador on profile creation
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
  -- Get ambassador code from user metadata
  SELECT raw_user_meta_data ->> 'ambassador_code' INTO v_amb_code
  FROM auth.users WHERE id = NEW.user_id;

  IF v_amb_code IS NOT NULL AND v_amb_code <> '' THEN
    SELECT id INTO v_amb_id FROM public.ambassadors WHERE code = v_amb_code AND is_active = true;
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

CREATE TRIGGER on_profile_created_link_ambassador
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.link_ambassador_referral();

-- 5. Update auto_release_escrow to pay 3% to ambassador
CREATE OR REPLACE FUNCTION public.auto_release_escrow()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  v_amount numeric;
  v_fee numeric;
  v_amb_commission numeric;
  v_net numeric;
  v_wallet RECORD;
  v_amb RECORD;
BEGIN
  FOR rec IN
    SELECT t.id AS transaction_id, t.amount, t.seller_id, t.buyer_id, t.listing_id, c.delivered_at
    FROM transactions t
    JOIN credentials c ON c.transaction_id = t.id
    WHERE t.status = 'transfer_in_progress'
      AND c.delivered_at IS NOT NULL
      AND c.delivered_at < (now() - interval '24 hours')
      AND NOT EXISTS (
        SELECT 1 FROM disputes d WHERE d.transaction_id = t.id AND d.status IN ('open', 'under_review')
      )
  LOOP
    v_amount := rec.amount;
    v_fee := round(v_amount * 0.10, 2);
    v_amb_commission := 0;

    -- Check if seller was referred by an ambassador
    SELECT a.id AS ambassador_id, a.user_id AS ambassador_user_id
    INTO v_amb
    FROM ambassador_referrals ar
    JOIN ambassadors a ON a.id = ar.ambassador_id AND a.is_active = true
    WHERE ar.referred_seller_id = rec.seller_id;

    IF v_amb IS NOT NULL THEN
      v_amb_commission := round(v_amount * 0.03, 2);
      -- Ambassador commission comes from platform fee
      v_fee := v_fee - v_amb_commission;

      -- Credit ambassador wallet
      PERFORM increment_wallet(v_amb.ambassador_user_id, 'balance', v_amb_commission);
      PERFORM increment_wallet(v_amb.ambassador_user_id, 'total_earned', v_amb_commission);

      -- Record commission
      INSERT INTO ambassador_commissions (ambassador_id, transaction_id, amount)
      VALUES (v_amb.ambassador_id, rec.transaction_id, v_amb_commission)
      ON CONFLICT DO NOTHING;

      -- Notify ambassador
      INSERT INTO notifications (user_id, title, body, link)
      VALUES (v_amb.ambassador_user_id,
              '💰 Comissão de embaixador!',
              'R$ ' || v_amb_commission::text || ' creditado pela venda do seu indicado.',
              '/embaixador');
    END IF;

    v_net := round(v_amount - v_fee - v_amb_commission, 2);

    SELECT * INTO v_wallet FROM wallets WHERE user_id = rec.seller_id;
    IF v_wallet IS NULL THEN CONTINUE; END IF;

    UPDATE wallets SET
      balance = balance + v_net,
      pending = GREATEST(0, pending - v_amount),
      total_earned = total_earned + v_net,
      updated_at = now()
    WHERE user_id = rec.seller_id;

    UPDATE transactions SET
      status = 'completed',
      completed_at = now(),
      platform_fee = v_fee,
      seller_receives = v_net,
      updated_at = now()
    WHERE id = rec.transaction_id;

    UPDATE listings SET status = 'sold', updated_at = now() WHERE id = rec.listing_id;

    INSERT INTO notifications (user_id, title, body, link)
    VALUES (rec.seller_id, '💰 Pagamento liberado automaticamente!',
            'R$ ' || v_net::text || ' foi creditado em sua carteira após 24h sem contestação.',
            '/carteira');

    INSERT INTO notifications (user_id, title, body, link)
    VALUES (rec.buyer_id, '✅ Compra finalizada automaticamente',
            'O prazo de 24h expirou. A transação foi concluída automaticamente.',
            '/compras/' || rec.transaction_id);

    INSERT INTO audit_logs (user_id, action, details)
    VALUES (rec.seller_id, 'escrow_auto_released', jsonb_build_object(
      'transaction_id', rec.transaction_id, 'amount', v_amount, 'fee', v_fee, 'net', v_net,
      'ambassador_commission', v_amb_commission
    ));
  END LOOP;
END;
$$;
