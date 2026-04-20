-- 1. Unique wallet per (user, chain)
CREATE UNIQUE INDEX IF NOT EXISTS wallets_user_chain_unique
  ON public.wallets (user_id, chain);

-- 2. Unique balance per (user, wallet, token) — required by update_balance ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS balances_user_wallet_token_unique
  ON public.balances (user_id, wallet_id, token_symbol);

-- 3. Seed all 6 chain wallets for a new user
CREATE OR REPLACE FUNCTION public.seed_user_wallets()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chains text[] := ARRAY['BNB Chain','Ethereum','Fantom','Bitcoin','Solana','Tron'];
  v_chain text;
  v_is_first boolean := true;
BEGIN
  FOREACH v_chain IN ARRAY v_chains LOOP
    INSERT INTO public.wallets (user_id, chain, address, is_primary)
    VALUES (NEW.id, v_chain, 'pending-' || lower(replace(v_chain,' ','-')), v_is_first)
    ON CONFLICT (user_id, chain) DO NOTHING;
    v_is_first := false;
  END LOOP;
  RETURN NEW;
END;
$$;

-- 4. Trigger on new profile creation (handle_new_user already inserts a profile)
DROP TRIGGER IF EXISTS on_profile_created_seed_wallets ON public.profiles;
CREATE TRIGGER on_profile_created_seed_wallets
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.seed_user_wallets();

-- 5. Backfill existing users with any missing chain wallets
DO $$
DECLARE
  v_user record;
  v_chain text;
  v_chains text[] := ARRAY['BNB Chain','Ethereum','Fantom','Bitcoin','Solana','Tron'];
BEGIN
  FOR v_user IN SELECT id FROM public.profiles LOOP
    FOREACH v_chain IN ARRAY v_chains LOOP
      INSERT INTO public.wallets (user_id, chain, address, is_primary)
      VALUES (
        v_user.id,
        v_chain,
        'pending-' || lower(replace(v_chain,' ','-')),
        v_chain = 'BNB Chain'
      )
      ON CONFLICT (user_id, chain) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;