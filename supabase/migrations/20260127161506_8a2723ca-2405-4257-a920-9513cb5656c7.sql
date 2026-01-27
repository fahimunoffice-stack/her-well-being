-- Admin audit/event store
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_user_id UUID NOT NULL,
  actor_email TEXT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NULL,
  entity_id UUID NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor_user_id ON public.admin_audit_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs (action);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='admin_audit_logs' AND policyname='Admins can view audit logs'
  ) THEN
    CREATE POLICY "Admins can view audit logs"
    ON public.admin_audit_logs
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='admin_audit_logs' AND policyname='Admins can insert audit logs'
  ) THEN
    CREATE POLICY "Admins can insert audit logs"
    ON public.admin_audit_logs
    FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) AND actor_user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='admin_audit_logs' AND policyname='Admins can delete audit logs'
  ) THEN
    CREATE POLICY "Admins can delete audit logs"
    ON public.admin_audit_logs
    FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;
