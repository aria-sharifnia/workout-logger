# Workout Set Logger

A small mobile app for logging workout sets, built to learn Supabase.
Expo + React Native + TypeScript on the front end; hosted Supabase
(Auth + Postgres + Row Level Security) is the entire backend. There is
no custom server.

## Features
- Email/password sign up, log in, and log out (session persists across restarts)
- Add, list, and delete workout sets: exercise, weight, reps, optional RPE, timestamp
- Input validation in the app, plus constraints in the database
- Loading, empty, and error states on every screen

## Stack
Expo, React Native, TypeScript, `@supabase/supabase-js`, hosted Supabase.

## How security works
The app uses Supabase's **publishable key**, which is public by design.
No secret or service-role key is used anywhere. Data is protected by two
layers in the database:

1. **Grants:** the `authenticated` role may only `select`, `insert`, and
   `delete` on `workout_sets`. The `anon` role has no access. Nobody can `update`.
2. **Row Level Security policies:** each policy compares the row's `user_id`
   to `auth.uid()`, read from the user's JWT. Users can only see, create,
   or delete their own rows.

`user_id` defaults to `auth.uid()`, so the client never sends it, and the
insert policy rejects any attempt to write a row for someone else.

I verified this with two accounts in the app and by calling the REST API
directly with the second user's token: reads and deletes of other users'
rows match nothing, inserts as another user fail with a row-level security
error, and updates fail with permission denied.

## Run it yourself
1. Create a Supabase project.
2. In Authentication > Sign In / Providers > Email, turn off **Confirm email**
   (local development only; the built-in email service is heavily rate limited).
3. In the SQL Editor, run `supabase/schema.sql`.
4. Copy `.env.example` to `.env` and fill in your project URL and publishable key.
5. `npm install`, then `npx expo start`.

## Design decisions and limitations
- **Validation exists twice:** in the app for friendly messages, and as
  database `check` constraints as the real guarantee.
- **Session storage:** SQLite-backed `localStorage`, which is not encrypted.
  A production app would encrypt the session using `expo-secure-store`.
- **Types:** `lib/database.types.ts` is generated from the database schema
  (dashboard: Integrations > Data API > Docs > Generate and download types).
  Regenerate it after any schema change.
- **No pagination:** the list shows the latest 100 sets.
- **Email confirmation is off** for development. In production I would turn
  it on and configure a custom SMTP provider.