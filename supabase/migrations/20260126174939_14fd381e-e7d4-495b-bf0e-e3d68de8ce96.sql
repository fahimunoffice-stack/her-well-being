-- Ensure site_content keys are unique so upsert(onConflict: 'key') works
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'site_content_key_unique'
  ) THEN
    CREATE UNIQUE INDEX site_content_key_unique ON public.site_content (key);
  END IF;
END $$;

-- Allow admins to INSERT site content (required for upsert when a key doesn't exist yet)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_content'
      AND policyname = 'Admins can insert site content'
  ) THEN
    CREATE POLICY "Admins can insert site content"
    ON public.site_content
    FOR INSERT
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- (Optional but safe) allow admins to delete site content rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_content'
      AND policyname = 'Admins can delete site content'
  ) THEN
    CREATE POLICY "Admins can delete site content"
    ON public.site_content
    FOR DELETE
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;