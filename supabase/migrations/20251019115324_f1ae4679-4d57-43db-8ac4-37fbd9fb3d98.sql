-- Add audit logging table for balance changes
CREATE TABLE IF NOT EXISTS public.balance_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token_symbol text NOT NULL,
  amount_change numeric NOT NULL,
  balance_before numeric NOT NULL,
  balance_after numeric NOT NULL,
  operation_type text NOT NULL,
  trade_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.balance_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow viewing own audit logs
CREATE POLICY "Users can view own audit logs"
ON public.balance_audit_log
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.balance_audit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Harden update_balance function with ownership verification and audit logging
CREATE OR REPLACE FUNCTION public.update_balance(
  p_user_id uuid,
  p_token_symbol text,
  p_amount numeric,
  p_trade_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id uuid;
  v_old_balance numeric;
  v_new_balance numeric;
  v_calling_user uuid;
BEGIN
  -- Get the user who is calling this function
  v_calling_user := auth.uid();
  
  -- Security check: Only allow balance updates if:
  -- 1. The calling user is updating their own balance, OR
  -- 2. The calling user is an admin, OR
  -- 3. The function is being called by the service role (for trade settlements)
  IF v_calling_user IS NOT NULL AND v_calling_user != p_user_id THEN
    IF NOT public.has_role(v_calling_user, 'admin') THEN
      RAISE EXCEPTION 'Unauthorized: Cannot modify another user''s balance';
    END IF;
  END IF;

  -- Get or create wallet for user
  SELECT id INTO v_wallet_id
  FROM wallets
  WHERE user_id = p_user_id
  LIMIT 1;

  IF v_wallet_id IS NULL THEN
    INSERT INTO wallets (user_id, chain, address, is_primary)
    VALUES (p_user_id, 'BNB Chain', 'pending', true)
    RETURNING id INTO v_wallet_id;
  END IF;

  -- Get current balance
  SELECT balance INTO v_old_balance
  FROM balances
  WHERE user_id = p_user_id
    AND wallet_id = v_wallet_id
    AND token_symbol = p_token_symbol;

  IF v_old_balance IS NULL THEN
    v_old_balance := 0;
  END IF;

  -- Calculate new balance
  v_new_balance := v_old_balance + p_amount;

  -- Prevent negative balances
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient balance: % % (attempted: % %)', 
      v_old_balance, p_token_symbol, p_amount, p_token_symbol;
  END IF;

  -- Update or insert balance
  INSERT INTO balances (user_id, wallet_id, token_symbol, balance, usd_value)
  VALUES (p_user_id, v_wallet_id, p_token_symbol, p_amount, 0)
  ON CONFLICT (user_id, wallet_id, token_symbol)
  DO UPDATE SET
    balance = balances.balance + p_amount,
    last_updated = now();

  -- Create audit log entry
  INSERT INTO balance_audit_log (
    user_id,
    token_symbol,
    amount_change,
    balance_before,
    balance_after,
    operation_type,
    trade_id,
    created_by
  ) VALUES (
    p_user_id,
    p_token_symbol,
    p_amount,
    v_old_balance,
    v_new_balance,
    CASE 
      WHEN p_trade_id IS NOT NULL THEN 'trade_settlement'
      ELSE 'manual_adjustment'
    END,
    p_trade_id,
    v_calling_user
  );

  -- Log the operation for monitoring
  RAISE NOTICE 'Balance updated: user=%, token=%, change=%, old=%, new=%',
    p_user_id, p_token_symbol, p_amount, v_old_balance, v_new_balance;
END;
$$;