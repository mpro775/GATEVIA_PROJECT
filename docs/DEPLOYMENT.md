# Deployment

Deploy `web`, `admin`, `api`, and `worker` as separate Coolify services using their corresponding Dockerfiles. Provision isolated PostgreSQL, Redis, and R2 resources for staging and production. Copy values from the matching environment example into the platform secret store; never build secrets into images.

Release order: verify a database backup, run `prisma migrate deploy` from the new API image, deploy API and worker, then deploy admin and web. Record the Git SHA, immutable image tags, and migration head for every release. Run API readiness and representative locale/form smoke checks before promoting traffic.

Use separate staging email credentials or a forced safe recipient. Production requires verified SPF, DKIM, and DMARC, TLS at Cloudflare and origin, private database/Redis networking, configured R2 CORS for the admin origin, and Sentry DSNs per service.
