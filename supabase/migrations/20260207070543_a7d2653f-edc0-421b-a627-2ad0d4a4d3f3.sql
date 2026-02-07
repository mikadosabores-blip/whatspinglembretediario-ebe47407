
-- Add recurrence fields to commitments
ALTER TABLE public.commitments
  ADD COLUMN recurrence TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN recurrence_end_date DATE DEFAULT NULL,
  ADD COLUMN parent_commitment_id UUID DEFAULT NULL REFERENCES public.commitments(id) ON DELETE SET NULL;

-- Index for finding recurring parents
CREATE INDEX idx_commitments_parent ON public.commitments(parent_commitment_id);
