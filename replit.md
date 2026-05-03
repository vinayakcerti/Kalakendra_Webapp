# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Kala Kendra Sweden — a classical Indian arts school in Gothenburg. Full public site + admin portal.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, shadcn/ui, React Query (via Orval hooks)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push-force` — push DB schema changes (dev only, bypasses interactive prompts)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Visual Theme

- Fonts: Cormorant Garamond (headings), Manrope (body), Caveat (accent)
- Colors: parchment `#F4EBD9`, maroon `#5C1416`/`#3D0A0C`, gold `#B8893A`, ink `#1F1612`

## DB Tables

- `admissions` — student admission applications (status: pending/under_review/accepted/waitlisted/rejected)
- `students` — enrolled students (linked to admissions via admissionId)
- `batches` — course batches (e.g. "Bharatanatyam — Seniors")
- `fees` — fee records per student (amountOre in öre = 1/100 SEK; status: pending/paid/overdue/waived)
- `attendance` — per-student per-session attendance (status: present/absent/late; unique on studentId+batchId+date)
- `enquiries` — public contact form submissions
- `settings` — school-wide settings (monthlyFeeSek, acceptingApplications, etc.)
- `admins` — admin users
- `audit_log` — audit trail

## DB Migration

Create tables directly with SQL (psql "$DATABASE_URL") or run `pnpm --filter @workspace/db run push-force`. The interactive prompt for existing constraints requires piping input or using SQL directly.

## API Routes (Express, prefix `/api`)

- `/admissions` — CRUD + `/admissions/:id/enrol` (POST, creates student from admission)
- `/students` — CRUD
- `/students/:studentId/fees` — list + create fees per student
- `/fees` — GET all fees (joined with student/batch info); POST /fees/bulk (generate same fee for all students in a batch); POST /fees/mark-overdue (batch-mark all pending past-due fees as overdue)
- `/fees/:id` — PATCH (update fee) + DELETE
- `/attendance` — GET (list with batchId/studentId/date/from/to filters) + POST (upsert full session, idempotent)
- `/attendance/:id` — PATCH (update single entry) + DELETE
- `/batches` — CRUD; GET /batches/:id returns BatchDetail (students enriched with attendanceRate, totalSessions, feesOutstandingOre)
- `/enquiries` — CRUD
- `/settings` — GET + PATCH
- `/stats/dashboard` — GET aggregate stats (includes totalOutstandingOre, overdueCount, recentAdmissions)
- `/activity` — GET recent activity feed (last 30 events across admissions, fees, notes, enquiries, attendance, enrolments)

## Admin Pages

- Dashboard — overview stats (active students, pending review, active batches, unread enquiries, outstanding fees) + recent admissions table + live activity feed (colour-coded events with relative timestamps, links to relevant pages)
- Admissions — list with search/filter + AdmissionDetail (status update, enrol button, enrolled student link)
- Students — list with search/filter + StudentDetail (editable form, fees section)
- Batches — CRUD management; batch names link to BatchDetail page
- BatchDetail — per-batch roster showing each student's attendance rate, total sessions, and outstanding fees; summary stat cards
- Attendance — record sessions (batch + date, per-student present/absent/late toggles), view/edit history grouped by date
- Fees — all fees across students; summary cards; filters by status/student name; Mark Paid action; Mark Overdue batch action; Generate Term Fees bulk dialog
- Enquiries — list + mark read/unread, admin notes
- Settings — school settings (acceptingApplications gates public Apply page)

## Public Pages

- Home, About, Classes, Contact (enquiry form), Apply (admission form, gated by acceptingApplications setting)

## Codegen Pattern

1. Edit `lib/api-spec/openapi.yaml`
2. Run `pnpm --filter @workspace/api-spec run codegen`
3. Generated files: `lib/api-zod/src/generated/api.ts` (Zod schemas) + `lib/api-client-react/src/generated/api.ts` (React Query hooks)
4. Import hooks from `@workspace/api-client-react`, Zod schemas from `@workspace/api-zod`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Payment Methods

- **Swish**: 0764 505 117 (Kala Kendra Sweden) — shown in student portal Fees page and public Classes page
- **Stripe (card payments)**: Not yet connected. The Stripe integration was proposed but dismissed. To set it up in the future, connect it via the Integrations tab (Stripe connector ID: `connector:ccfg_stripe_01K611P4YQR0SZM11XFRQJC44Y`), then wire up `stripeClient.ts`, `webhookHandlers.ts`, and update the API server's `index.ts` per the stripe skill instructions.
