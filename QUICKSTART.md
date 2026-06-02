# Quick Start Guide — PRM App

## 🚀 Getting Started (After Setup)

Follow these steps to get the app running:

### 1. Setup Supabase Database

1. Create a Supabase project (see `SETUP_SUPABASE.md`)
2. Copy your `DATABASE_URL` to `.env`
3. Push schema to database:
   ```bash
   npm run db:push
   ```
4. Apply RLS policies:
   - Open `supabase/rls-policies.sql`
   - Copy contents
   - Paste into Supabase SQL Editor → Run

### 2. Setup Authentication

**Google OAuth:**
1. Create OAuth credentials in Google Cloud Console
2. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-app.vercel.app/api/auth/callback/google`
3. Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`

**NextAuth Secret:**
```bash
openssl rand -base64 32
```
Copy output to `NEXTAUTH_SECRET` in `.env`

### 3. (Optional) Seed Sample Data

```bash
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 → Sign in with Google → Dashboard!

---

## 📁 Project Structure

```
prm-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/route.ts  # NextAuth handler
│   │   ├── auth/
│   │   │   └── signin/
│   │   │       └── page.tsx                # Sign-in page
│   │   ├── dashboard/
│   │   │   └── page.tsx                    # Dashboard (placeholder)
│   │   ├── layout.tsx                      # Root layout with SessionProvider
│   │   └── page.tsx                        # Home (redirects to auth)
│   ├── components/
│   │   ├── ui/                             # shadcn/ui components
│   │   └── providers.tsx                   # SessionProvider wrapper
│   ├── lib/
│   │   ├── prisma.ts                       # Prisma singleton
│   │   └── supabase.ts                     # Supabase clients
│   └── types/
│       └── next-auth.d.ts                  # NextAuth type augmentation
├── prisma/
│   ├── schema.prisma                       # Database schema
│   └── seed.ts                             # Seed script
├── supabase/
│   └── rls-policies.sql                    # Row Level Security policies
├── .env.example                            # Environment variables template
├── SETUP_SUPABASE.md                       # Detailed Supabase setup guide
├── vercel.json                             # Vercel deployment config
└── package.json
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

---

## 🌐 Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add Environment Variables (copy from `.env`)
4. Deploy!

**Important**: Update Google OAuth redirect URIs with your Vercel domain.

---

## 📋 Next Steps (After Setup)

- ✅ TIP-001: Scaffold & Setup — COMPLETED
- ✅ TIP-002: Database Schema — COMPLETED (pending user `db:push`)
- ⏳ TIP-003: Auth System — IN PROGRESS (already implemented)
- ⏳ TIP-004: Contact CRUD API — TODO
- ⏳ TIP-005: Contact Hub UI — TODO
- ⏳ TIP-006: Reminder Engine — TODO
- ⏳ TIP-007: Dashboard & Health Score — TODO
- ⏳ TIP-008: AI Advisor — TODO
- ⏳ TIP-009: Occasion & Gift Tracker — TODO
- ⏳ TIP-010: VERIFY & Polish — TODO

---

## ❓ Need Help?

- Check `SETUP_SUPABASE.md` for detailed database setup
- Review `PRM-PRD.md` for product requirements
- See `PRM-TIPs-Claude-Code.md` for task breakdown

---

**Built with Vibecode Kit v6.0** 🤖
