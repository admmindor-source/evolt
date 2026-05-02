import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const skipReason = !url || !anonKey || !serviceKey ? 'env not set — run with dotenv' : null;

describe.skipIf(skipReason)('Storage bucket progress-photos (SEC-02)', () => {
  const admin = createClient(url!, serviceKey!);

  it('bucket exists and is private', async () => {
    const { data, error } = await admin.storage.getBucket('progress-photos');
    expect(error).toBeNull();
    expect(data?.public).toBe(false);
  });

  it('bucket has 10MB size limit', async () => {
    const { data } = await admin.storage.getBucket('progress-photos');
    expect(data?.file_size_limit).toBe(10 * 1024 * 1024);
  });

  it('bucket only accepts image mime types', async () => {
    const { data } = await admin.storage.getBucket('progress-photos');
    expect(data?.allowed_mime_types).toEqual(
      expect.arrayContaining(['image/jpeg', 'image/png', 'image/webp']),
    );
  });

  it('anon cannot list files in bucket', async () => {
    const anon = createClient(url!, anonKey!);
    const { data, error } = await anon.storage.from('progress-photos').list('00000000-0000-0000-0000-000000000000');
    if (error) {
      expect(error.message).toMatch(/permission|not authorized|denied/i);
    } else {
      expect(data).toEqual([]);
    }
  });
});
