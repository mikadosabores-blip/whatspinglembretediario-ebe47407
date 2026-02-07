
-- Create the update function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Commitments table
CREATE TABLE public.commitments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  commitment_date DATE NOT NULL,
  commitment_time TIME NOT NULL,
  location TEXT DEFAULT '',
  provider_name TEXT DEFAULT '',
  remind_days_before INTEGER DEFAULT 1,
  remind_hours_before INTEGER DEFAULT 2,
  remind_minutes_before INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending',
  notified_days BOOLEAN NOT NULL DEFAULT false,
  notified_hours BOOLEAN NOT NULL DEFAULT false,
  notified_minutes BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own commitments" ON public.commitments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own commitments" ON public.commitments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own commitments" ON public.commitments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own commitments" ON public.commitments FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_commitments_updated_at
  BEFORE UPDATE ON public.commitments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
