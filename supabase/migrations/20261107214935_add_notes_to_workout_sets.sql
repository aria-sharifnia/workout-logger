-- Add an optional free-text note to each set.
alter table public.workout_sets
  add column notes text
  check (notes is null or char_length(notes) <= 500);