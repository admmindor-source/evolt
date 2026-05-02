-- checklist_completions: persists daily checklist item completion state per user per day
CREATE TABLE IF NOT EXISTS checklist_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  date date NOT NULL,
  category text NOT NULL CHECK (category IN ('supplement', 'workout', 'nutrition', 'hydration')),
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date, category)
);

ALTER TABLE checklist_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own checklist completions"
  ON checklist_completions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
