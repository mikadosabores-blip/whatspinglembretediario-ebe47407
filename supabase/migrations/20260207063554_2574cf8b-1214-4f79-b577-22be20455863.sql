
-- Pipeline stages table
CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stages" ON public.pipeline_stages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stages" ON public.pipeline_stages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stages" ON public.pipeline_stages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stages" ON public.pipeline_stages FOR DELETE USING (auth.uid() = user_id);

-- Pipeline cards table
CREATE TABLE public.pipeline_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pipeline_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards" ON public.pipeline_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cards" ON public.pipeline_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cards" ON public.pipeline_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cards" ON public.pipeline_cards FOR DELETE USING (auth.uid() = user_id);

-- Function to seed default stages for new users
CREATE OR REPLACE FUNCTION public.seed_default_pipeline_stages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.pipeline_stages (user_id, name, position) VALUES
    (NEW.id, 'Novo', 0),
    (NEW.id, 'Contato', 1),
    (NEW.id, 'Qualificado', 2),
    (NEW.id, 'Proposta', 3),
    (NEW.id, 'Fechado', 4);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_seed_stages
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_default_pipeline_stages();
