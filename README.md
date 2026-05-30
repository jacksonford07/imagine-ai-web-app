# imagine-ai-web-app

Read-only admin dashboard for [imagine-ai-bot](https://github.com/jacksonford07/imagine-ai-bot).
It never touches Postgres — it fetches the bot's `/internal/admin/*` endpoints
server-side through a typed source adapter, gated by Google sign-in + an email allowlist.

## Stack
Next.js (App Router) · TypeScript · Tailwind + shadcn/ui (Radix, Lucide) · NextAuth/Auth.js · Zod.

## Local dev
```bash
pnpm install
cp env.example .env.local   # fill in the values
pnpm dev
```

## Environment
See `env.example`. `BOT_INTERNAL_SECRET` must match the bot's `INTERNAL_CRON_SECRET`;
`BOT_API_URL` is the bot's public Render URL.

## Architecture
```
Server Component (reads ?filters from URL)
  -> src/lib/sources/bot/client.ts  (import 'server-only', injects x-internal-secret)
  -> fetch bot /internal/admin/*  (cache: no-store)
  -> zod-validate -> { data | error, fetchedAt }   // never throws
  -> render cards / tables  (error -> inline SourceError card)
```

| Bot endpoint | Route | Surface |
|---|---|---|
| `/internal/admin/overview` | `/overview` | Stat cards + health badges |
| `/internal/admin/chats` | `/chats` | Thread table (filters + keyset pagination) |
| `/internal/admin/chats/:id` | `/chats/[externalId]` | Thread detail |
| `/internal/admin/escalations` | `/escalations` | Escalations table |
| `/internal/admin/health` | `/health` | Health panels |

## Status
Foundation slice: scaffold, auth, source adapter, and the Overview page are live.
Chats / escalations / health pages are stubbed next.

## Deploy
Vercel. Set all env vars from `env.example`, and add
`<deployed-origin>/api/auth/callback/google` as an authorized redirect URI in Google OAuth.
```
