-- Remove customer SELECT policy - only admins should view orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Ensure ONLY admin policy exists for SELECT
-- (Already exists: "Admins can view all orders")

-- Remove customer access to ebook_files as well
DROP POLICY IF EXISTS "Users can view ebooks from their confirmed orders" ON public.ebook_files;
