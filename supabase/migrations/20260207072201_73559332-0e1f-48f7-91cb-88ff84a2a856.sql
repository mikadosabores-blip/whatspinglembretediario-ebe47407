-- Fix the overly permissive INSERT policy - restrict to service role only
DROP POLICY "Service can insert notification logs" ON public.notification_logs;

-- The edge function uses the service_role key which bypasses RLS,
-- so we don't need an INSERT policy for regular users
