-- engagement_events: records all user journey events for analytics
CREATE TABLE IF NOT EXISTS engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  event_type text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events but only admins can read all
CREATE POLICY "Users insert own events"
  ON engagement_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own events"
  ON engagement_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Index for admin queries on event_type and created_at
CREATE INDEX IF NOT EXISTS engagement_events_type_created
  ON engagement_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS engagement_events_user_created
  ON engagement_events (user_id, created_at DESC);
