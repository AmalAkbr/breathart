**Breath Art Institute**

- React + Vite frontend with Supabase Postgres backend via Drizzle ORM.
- Animated marketing site components, forms for login/register, and Supabase auth/data wiring.

## Stack
- React 19, Vite 7
- Styling: Tailwind (v4), custom CSS components
- Animations: Framer Motion, GSAP
- Data: Supabase Postgres via Drizzle ORM

## Quick Start
1) Install deps: `npm install`
2) Env: copy .env.example to .env and set `DATABASE_URL` (Supabase connection string). Keep keys private.
3) Dev server: `npm run dev`

## Environment
- `.env.example` shows required vars including `DATABASE_URL`.
- Use the Supabase connection string (with password) for `DATABASE_URL`.

## Drizzle (Supabase Postgres)
- Schema: [drizzle/schema.ts](drizzle/schema.ts)
- Config: [drizzle.config.ts](drizzle.config.ts) (migrations output to `drizzle/migrations`)
- Commands:
  - Generate SQL: `npm run drizzle:generate`
  - Apply migrations: `npm run drizzle:migrate`

## Scripts
- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview production build
- `npm run lint` – run eslint
- `npm run drizzle:generate` – generate migration SQL
- `npm run drizzle:migrate` – apply migrations

## Notes
- Do not commit secrets. Keep Supabase keys and database passwords in `.env`.
- If you need to inspect or seed data, connect with your Supabase connection string; Drizzle migrations live in `drizzle/migrations`.
