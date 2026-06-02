# PRM - Personal Relationship Manager

PRM is a personal relationship manager built with Next.js App Router, Prisma, Supabase/PostgreSQL, NextAuth Google OAuth, Inngest reminders, and OpenAI `gpt-4o-mini`.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` and `DIRECT_URL`
   - `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - `OPENAI_API_KEY`
   - `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`

3. Push the Prisma schema:
   ```bash
   npm run db:push
   ```

4. Seed demo data:
   ```bash
   npm run db:seed
   ```

5. Start the app:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - start local development server
- `npm run lint` - run ESLint
- `npx tsc --noEmit` - run TypeScript checks
- `npm run build` - build for production
- `npm run db:push` - sync Prisma schema to Supabase/PostgreSQL
- `npm run db:seed` - seed demo user data

See `SETUP_SUPABASE.md` and `QUICKSTART.md` for more details.
