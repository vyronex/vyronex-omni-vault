
-- ============ withdrawal_requests ============
CREATE TABLE public.withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token_symbol text NOT NULL,
  chain text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  fee numeric NOT NULL DEFAULT 0 CHECK (fee >= 0),
  net_amount numeric NOT NULL CHECK (net_amount > 0),
  to_address text NOT NULL,
  status text NOT NULL DEFAULT 'pending_confirmation',
  tx_hash text,
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  broadcast_at timestamptz,
  completed_at timestamptz,
  failure_reason text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.withdrawal_requests TO authenticated;
GRANT ALL ON public.withdrawal_requests TO service_role;

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own withdrawals"
  ON public.withdrawal_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "users create own withdrawals"
  ON public.withdrawal_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users cancel own pending"
  ON public.withdrawal_requests FOR UPDATE TO authenticated
  USING (
    (auth.uid() = user_id AND status IN ('pending_confirmation','pending_review'))
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    (auth.uid() = user_id AND status IN ('pending_confirmation','pending_review','cancelled'))
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE INDEX idx_wr_user ON public.withdrawal_requests(user_id, created_at DESC);
CREATE INDEX idx_wr_status ON public.withdrawal_requests(status, created_at DESC);

CREATE TRIGGER trg_wr_updated
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ withdrawal_limits ============
CREATE TABLE public.withdrawal_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_symbol text NOT NULL,
  chain text NOT NULL,
  min_amount numeric NOT NULL DEFAULT 0,
  network_fee numeric NOT NULL DEFAULT 0,
  daily_limit numeric NOT NULL DEFAULT 100000,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(token_symbol, chain)
);

GRANT SELECT ON public.withdrawal_limits TO authenticated, anon;
GRANT ALL ON public.withdrawal_limits TO service_role;

ALTER TABLE public.withdrawal_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone reads limits"
  ON public.withdrawal_limits FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "admin manages limits"
  ON public.withdrawal_limits FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_wl_updated
  BEFORE UPDATE ON public.withdrawal_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.withdrawal_limits (token_symbol, chain, min_amount, network_fee, daily_limit) VALUES
  ('VNX','BNB Chain', 10, 1, 500000),
  ('BNB','BNB Chain', 0.01, 0.0008, 100),
  ('ETH','Ethereum', 0.005, 0.002, 50),
  ('USDT','BNB Chain', 5, 1, 50000),
  ('USDT','Ethereum', 20, 8, 50000),
  ('USDT','Tron', 5, 1, 50000),
  ('USDC','BNB Chain', 5, 1, 50000),
  ('USDC','Ethereum', 20, 8, 50000),
  ('BTC','Bitcoin', 0.0005, 0.00015, 5),
  ('SOL','Solana', 0.05, 0.005, 500),
  ('TRX','Tron', 10, 1, 100000),
  ('FTM','Fantom', 1, 0.5, 100000);

-- ============ withdrawal_confirmations ============
CREATE TABLE public.withdrawal_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.withdrawal_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.withdrawal_confirmations TO authenticated;
GRANT ALL ON public.withdrawal_confirmations TO service_role;

ALTER TABLE public.withdrawal_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own confirmations"
  ON public.withdrawal_confirmations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_wc_request ON public.withdrawal_confirmations(request_id);
