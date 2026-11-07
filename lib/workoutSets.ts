import { supabase } from './supabase';
import type { Tables } from './database.types';
import type { WorkoutSetInput } from './validateWorkoutSet';

// The columns the UI reads, derived from the generated Row type.
export type WorkoutSet = Pick<
  Tables<'workout_sets'>,
  'id' | 'exercise_name' | 'weight' | 'reps' | 'rpe' | 'created_at'
>;

const COLUMNS = 'id, exercise_name, weight, reps, rpe, created_at';

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return 'Something went wrong. Please try again.';
}

export async function listWorkoutSets(): Promise<WorkoutSet[]> {
  const { data, error } = await supabase
    .from('workout_sets')
    .select(COLUMNS)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}

export async function createWorkoutSet(input: WorkoutSetInput): Promise<WorkoutSet> {
  const { data, error } = await supabase
    .from('workout_sets')
    .insert(input)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

// Returns true if a row was deleted, false if no row matched.
// "No match" means the row is already gone or isn't yours. RLS hides it,
// so Supabase reports no error in that case.
export async function deleteWorkoutSet(id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('workout_sets')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}