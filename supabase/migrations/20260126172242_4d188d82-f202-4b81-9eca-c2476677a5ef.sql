-- Ebook files table
CREATE TABLE IF NOT EXISTS public.ebook_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ebook_files ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can view ebook files"
ON public.ebook_files
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert ebook files"
ON public.ebook_files
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update ebook files"
ON public.ebook_files
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete ebook files"
ON public.ebook_files
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- updated_at trigger
DROP TRIGGER IF EXISTS update_ebook_files_updated_at ON public.ebook_files;
CREATE TRIGGER update_ebook_files_updated_at
BEFORE UPDATE ON public.ebook_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Orders: ebook + confirmed timestamp
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS ebook_file_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_ebook_file_id_fkey'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_ebook_file_id_fkey
      FOREIGN KEY (ebook_file_id)
      REFERENCES public.ebook_files(id)
      ON DELETE SET NULL;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_mobile ON public.orders(mobile);

-- Storage bucket for ebooks (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebooks', 'ebooks', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: admin-only access to ebook objects
CREATE POLICY "Admins can view ebook objects"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'ebooks'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can upload ebook objects"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'ebooks'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update ebook objects"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'ebooks'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'ebooks'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete ebook objects"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'ebooks'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
