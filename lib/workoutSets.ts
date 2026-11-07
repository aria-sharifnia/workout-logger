import { supabase } from './supabase';

export type WorkoutSet = {
  id: string;
  exercise_name: string;
  weight: number;
  reps: number;
  rpe: number | null;
  created_at: string;
};

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
  return (data ?? []) as WorkoutSet[];
}