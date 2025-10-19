-- Add validation triggers for trades table to ensure data integrity

-- Create function to validate trade data before insertion
CREATE OR REPLACE FUNCTION public.validate_trade_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_buy_order RECORD;
  v_sell_order RECORD;
BEGIN
  -- Get the buy order (we use the order_id from NEW record)
  -- We need to find which order belongs to the buyer
  SELECT * INTO v_buy_order
  FROM orders
  WHERE id = NEW.order_id AND user_id = NEW.buyer_id
  LIMIT 1;
  
  -- If we can't find a buy order with this buyer_id, check if it's a sell order
  IF v_buy_order IS NULL THEN
    -- This means order_id might be the seller's order, so check seller
    SELECT * INTO v_sell_order
    FROM orders
    WHERE id = NEW.order_id AND user_id = NEW.seller_id
    LIMIT 1;
    
    IF v_sell_order IS NULL THEN
      RAISE EXCEPTION 'Invalid trade: order_id % does not match buyer_id % or seller_id %',
        NEW.order_id, NEW.buyer_id, NEW.seller_id;
    END IF;
  END IF;

  -- Validate price is positive
  IF NEW.price <= 0 THEN
    RAISE EXCEPTION 'Invalid trade: price must be positive (got %)', NEW.price;
  END IF;

  -- Validate quantity is positive
  IF NEW.quantity <= 0 THEN
    RAISE EXCEPTION 'Invalid trade: quantity must be positive (got %)', NEW.quantity;
  END IF;

  -- Validate total_value calculation
  IF NEW.total_value <= 0 THEN
    RAISE EXCEPTION 'Invalid trade: total_value must be positive (got %)', NEW.total_value;
  END IF;

  -- Validate fee is non-negative
  IF NEW.fee < 0 THEN
    RAISE EXCEPTION 'Invalid trade: fee cannot be negative (got %)', NEW.fee;
  END IF;

  -- Validate buyer and seller are different users
  IF NEW.buyer_id = NEW.seller_id THEN
    RAISE EXCEPTION 'Invalid trade: buyer and seller cannot be the same user';
  END IF;

  -- Log successful validation
  RAISE NOTICE 'Trade validated: buyer=%, seller=%, price=%, qty=%, total=%',
    NEW.buyer_id, NEW.seller_id, NEW.price, NEW.quantity, NEW.total_value;

  RETURN NEW;
END;
$$;

-- Create trigger that fires before INSERT on trades
DROP TRIGGER IF EXISTS validate_trade_trigger ON public.trades;
CREATE TRIGGER validate_trade_trigger
  BEFORE INSERT ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_trade_before_insert();

-- Create a trade audit log table for additional monitoring
CREATE TABLE IF NOT EXISTS public.trade_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  trading_pair_id UUID NOT NULL,
  price NUMERIC NOT NULL,
  quantity NUMERIC NOT NULL,
  total_value NUMERIC NOT NULL,
  fee NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  validation_passed BOOLEAN DEFAULT true,
  notes TEXT
);

-- Enable RLS on trade audit log
ALTER TABLE public.trade_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view trade audit logs
CREATE POLICY "Admins can view trade audit logs"
  ON public.trade_audit_log
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to log trades to audit table
CREATE OR REPLACE FUNCTION public.log_trade_to_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.trade_audit_log (
    trade_id,
    buyer_id,
    seller_id,
    trading_pair_id,
    price,
    quantity,
    total_value,
    fee,
    created_by,
    notes
  ) VALUES (
    NEW.id,
    NEW.buyer_id,
    NEW.seller_id,
    NEW.trading_pair_id,
    NEW.price,
    NEW.quantity,
    NEW.total_value,
    NEW.fee,
    NULL, -- Service role creates trades
    'Trade created via edge function'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to log all trades
DROP TRIGGER IF EXISTS log_trade_audit_trigger ON public.trades;
CREATE TRIGGER log_trade_audit_trigger
  AFTER INSERT ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.log_trade_to_audit();