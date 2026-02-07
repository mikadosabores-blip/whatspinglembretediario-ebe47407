-- Create notification_logs table to track sent messages
CREATE TABLE public.notification_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  commitment_id uuid REFERENCES public.commitments(id) ON DELETE SET NULL,
  reminder_type text NOT NULL, -- 'days', 'hours', 'minutes', 'ontime'
  phone_number text NOT NULL,
  message_preview text,
  status text NOT NULL DEFAULT 'sent', -- 'sent', 'failed'
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view own notification logs"
  ON public.notification_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role inserts (from edge function), no user insert policy needed
-- But add one for completeness
CREATE POLICY "Service can insert notification logs"
  ON public.notification_logs FOR INSERT
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_notification_logs_user ON public.notification_logs(user_id, created_at DESC);
CREATE INDEX idx_notification_logs_commitment ON public.notification_logs(commitment_id);
