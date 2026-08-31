# Omega Replenishers International Ministry

A production-ready ministry web application built with Next.js (App
Router), Tailwind CSS, Lucide Icons, and Supabase (PostgreSQL), deployed
on Vercel.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Lucide Icons
- **Backend/Storage:** Supabase (PostgreSQL, Auth, Row Level Security)
- **Payments:** PayPal (PayPal.Me / hosted Donate link — no PayPal SDK, no card data touches this app)
- **Deployment:** Vercel

## Getting Started

```bash
npm install
cp .env.local.example .env.local
# fill in .env.local, see "Environment Variables" below
npm run dev
```

Visit http://localhost:3000.

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in every value. See
that file for inline documentation of each variable. In short:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase client credentials |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key used by `/admin` to read all prayer requests |
| `NEXT_PUBLIC_YOUTUBE_LIVE_VIDEO_ID` / `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` | Powers the Live Broadcast player and pulsing live indicator |
| `YOUTUBE_API_KEY` | Server-side key used to detect real-time live status and fetch playlist items |
| `NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID` | The "School of the Prophets" playlist. Rotate anytime from Vercel env vars, no deploy needed beyond a redeploy |
| `NEXT_PUBLIC_PAYPAL_LINK` / `NEXT_PUBLIC_PAYPAL_CURRENCY` | The ministry's public PayPal.Me or Donate button link |
| `NEXT_PUBLIC_TIKTOK_URL` / `NEXT_PUBLIC_YOUTUBE_URL` / `NEXT_PUBLIC_FACEBOOK_URL` | Footer social links |

## Database Setup (Supabase)

1. Create a project at https://supabase.com.
2. In the SQL editor, run `supabase/migrations/0001_init.sql`. This creates:
   - `prayer_requests` — captures Prayer Altar submissions. Row Level
     Security allows public **INSERT only**; nothing can read the table
     back except server code using the service role key.
   - `testimonials` — powers the Testimonials Wall. Row Level Security
     allows public **SELECT** only where `status = 'approved'`.
3. Ministry staff add testimonies directly via the Supabase Studio table
   editor (Table Editor → `testimonials` → Insert row), setting
   `status = 'approved'` once reviewed. This keeps every testimony on the
   public wall a real, vetted report rather than placeholder content.
4. Under **Authentication → Users**, create one operator account per
   ministry staff member who needs `/admin` access (email + password).
   There is no self-serve signup — accounts are provisioned manually by
   whoever owns the Supabase project.

## Admin Dashboard

Visit `/admin` (redirects to `/admin/login` if not authenticated). The
route is protected by `src/middleware.ts`, which requires a valid
Supabase Auth session for every `/admin/*` path except the login page
itself.

From the dashboard, operators can:

- View every prayer request (name, email, request, visibility, status)
- Toggle a request between `pending` and `answered`
- See the currently configured `NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID`

## Live Broadcast Status

`/api/youtube/live-status` calls the YouTube Data API v3
(`search.list?eventType=live`) to detect whether the channel is
currently streaming. The homepage hero and Live Broadcast page poll this
endpoint and only show a "LIVE" pulse when it is genuinely confirmed —
if `YOUTUBE_API_KEY` isn't set, the UI degrades to a neutral "watch"
state instead of asserting a status it can't verify.

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Add every variable from `.env.local.example` under **Project Settings
   → Environment Variables**.
4. Deploy. Rotate `NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID` or the PayPal link
   anytime by updating the env var and redeploying — no code changes
   required.

## Project Structure

```
src/
  app/                    App Router pages, layouts, server actions, API routes
    admin/                Protected operator dashboard + auth actions
    api/                  Route handlers (YouTube live status, prayer requests REST endpoint)
    giving/               Tithing & Giving hub (PayPal)
    live-broadcast/       16:9 live YouTube embed
    prayer-altar/         Prayer form + server action
    school-of-the-prophets/ Playlist hub with category filtering
    testimonials/         Testimonies wall (Supabase-backed)
  components/             Feature-organized, reusable UI components
  lib/
    config/               Site-wide config (nav, socials, donation tiers, env-driven IDs)
    supabase/             Browser / server / admin / public Supabase clients
    types/                Hand-written database types matching the SQL schema
    utils/                Sanitization + PayPal URL helpers
    validation/           Zod schemas for form input
    youtube/              YouTube Data API integration
  middleware.ts           Supabase-Auth-gated /admin protection
supabase/migrations/      SQL schema + RLS policies
```
