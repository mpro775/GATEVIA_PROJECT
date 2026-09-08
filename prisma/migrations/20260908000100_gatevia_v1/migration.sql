-- GATEVIA V1 baseline. The complete schema is defined in prisma/schema.prisma.
-- This migration intentionally begins with required PostgreSQL extensions and invariants;
-- table DDL is generated and checked from the canonical Prisma schema during closure.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
