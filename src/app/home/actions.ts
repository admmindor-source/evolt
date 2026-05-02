'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
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
  }

  revalidatePath('/home');
}
