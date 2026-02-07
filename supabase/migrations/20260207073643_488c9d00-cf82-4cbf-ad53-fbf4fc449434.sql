-- Create user_contacts table (max 3 per user, enforced in app)
CREATE TABLE public.user_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  whatsapp_number text NOT NULL,
  label text NOT NULL DEFAULT 'outro', -- namorado, familia, amigo, outro
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
  ON public.user_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON public.user_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON public.user_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON public.user_contacts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_user_contacts_user ON public.user_contacts(user_id);

-- Add notify_contact_ids to commitments to store which contacts receive reminders
ALTER TABLE public.commitments ADD COLUMN IF NOT EXISTS notify_contact_ids text[] DEFAULT '{}';
