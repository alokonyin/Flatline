# Flatline — Setup Guide

## 1. Supabase

1. Create a project at https://supabase.com
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **Authentication → URL Configuration** and add your app URL to **Site URL** and **Redirect URLs**

## 2. Resend (email)

1. Sign up at https://resend.com (free tier: 100 emails/day)
2. Add and verify your sending domain (or use their test domain for development)
3. Create an API key → paste into `RESEND_API_KEY`
4. Update the `FROM` address in `src/lib/email.ts` to match your verified domain

## 3. Local development

```bash
# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.local .env.local   # already created — just fill in the values

# Start dev server
npm run dev
```

Open http://localhost:3000

## 4. Deploy to Render

1. Push this repo to GitHub
2. Go to https://render.com → New → Blueprint
3. Connect your GitHub repo
4. Render reads `render.yaml` and sets up the web service + cron job
5. Add all environment variables in the Render dashboard
6. After first deploy, copy your Render URL and:
   - Set `NEXT_PUBLIC_APP_URL` to your Render URL
   - Update `render.yaml` cron `startCommand` with your actual URL
   - Update `src/lib/email.ts` FROM domain

## 5. How the cron works

The cron job calls `GET /api/cron` every hour with:
```
Authorization: Bearer YOUR_CRON_SECRET
```

It checks every active monitor. If `last_ping` is older than the monitor's `threshold` (in minutes), it sends an alert email and sets `alerted_at` to avoid spam.

## 6. How users set up their Zap

1. User creates a monitor on Flatline → gets a unique URL like:
   `https://yourapp.onrender.com/api/ping/abc123`

2. In Zapier, at the **end** of any Zap, add a new action:
   - App: **Webhooks by Zapier**
   - Event: **POST**
   - URL: paste the Flatline ping URL

3. That's it. Every time the Zap runs, it pings Flatline.
   If it goes quiet longer than the threshold, we email them.
