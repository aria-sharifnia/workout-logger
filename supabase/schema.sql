-- Workout set logger: table, constraints, index, and RLS switch

create table public.workout_sets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid()
                  references auth.users (id) on delete cascade,
  exercise_name text not null
                  check (char_length(btrim(exercise_name)) between 1 and 100),
  weight        numeric(6,2) not null
                  check (weight >= 0 and weight <= 2000),
  reps          integer not null
                  check (reps between 1 and 1000),
  rpe           numeric(3,1)
                  check (rpe between 1 and 10),
  created_at    timestamptz not null default now()
);

-- Lists are always "my sets, newest first", so index exactly that.
create index workout_sets_user_id_created_at_idx
  on public.workout_sets (user_id, created_at desc);

-- Default-deny: with RLS on and no policies yet, the API can't see any rows.
alter table public.workout_sets enable row level security;

-- Grants: which operations the logged-in role may attempt at all.
-- Start clean, then grant only what the app needs (no update, no anon).
revoke all on table public.workout_sets from anon, authenticated;
grant select, insert, delete on table public.workout_sets to authenticated;

-- Policies: which rows those operations may touch.
create policy "workout_sets_select_own"
  on public.workout_sets
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "workout_sets_insert_own"
  on public.workout_sets
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "workout_sets_delete_own"
  on public.workout_sets
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);