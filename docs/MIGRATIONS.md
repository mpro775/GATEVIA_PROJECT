# Migration policy

Migrations are append-only and deployed with `prisma migrate deploy`. Never use `db push` in shared or production environments. Use expand/backfill/contract changes for incompatible schema work, backfill before adding a required constraint, and take a verified backup before every production migration. Applied migration files must never be edited.
