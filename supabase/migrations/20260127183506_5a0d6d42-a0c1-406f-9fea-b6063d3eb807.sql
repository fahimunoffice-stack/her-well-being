DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'orders'
      AND policyname = 'Users can view their own orders'
  ) THEN
    CREATE POLICY "Users can view their own orders"
    ON public.orders
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;
