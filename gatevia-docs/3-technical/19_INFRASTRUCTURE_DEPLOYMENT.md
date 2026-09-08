# GATEVIA — Infrastructure & Deployment
**Document ID:** GTV-INFRA-001  
**Version:** v0.3 Draft  
**Status:** Technical Contract

---

## 1. Deployment Goals

- repeatable deployments.
- environment separation.
- simple operation.
- easy rollback.
- independent scaling of web/admin/api/worker.
- no production secrets in repository.

---

# 2. Environments

Required:
```text
development
staging
production
```

Each environment has:
- separate database.
- separate Redis.
- separate R2 bucket/prefix.
- separate secrets.
- separate email mode/provider configuration.
- separate analytics identifiers where relevant.

---

# 3. Production Services

```text
web
admin
api
worker
postgres
redis
```

External:
```text
Cloudflare
R2
Email Provider
Sentry
GA4/GTM
```

---

# 4. Domain Plan

Suggested:
```text
gatevia.sa              -> public web
www.gatevia.sa          -> redirect/canonical
admin.gatevia.sa        -> admin
api.gatevia.sa          -> API
staging.gatevia.sa      -> staging web
admin-staging...        -> staging admin
api-staging...          -> staging API
```

Final domain is client-dependent.

---

# 5. Cloudflare

Use for:
- DNS.
- TLS edge.
- CDN.
- WAF/basic protection.
- R2.
- redirects where appropriate.

Origin TLS remains enabled.

---

# 6. Coolify

Deployment is Coolify-compatible using Docker images.

Each service has:
- health check.
- environment variables.
- restart policy.
- logs.
- resource limits where supported.

---

# 7. Docker

Separate production Dockerfiles:
```text
docker/web.Dockerfile
docker/admin.Dockerfile
docker/api.Dockerfile
docker/worker.Dockerfile
```

Use multi-stage builds.

Images should run as non-root where practical.

---

# 8. PostgreSQL

Preferred production:
- dedicated PostgreSQL service/host or managed DB.
- persistent volume.
- private network.
- automated backups.

For small initial traffic, application services may share a VPS while DB remains logically isolated; architecture must allow separation later.

---

# 9. Redis

Used for:
- BullMQ.
- short-lived rate-limit/caching data.

Must be private/not internet-exposed.

---

# 10. R2 Buckets

Recommended:
```text
gatevia-staging-media
gatevia-production-media
```

Optional prefixes:
```text
original/
variants/
documents/
```

CORS limited to approved admin origins for direct uploads.

---

# 11. CI Pipeline

On pull request:
1. install with frozen lockfile.
2. lint.
3. format check.
4. typecheck.
5. unit tests.
6. build affected apps.
7. OpenAPI generation drift check.
8. Prisma schema validation.
9. migration check.
10. dependency/security scan.

On merge to staging:
- build images.
- deploy staging.
- run migrations.
- run smoke tests.
- optional Playwright UAT suite.

Production:
- manual approval/release gate recommended.

---

# 12. Migration Deployment

Order:
1. backup/verify backup.
2. deploy compatible DB migration.
3. run `prisma migrate deploy`.
4. deploy API/worker.
5. deploy web/admin.
6. run smoke checks.

For non-backward-compatible changes:
- use expand/migrate/contract pattern.

---

# 13. Rollback

Application rollback:
- previous immutable image tag.

Database:
- avoid down-migration dependence.
- use forward fix whenever possible.
- restore only for severe data incidents.

Every production release records:
- git SHA.
- image tags.
- migration head.
- release time.

---

# 14. Backups

Baseline recommendation:
- daily PostgreSQL backup.
- 14–30 day rolling retention.
- monthly longer retention if desired.
- quarterly restore test at minimum during active operation.

Final retention must be approved according to budget/legal needs.

---

# 15. Health Checks

API:
```text
/health/live
/health/ready
```

Web/Admin:
- HTTP health route or root check.

Worker:
- heartbeat/queue health metric.

---

# 16. Monitoring

Minimum:
- Sentry web/admin/api/worker.
- uptime check for public web and API readiness.
- job failure alerts.
- disk/database backup monitoring.
- application logs.

---

# 17. Email

Production:
- verified sending domain.
- SPF/DKIM/DMARC.
- separate staging sender or safe recipient override.

Staging must not accidentally email real leads unless explicitly enabled.

---

# 18. Environment Variables

Core:
```text
NODE_ENV
APP_ENV

DATABASE_URL
REDIS_URL

AUTH_SESSION_SECRET
CSRF_SECRET
SESSION_COOKIE_DOMAIN

R2_ENDPOINT
R2_REGION
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET
R2_PUBLIC_BASE_URL

EMAIL_PROVIDER
EMAIL_API_KEY
EMAIL_FROM
LEAD_NOTIFICATION_RECIPIENTS

SENTRY_DSN

NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_API_URL
ADMIN_URL
API_URL
ALLOWED_ORIGINS

NEXT_PUBLIC_GA4_ID
NEXT_PUBLIC_GTM_ID
```

No secret variable prefixed `NEXT_PUBLIC_`.

---

# 19. Scaling

Scale order:
1. CDN/cache.
2. increase app resources.
3. horizontally scale web/api/worker.
4. separate DB server/managed DB.
5. tune indexes/cache.
6. only then add advanced search infrastructure if needed.

---

# 20. Production Access

Maintain list of:
- infrastructure admins.
- DB admins.
- Cloudflare access.
- R2 access.
- email provider access.
- GitHub/Coolify access.

MFA recommended for infrastructure accounts.

---

# 21. Deployment Acceptance

Before Go-Live:
- [ ] prod domains resolve.
- [ ] TLS valid.
- [ ] DB backup working.
- [ ] Redis private.
- [ ] R2 configured.
- [ ] email DNS verified.
- [ ] Sentry receiving events.
- [ ] health checks green.
- [ ] migration head verified.
- [ ] rollback image available.
- [ ] staging smoke suite passed.
