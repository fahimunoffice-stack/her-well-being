-- Fix RLS warning: Replace overly permissive WITH CHECK (true) with explicit validation
-- Public order submission should validate that required fields are non-empty
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

CREATE POLICY "Anyone can insert orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND name != '' AND
    mobile IS NOT NULL AND mobile != '' AND
    sender_bkash IS NOT NULL AND sender_bkash != '' AND
    status = 'pending'
  );