-- Add is_admin column to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Helper function: returns true if the current user has is_admin = true
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM user_profiles WHERE user_id = auth.uid()),
    false
  );
$$;

-- Allow admins to read all user_profiles
CREATE POLICY "Admin reads all profiles"
  ON user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- Allow admins to read all product_activations
CREATE POLICY "Admin reads all activations"
  ON product_activations FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- Allow admins to read all engagement_events
CREATE POLICY "Admin reads all engagement events"
  ON engagement_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- Allow admins to read all recommendation_events
CREATE POLICY "Admin reads all rec events"
  ON recommendation_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- Allow admins to read all weight_logs
CREATE POLICY "Admin reads all weight logs"
  ON weight_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());
