# AGENTS.md

## Project Context

Brincaê Fest is a React + Vite single-page app for an inflatable-toy rental business: a public catalog (`/`, `/brinquedo/:id`) plus a password-protected admin panel (`/admin`) for managing the toy catalog. The backend is [Supabase](https://supabase.com) (Postgres, Auth, Storage). The app deploys to [Vercel](https://vercel.com), auto-deploying from the `main` branch on GitHub.

Start with `README.md` for local setup and environment variables.

## Key Files

- `src/`: frontend application source.
- `src/lib/supabaseClient.js`: Supabase JS client, initialized from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- `src/lib/AuthContext.jsx`: auth/session state (Supabase Auth session + `profiles.role`).
- `supabase/migrations/`: SQL migrations for the Postgres schema (`profiles`, `toys`, RLS policies, storage bucket).
- `vite.config.js`: Vite config (plain `@vitejs/plugin-react`, with the `@/*` → `src/*` alias).
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Run `npm run dev` for local frontend development against the hosted Supabase project (values from `.env.local`).
- Database schema changes go in `supabase/migrations/*.sql`; apply them with `supabase db push --linked` (requires `supabase link --project-ref <ref>` once per machine).
- The `toys` table is publicly readable; writes require the caller's `profiles.role` to be `admin` (enforced by RLS, see `supabase/migrations/`). Promote a user to admin with a one-off SQL update — there is no self-service UI for this by design.
- Toy images are uploaded to the `toy-images` Supabase Storage bucket (public read, admin-only write).
- Run `npm run lint` and `npm run build` before finishing code changes.
