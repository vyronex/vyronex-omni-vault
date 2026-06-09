CREATE TABLE public.swap_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('dex','custodial')),
  chain_id INTEGER,
  chain_name TEXT,
  from_symbol TEXT NOT NULL,
  to_symbol TEXT NOT NULL,
  from_address TEXT,
  to_address TEXT,
  amount_in NUMERIC NOT NULL,
  amount_out NUMERIC NOT NULL,
  rate NUMERIC,
  fee_amount NUMERIC,
  fee_symbol TEXT,
  slippage NUMERIC,
  price_impact NUMERIC,
  route TEXT,
  tx_hash TEXT,
  signer_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','failed','settled')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.swap_history TO authenticated;
GRANT ALL ON public.swap_history TO service_role;

ALTER TABLE public.swap_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own swap history"
  ON public.swap_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own swap history"
  ON public.swap_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own pending swaps"
  ON public.swap_history FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_swap_history_updated_at
  BEFORE UPDATE ON public.swap_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX swap_history_user_created_idx ON public.swap_history(user_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.swap_history;