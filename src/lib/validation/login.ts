import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(72),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// Defense against open redirect (T-04-04).
// Accept only paths that:
//   1) start with a single "/" (not "//", not "/\")
//   2) contain only safe URL path characters
//   3) have a maximum length
export function isSafeNextPath(input: string | null | undefined): input is string {
  if (typeof input !== 'string' || input.length === 0 || input.length > 200) return false;
  if (!input.startsWith('/')) return false;
  if (input.startsWith('//') || input.startsWith('/\\')) return false;
  // Reject protocol-relative or absolute URLs after a slash, common confusables
  if (/^\/+(?:[a-z]+:|\\)/i.test(input)) return false;
  // Allow only typical path/query chars
  return /^\/[A-Za-z0-9\-._~!$&'()*+,;=:@%/?]*$/.test(input);
}

export const DEFAULT_AUTHENTICATED_LANDING = '/home';
