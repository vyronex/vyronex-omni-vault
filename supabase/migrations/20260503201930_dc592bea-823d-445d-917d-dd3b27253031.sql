ALTER TABLE public.vault_strategies
  ADD COLUMN vnx_bonus_apr NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN tvl NUMERIC NOT NULL DEFAULT 0;

ALTER TABLE public.vault_deposits
  ADD COLUMN vnx_reward NUMERIC NOT NULL DEFAULT 0;

UPDATE public.vault_strategies SET vnx_bonus_apr = 2.0, tvl = 125000 WHERE name = 'Stable Vault' AND token_symbol = 'VNX';
UPDATE public.vault_strategies SET vnx_bonus_apr = 4.0, tvl = 340000 WHERE name = 'Growth Vault' AND token_symbol = 'VNX';
UPDATE public.vault_strategies SET vnx_bonus_apr = 6.0, tvl = 89000 WHERE name = 'High-Yield Vault' AND token_symbol = 'VNX';
UPDATE public.vault_strategies SET vnx_bonus_apr = 1.5, tvl = 500000 WHERE name = 'Stable Vault' AND token_symbol = 'USDT';
UPDATE public.vault_strategies SET vnx_bonus_apr = 3.0, tvl = 210000 WHERE name = 'Growth Vault' AND token_symbol = 'ETH';
UPDATE public.vault_strategies SET vnx_bonus_apr = 2.0, tvl = 175000 WHERE name = 'Stable Vault' AND token_symbol = 'BNB';