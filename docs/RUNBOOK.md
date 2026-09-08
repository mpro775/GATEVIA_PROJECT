# Operations runbook

## Health and incidents

- Monitor public web, Admin login, `/api/v1/health/live`, and `/api/v1/health/ready`.
- Correlate failures using `X-Request-ID`; logs intentionally omit cookies, tokens, and lead message bodies.
- Pause public forms at the edge during abuse while retaining read-only public content.
- Revoke a compromised user by suspending it; the API revokes its active sessions.
- Rotate exposed secrets in the provider first, update Coolify, redeploy, then revoke the old secret.

## Backup and restore

Take daily encrypted PostgreSQL backups with 14–30 day retention and enable R2 versioning/lifecycle protection. At least quarterly, restore the latest backup into an isolated environment, apply the recorded migration head, and verify row counts and API readiness. Never rehearse a restore against production.

## Rollback

Roll back applications to the prior immutable image. Prefer forward database fixes; restore the database only for confirmed data corruption after isolating writes and preserving incident evidence.
