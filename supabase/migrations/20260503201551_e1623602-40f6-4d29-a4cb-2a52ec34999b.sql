-- Vault strategies table (admin-seeded)
CREATE TABLE public.vault_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  token_symbol TEXT NOT NULL DEFAULT 'VNX',
  apr_percent NUMERIC NOT NULL DEFAULT 0,
  min_lock_days INTEGER NOT NULL DEFAULT 7,
  max_lock_days INTEGER NOT NULL DEFAULT 365,
  penalty_percent NUMERIC NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active strategies"
  ON public.vault_strategies FOR SELECT
  USING (is_active = true);

-- Vault deposits table
CREATE TABLE public.vault_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  strategy_id UUID NOT NULL REFERENCES public.vault_strategies(id),
  amount NUMERIC NOT NULL DEFAULT 0,
  token_symbol TEXT NOT NULL DEFAULT 'VNX',
  locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unlock_at TIMESTAMPTZ NOT NULL,
  withdrawn_at TIMESTAMPTZ,
  earned_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matured', 'withdrawn', 'early_withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deposits"
  ON public.vault_deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deposits"
  ON public.vault_deposits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deposits"
  ON public.vault_deposits FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_vault_deposit_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_vault_deposits_updated_at
  BEFORE UPDATE ON public.vault_deposits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vault_deposit_timestamp();

-- Enable realtime for vault deposits
ALTER PUBLICATION supabase_realtime ADD TABLE public.vault_deposits;

-- Seed default strategies
INSERT INTO public.vault_strategies (name, description, token_symbol, apr_percent, min_lock_days, max_lock_days, penalty_percent) VALUES
  ('Stable Vault', 'Low-risk vault with stable returns. Ideal for conservative holders.', 'VNX', 5.0, 30, 365, 5),
  ('Growth Vault', 'Medium-risk vault with competitive APR. Balanced risk-reward.', 'VNX', 12.0, 60, 365, 10),
  ('High-Yield Vault', 'High-risk vault with maximum returns. For experienced users.', 'VNX', 24.0, 90, 365, 15),
  ('Stable Vault', 'Low-risk USDT vault with predictable earnings.', 'USDT', 4.0, 30, 180, 5),
  ('Growth Vault', 'Medium-risk ETH vault for long-term growth.', 'ETH', 8.0, 60, 365, 10),
  ('Stable Vault', 'Low-risk BNB vault with steady yield.', 'BNB', 6.0, 30, 180, 5);