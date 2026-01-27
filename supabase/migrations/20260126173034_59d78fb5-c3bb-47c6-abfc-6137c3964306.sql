-- Add user_id to orders so authenticated customers can track their own orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id UUID;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- Ensure customers can view their own orders only
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

-- Tighten public insert policy to prevent setting user_id to someone else
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders"
ON public.orders
FOR INSERT
WITH CHECK (
  (name IS NOT NULL) AND (name <> ''::text)
  AND (mobile IS NOT NULL) AND (mobile <> ''::text)
  AND (sender_bkash IS NOT NULL) AND (sender_bkash <> ''::text)
  AND (status = 'pending'::text)
  AND (
    user_id IS NULL
    OR user_id = auth.uid()
  )
);
