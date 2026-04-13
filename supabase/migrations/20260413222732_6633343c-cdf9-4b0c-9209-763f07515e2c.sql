
CREATE OR REPLACE FUNCTION public.auto_release_escrow()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rec RECORD;
  v_amount numeric;
  v_fee numeric;
  v_net numeric;
  v_wallet RECORD;
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
    v_net := round(v_amount - v_fee, 2);

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
      'transaction_id', rec.transaction_id, 'amount', v_amount, 'fee', v_fee, 'net', v_net
    ));
  END LOOP;
END;
$function$;
