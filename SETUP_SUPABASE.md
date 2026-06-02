# Supabase Setup Guide for PRM

This guide walks you through setting up Supabase for the PRM application.

## Prerequisites

- A Supabase account (https://supabase.com)
- Node.js installed

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com/
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `prm-app` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
5. Wait for project to be created (~2 minutes)

## Step 2: Get Database Connection String

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **Database**
2. Scroll to **Connection String** section
3. Select **URI** format
4. Copy the connection string. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/[YOUR-DB]?schema=public
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password.

## Step 3: Configure Environment Variables

Open `.env` file in the project root and fill in:

```env
# NextAuth
NEXTAUTH_SECRET=generate-a-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database (copy from Step 2)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DB?schema=public"

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Inngest
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key

# Google OAuth (see Step 4)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**How to find SUPABASE_URL and keys:**
- Go to **Settings** → **API**
- Copy:
  - **Project URL** → `SUPABASE_URL`
  - **anon public** key → `SUPABASE_ANON_KEY`
  - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

**How to generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## Step 4: Setup Google OAuth (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API" (or "Google OAuth2 API")
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-app.vercel.app/api/auth/callback/google
   ```
   (Replace with your Vercel domain after deployment)
7. Copy Client ID and Client Secret to `.env`

## Step 5: Push Database Schema

Run the following command to create tables in your Supabase database:

```bash
npx prisma db push
```

This will synchronize your Prisma schema with the database.

## Step 6: Apply Row Level Security (RLS) Policies

1. Go to your Supabase dashboard → **SQL Editor**
2. Copy and paste the contents of `supabase/rls-policies.sql`
3. Click **Run** to execute

This ensures users can only access their own data.

## Step 7: (Optional) Seed Sample Data

To add sample data for testing:

```bash
npx prisma db seed
```

**Note**: You need to define a seed script in `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

See `prisma/seed.ts` example if needed.

## Step 8: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open http://localhost:3000
3. You should be redirected to Google sign-in (or sign-in page)
4. After signing in, you should see the Dashboard

## Troubleshooting

**Error: "Database connection error"**
- Check that `DATABASE_URL` is correct
- Ensure Supabase project is running
- Check that database password is correct

**Error: "relation does not exist"**
- Run `npx prisma db push` again
- Make sure you're connected to the correct database

**NextAuth not working**
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Verify redirect URIs in Google Cloud Console match your app URL

## Next Steps

After database setup is complete, continue with:
- **TIP-003**: Auth System Testing
- **TIP-004**: Contact CRUD API implementation
- **TIP-005**: Contact Hub UI
