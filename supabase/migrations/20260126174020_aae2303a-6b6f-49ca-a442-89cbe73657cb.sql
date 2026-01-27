-- Create public media bucket for videos, images, posters
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to media bucket
CREATE POLICY "Anyone can view media files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'media');

-- Admin can upload/update/delete media
CREATE POLICY "Admins can upload media"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'media'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update media"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'media'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'media'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete media"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'media'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
