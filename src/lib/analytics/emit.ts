'use server';

import { createClient } from '@/lib/supabase/server';

export type EventType =
  | 'qr_scanned'
  | 'signup_started'
  | 'signup_completed'
  | 'onboarding_completed'
  | 'home_viewed'
  | 'checklist_item_completed'
  | 'daily_checklist_completed'
  | 'progress_logged';

export async function emitEvent(
  userId: string,
  eventType: EventType,
  payload?: Record<string, unknown>,
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from('engagement_events').insert({
      user_id: userId,
      event_type: eventType,
      payload: payload ?? null,
    });
  } catch {
    // Events are non-critical — never throw
  }
}
