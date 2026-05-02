'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { emitEvent } from '@/lib/analytics/emit';
import type { Category } from '@/lib/routine/templates';

export async function toggleChecklistItem(
  category: Category,
  currentlyCompleted: boolean,
  todayDate: string,
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (currentlyCompleted) {
    await supabase
      .from('checklist_completions')
      .delete()
      .eq('user_id', user.id)
      .eq('date', todayDate)
      .eq('category', category);
  } else {
    await supabase
      .from('checklist_completions')
      .upsert({ user_id: user.id, date: todayDate, category });

    void emitEvent(user.id, 'checklist_item_completed', { category, date: todayDate });

    // Check if all 4 categories are now complete
    const { data: completions } = await supabase
      .from('checklist_completions')
      .select('category')
      .eq('user_id', user.id)
      .eq('date', todayDate);

    if ((completions?.length ?? 0) >= 4) {
      void emitEvent(user.id, 'daily_checklist_completed', { date: todayDate });
    }
  }

  revalidatePath('/home');
}
