-- Enable realtime for orders and trades tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;

-- Create function to update user balances
CREATE OR REPLACE FUNCTION public.update_balance(
  p_user_id uuid,
  p_token_symbol text,
  p_amount numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id uuid;
BEGIN
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

  -- Update or insert balance
  INSERT INTO balances (user_id, wallet_id, token_symbol, balance, usd_value)
  VALUES (p_user_id, v_wallet_id, p_token_symbol, p_amount, 0)
  ON CONFLICT (user_id, wallet_id, token_symbol)
  DO UPDATE SET
    balance = balances.balance + p_amount,
    last_updated = now();
END;
$$;

-- Add index for faster order matching
CREATE INDEX IF NOT EXISTS idx_orders_matching 
ON orders(trading_pair_id, side, status, price, created_at)
WHERE status = 'open' AND remaining_quantity > 0;

-- Add index for orderbook queries
CREATE INDEX IF NOT EXISTS idx_orders_user_status 
ON orders(user_id, status, created_at DESC);

-- Add index for trades
CREATE INDEX IF NOT EXISTS idx_trades_pair_time 
ON trades(trading_pair_id, created_at DESC);

-- Add unique constraint for balances (drop first if exists)
DO $$ 
BEGIN
  ALTER TABLE balances 
  ADD CONSTRAINT balances_user_wallet_token_unique 
  UNIQUE (user_id, wallet_id, token_symbol);
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;