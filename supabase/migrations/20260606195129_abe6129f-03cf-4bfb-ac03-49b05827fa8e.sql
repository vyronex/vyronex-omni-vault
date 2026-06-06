CREATE TYPE public.listing_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.token_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  token_name TEXT NOT NULL,
  chain TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  decimals INTEGER NOT NULL DEFAULT 18,
  total_supply NUMERIC,
  website TEXT,
  whitepaper TEXT,
  telegram TEXT,
  twitter TEXT,
  github TEXT,
  description TEXT,
  logo_url TEXT,
  status public.listing_status NOT NULL DEFAULT 'pending',
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_token_listings_status ON public.token_listings(status);
CREATE INDEX idx_token_listings_submitted_by ON public.token_listings(submitted_by);
CREATE INDEX idx_token_listings_chain ON public.token_listings(chain);

GRANT SELECT ON public.token_listings TO anon;
GRANT SELECT, INSERT ON public.token_listings TO authenticated;
GRANT ALL ON public.token_listings TO service_role;

ALTER TABLE public.token_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved listings (public directory)
CREATE POLICY "Anyone can view approved listings"
  ON public.token_listings
  FOR SELECT
  USING (status = 'approved');

-- Users can view their own submissions regardless of status
CREATE POLICY "Users can view their own submissions"
  ON public.token_listings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = submitted_by);

-- Admins can view all
CREATE POLICY "Admins can view all listings"
  ON public.token_listings
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can submit a listing on their own behalf
CREATE POLICY "Authenticated users can submit listings"
  ON public.token_listings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by AND status = 'pending');

-- Admins can update (review) listings
CREATE POLICY "Admins can update listings"
  ON public.token_listings
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete listings
CREATE POLICY "Admins can delete listings"
  ON public.token_listings
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_token_listings_updated_at
  BEFORE UPDATE ON public.token_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();