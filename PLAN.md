# imagine-ai-web-app — Dashboard Plan

Read-only admin dashboard over the imagine-ai-bot. No Postgres here — it fetches
the bot's `/internal/admin/*` HTTP endpoints server-side through a typed adapter.

## Status
- Part A (bot API) MERGED to main (squash commit `749c2f1`, was PR #7).
- This repo: cloned to `~/imagine-ai-web-app`, branch `feat/dashboard-foundation`,
  EMPTY (only half-written config files, nothing committed). Empty GitHub repo (no default branch yet).

## Endpoints the bot exposes (auth: header `x-internal-secret: <BOT_INTERNAL_SECRET>`)
Base URL = `BOT_API_URL`. All read-only GET. Errors: `{ error: { code, message } }` (401 bad/missing secret, 400 invalid_query, 404 not_found).

1. `GET /internal/admin/overview?from&to` (from/to = ISO datetime or date; default window = last 30d)
   -> OverviewRollup:
   `{ activeStudents, quietStudents, messagesToday, messages7d, messages30d, openEscalations,
      health: { queueBacklog, failedWebhooks, failedFollowUps } }` (all numbers)

2. `GET /internal/admin/chats?student&coach&cohort&status&from&to&limit&cursor`
   - student/coach = ILIKE substring; cohort = exact; status = open|acknowledged|resolved (filters threads with an escalation of that status)
   - limit = 1..100 default 50; cursor = wire string `"<lastMessageAt ISO>|<studentExternalId>"`
   -> `{ threads: ChatThread[], nextCursor: string|null }`
   ChatThread: `{ studentExternalId, studentName|null, coach|null, cohort|null, lastMessageAt(ISO),
     lastDirection: 'in'|'out', inCount, outCount, openEscalation(bool) }`
   Pagination: keyset on (lastMessageAt DESC, studentExternalId DESC). nextCursor non-null only when page is full.

3. `GET /internal/admin/chats/:externalId?from&to`  (404 if unknown student)
   -> ChatThreadDetail: `{ studentExternalId, studentName|null, summary|null,
        messages: { at(ISO), direction:'in'|'out', content, model|null, toneHint|null, edited }[],
        escalations: { id, at(ISO), status, triggeredBy }[] }` (messages ordered at ASC)

4. `GET /internal/admin/escalations?student&coach&status&from&to`
   -> AdminEscalationRow[]:
   `{ id, studentExternalId, studentName|null, coach|null, triggeredBy, triggerDetail|null,
      status:'open'|'acknowledged'|'resolved', createdAt(ISO), acknowledgedAt|null, resolvedAt|null,
      timeToAckSeconds|null, timeToResolveSeconds|null }`

5. `GET /internal/admin/health?from&to`
   -> HealthSnapshot:
   `{ queue: { pending, oldestPendingAt|null, recentErrors: { at, error }[] },
      webhooks: { failedCount, byOutcome: Record<string,number> },
      followUps: { failedCount, recentFailures: { at, reason|null }[] },
      stuckThemes: number }`

## Architecture
- Next.js App Router (TS), Tailwind + shadcn/ui (Radix + Lucide). Light editorial vibe (Resend/Fireflies refs).
- Auth: NextAuth/Auth.js Google provider + email allowlist (`ALLOWED_EMAILS` comma-list). `isAllowedEmail()` in signIn callback. middleware gates `(dashboard)` + `/api/*` except `/api/auth`.
- Source adapter: `src/lib/sources/bot/` — `import 'server-only'`; `fetchSource<T>(path, zodSchema, params)` adds the secret header, `cache:'no-store'`, never throws -> `{ data|null, error|null, fetchedAt }`. Zod schemas mirror the contracts above exactly. Exports getOverview/listChats/getChat/listEscalations/getHealth.
- Pages (server components, read searchParams for filters): overview, chats (+[externalId]), escalations, health.
- NO Postgres, NO writes, NO SSE/live, no cost panel (out of scope).

## Env (server-only; .env.example)
`BOT_API_URL, BOT_INTERNAL_SECRET, ALLOWED_EMAILS, NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET`
(BOT_INTERNAL_SECRET must equal the bot's INTERNAL_CRON_SECRET.)

## Build order (B1-B6 from bot repo plan docs/superpowers/plans/2026-05-30-bot-activity-dashboard-plan.md)
B1 scaffold+layout, B2 auth, B3 adapter, B4 overview, B5 chats list+detail, B6 escalations+health.

## Infra notes
- Test Postgres for bot = Docker `imagine-ai-bot-test-pg` on :5433 (pandora owns :5432). `docker rm -f imagine-ai-bot-test-pg` to remove.
- gh active account = jacksonford07.
