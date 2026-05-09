-- Enable realtime for tables used by wallet push notifications
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.staking_records REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.staking_records;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;