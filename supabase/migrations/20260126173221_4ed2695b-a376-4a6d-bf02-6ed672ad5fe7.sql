-- Allow customers to view ebook files linked to their confirmed orders
CREATE POLICY "Users can view ebooks from their confirmed orders"
ON public.ebook_files
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.ebook_file_id = ebook_files.id
      AND orders.user_id = auth.uid()
      AND orders.status = 'confirmed'
  )
);
