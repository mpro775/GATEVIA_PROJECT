# GATEVIA — Security & Privacy Contract
**Document ID:** GTV-SEC-001  
**Version:** v0.3 Draft  
**Status:** Security Baseline

---

## 1. Scope

يشمل:
- Public web.
- Admin.
- API.
- PostgreSQL.
- Redis.
- R2.
- Emails.
- CI/CD.
- Logs.
- Backups.

---

# 2. Security Principles

- least privilege.
- deny by default.
- server-side authorization.
- secure defaults.
- minimal data collection.
- secrets outside source control.
- defense in depth.
- auditable admin actions.

---

# 3. Admin Authentication

Required:
- strong password hashing.
- HttpOnly Secure cookies.
- session expiration.
- session revocation.
- password reset token hashing.
- login rate limiting.
- generic login failure messages.

Recommended:
- MFA for Super Admin and optionally all admin users.
- client decision required before V1 lock.

---

# 4. Authorization

Every admin write/read endpoint must enforce permission.

Never rely on:
- hidden buttons.
- frontend route guards only.
- role name checks scattered through code.

Use centralized permission policies/guards.

---

# 5. CSRF

If auth uses cookies:
- state-changing browser requests require CSRF mitigation.
- SameSite is not the only control if deployment topology makes cross-site requests possible.

---

# 6. CORS

Allowlist only:
- public domain(s).
- admin domain(s).
- approved staging domains.

No wildcard CORS with credentials.

---

# 7. Security Headers

Set appropriate:
- Content-Security-Policy.
- Strict-Transport-Security.
- X-Content-Type-Options.
- Referrer-Policy.
- Permissions-Policy.
- frame-ancestors via CSP.
- SameSite/Secure cookies.

CSP must be compatible with approved analytics scripts only.

---

# 8. XSS

- React escaping by default.
- sanitize rich-text output.
- no arbitrary HTML/JS from CMS.
- no arbitrary iframe embeds.
- SVG sanitization or restrictive handling.

---

# 9. SQL Injection

- Prisma parameterized access.
- raw SQL only when required and parameterized.
- code review for `$queryRawUnsafe`/equivalent unsafe operations.

---

# 10. SSRF

For server-fetched external resources:
- allowlist providers where possible.
- block internal/private IP ranges.
- do not fetch arbitrary user-supplied URL blindly.

---

# 11. File Upload Security

- presigned uploads limited by key/purpose.
- validate MIME + extension + size.
- generate storage keys server-side.
- block executables.
- sanitize SVG or disable SVG upload if not needed.
- direct video/document limits configurable.
- no public upload endpoint without admin auth.

---

# 12. Public Forms

- rate limit.
- bot protection/honeypot/captcha strategy.
- validation.
- max field lengths.
- idempotency support.
- duplicate detection signaling.
- no HTML injection.

---

# 13. PII

Potential PII:
- name.
- email.
- phone.
- company.
- country.
- message.
- assessment answers.

Rules:
- no PII in analytics.
- logs redact sensitive values.
- export permission restricted.
- production DB access restricted.
- support access auditable.

---

# 14. Privacy

Before production:
- Privacy Policy approved.
- retention period for leads decided.
- cookie/analytics consent behavior decided.
- user-facing notice on forms approved.

This document is technical, not legal advice.

---

# 15. Secrets

Must be stored in:
- Coolify/env secret store.
- CI secret store.

Never in:
- Git.
- README.
- seed files.
- frontend bundles.
- logs.

---

# 16. Database Security

- dedicated DB user per environment.
- non-superuser application credentials.
- network exposure restricted.
- backups encrypted or provider-protected.
- production DB not accessible publicly unless explicitly protected by firewall/VPN.

---

# 17. Redis Security

- private network.
- authentication if supported.
- not internet-exposed.
- separate environment instances/databases.
- no sensitive long-lived plaintext payloads unnecessarily.

---

# 18. R2 Security

- admin uploads via scoped presigned URLs.
- no account-level credentials in browser.
- separate staging/prod buckets.
- public access only to intended public assets.
- private future assets use signed access.

---

# 19. Email Security / Deliverability

Domain setup:
- SPF.
- DKIM.
- DMARC.

Do not expose email provider API key.

Store delivery errors without logging full email body unnecessarily.

---

# 20. Audit

Audit at least:
- login success/failure summary.
- role changes.
- user changes.
- publish/archive.
- lead status/assignment.
- exports.
- destructive media actions.
- security-setting changes.

Audit logs must not be editable by ordinary users.

---

# 21. Logging

Structured JSON logs in production.

Include:
- request ID.
- route.
- status.
- duration.
- actor ID if authenticated.

Exclude/redact:
- passwords.
- tokens.
- cookies.
- authorization headers.
- full lead messages by default.

---

# 22. Rate Limits

At minimum:
- login.
- forgot password.
- public forms.
- upload-session creation.
- expensive search/export endpoints.

Exact values environment-configurable.

---

# 23. Dependency Security

CI should run:
- dependency audit/advisory scan.
- lockfile committed.
- scheduled dependency review.
- no blind auto-major-upgrade.

---

# 24. Backups

- automatic PostgreSQL backups.
- restore test.
- protected credentials.
- separate retention from live DB.
- R2 versioning/lifecycle considered where budget permits.

---

# 25. Incident Response Minimum

Document:
- who has production access.
- how to revoke sessions.
- how to rotate secrets.
- how to disable forms.
- how to rollback deployment.
- how to restore DB.
- how to access logs/Sentry.

---

# 26. Security Acceptance Gate

Before production:
- [ ] HTTPS only.
- [ ] no default passwords.
- [ ] admin RBAC verified.
- [ ] public forms rate-limited.
- [ ] upload restrictions verified.
- [ ] secrets scan clean.
- [ ] CSP/security headers reviewed.
- [ ] production errors hide stack trace.
- [ ] backup restore procedure documented.
- [ ] lead export permission verified.
- [ ] privacy/cookie decisions recorded.
