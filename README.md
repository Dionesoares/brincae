# Brincaê Fest

Public catalog + admin panel for an inflatable-toy rental business, built with React, Vite, and Supabase.

## Prerequisites

- [Node.js](https://nodejs.org) 18+
- A [Supabase](https://supabase.com) project
- The [Supabase CLI](https://supabase.com/docs/guides/cli) (only needed to apply database migrations)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Supabase project values (find them in your Supabase project's **Settings → API**):

   ```bash
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
   ```

3. Apply the database schema to your Supabase project:

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push --linked
   ```

   This creates the `profiles` and `toys` tables, row-level security policies, and the `toy-images` storage bucket (see `supabase/migrations/`).

4. Promote your account to admin so you can access `/admin`. Sign up once through `/register` (or via the Supabase dashboard's Auth users page), then run in the Supabase SQL editor:

   ```sql
   update public.profiles set role = 'admin' where id = '<your-user-uuid>';
   ```

## Run locally

```bash
npm run dev
```

Open the local URL printed by Vite.

## Build

```bash
npm run build
```

## Deployment

The app is deployed on [Vercel](https://vercel.com), connected to this GitHub repository for automatic deploys on every push to `main`. Configure the same `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` environment variables in the Vercel project settings.

## Optional: Google sign-in

The `/login` and `/register` pages include a "Continue with Google" option for future customer accounts. To enable it, configure a Google OAuth client under **Authentication → Providers** in your Supabase dashboard.
