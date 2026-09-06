CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referral_codes TO authenticated;
GRANT ALL ON public.referral_codes TO service_role;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own referral code" ON public.referral_codes FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.referral_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  joined_at timestamptz NOT NULL DEFAULT now(),
  total_commission numeric NOT NULL DEFAULT 0
);
GRANT SELECT ON public.referral_relationships TO authenticated;
GRANT ALL ON public.referral_relationships TO service_role;
ALTER TABLE public.referral_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their referral relationships" ON public.referral_relationships FOR SELECT TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE TABLE public.referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid,
  amount numeric NOT NULL,
  token_symbol text NOT NULL DEFAULT 'USDT',
  event_type text NOT NULL DEFAULT 'commission',
  status text NOT NULL DEFAULT 'credited',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referral_rewards TO authenticated;
GRANT ALL ON public.referral_rewards TO service_role;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their referral rewards" ON public.referral_rewards FOR SELECT TO authenticated USING (auth.uid() = referrer_id);

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
BEGIN
  LOOP
    v_code := 'VNX-' || upper(encode(gen_random_bytes(4), 'hex'));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.referral_codes WHERE code = v_code);
  END LOOP;
  RETURN v_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_referrer_id uuid;
  v_requested_code text;
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  v_code := public.generate_referral_code();
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.id, v_code);

  v_requested_code := upper(trim(COALESCE(NEW.raw_user_meta_data ->> 'referral_code', '')));
  IF v_requested_code <> '' THEN
    SELECT user_id INTO v_referrer_id
    FROM public.referral_codes
    WHERE code = v_requested_code
      AND user_id <> NEW.id;

    IF v_referrer_id IS NOT NULL THEN
      INSERT INTO public.referral_relationships (referrer_id, referred_user_id, referral_code)
      VALUES (v_referrer_id, NEW.id, v_requested_code)
      ON CONFLICT (referred_user_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_referral_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;