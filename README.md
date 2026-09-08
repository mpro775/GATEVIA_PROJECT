# GATEVIA V1

Production-oriented monorepo for the multilingual GATEVIA public website, administration application, REST API, and background worker.

## Applications

- `apps/web` — localized public Next.js application.
- `apps/admin` — protected Next.js operations console.
- `apps/api` — NestJS REST/OpenAPI backend and authoritative business rules.
- `apps/worker` — BullMQ email and image-processing workers.

## Local setup

1. Copy `.env.example` to `.env` and replace every placeholder secret.
2. Start PostgreSQL, Redis, and an S3-compatible object store with `docker compose -f docker/compose.dev.yml up -d`.
3. Run `pnpm install`, `pnpm prisma:generate`, `pnpm prisma:migrate:deploy`, and `pnpm seed`.
4. Create the first Super Admin only through `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` with `pnpm bootstrap:admin`; immediately remove the values afterwards.
5. Run `pnpm dev`.

The production seed contains system catalogs only. It never creates fabricated clients, partners, testimonials, case studies, certifications, metrics, or company copy.

See [deployment](docs/DEPLOYMENT.md), [operations](docs/RUNBOOK.md), and [content handover](docs/ADMIN_GUIDE.md).
