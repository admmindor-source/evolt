import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

// Load .env.local for test helpers (Playwright doesn't load it automatically)
config({ path: path.resolve(process.cwd(), '.env.local') });

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars in .env.local');
  return createClient(url, key);
}

/**
 * Promotes a user to admin by their email. Requires service role key.
 */
export async function makeAdminByEmail(email: string): Promise<void> {
  const supabaseAdmin = getAdminClient();

  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) throw new Error(`listUsers failed: ${error.message}`);

  const user = users.find((u) => u.email === email);
  if (!user) throw new Error(`User not found: ${email}`);

  const { error: updateError } = await supabaseAdmin
    .from('user_profiles')
    .update({ is_admin: true })
    .eq('user_id', user.id);

  if (updateError) throw new Error(`makeAdmin failed: ${updateError.message}`);
}
