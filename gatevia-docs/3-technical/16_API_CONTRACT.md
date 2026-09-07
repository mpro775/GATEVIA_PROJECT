# GATEVIA — API Contract
**Document ID:** GTV-API-001  
**Version:** v0.3 Draft  
**Status:** Technical Contract  
**Style:** REST + OpenAPI

---

## 1. Base

```text
/api/v1
```

Content type:
```text
application/json; charset=utf-8
```

Problem errors:
```text
application/problem+json
```

---

## 2. Versioning

- Breaking changes require new API version.
- Non-breaking additions may remain in v1.
- OpenAPI document is generated and committed/exported as an artifact.
- Frontends consume a typed client generated from the API contract.

---

## 3. Authentication

Admin endpoints require authenticated session.

Recommended browser model:
- Secure HttpOnly cookie/session.
- CSRF token/protection for state-changing browser requests.
- API verifies session and permissions.

Public read endpoints do not require authentication.

Public form endpoints are anonymous but rate-limited.

---

## 4. Authorization

Each protected route declares permission(s).

Example:
```text
GET    /admin/pages          -> pages.read
POST   /admin/pages          -> pages.create
PATCH  /admin/pages/:id      -> pages.update
POST   /admin/pages/:id/publish -> pages.publish
```

UI visibility never replaces API authorization.

---

## 5. Success Responses

### Single resource
```json
{
  "data": {
    "id": "uuid",
    "..."
  }
}
```

### List
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 132,
    "pageCount": 7
  }
}
```

---

## 6. Error Model

RFC Problem Details style:

```json
{
  "type": "https://gatevia.example/problems/validation-error",
  "title": "Validation failed",
  "status": 422,
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/leads/contact",
  "requestId": "req_...",
  "errors": {
    "email": ["Invalid email address"]
  }
}
```

### Status conventions
- 400 malformed request.
- 401 unauthenticated.
- 403 authenticated but forbidden.
- 404 not found.
- 409 conflict/invariant violation.
- 422 semantic validation.
- 429 rate limit.
- 500 unexpected server error.

No stack traces in production responses.

---

## 7. Pagination

Admin list endpoints:
```text
?page=1&pageSize=20
```

Constraints:
- default 20.
- maximum 100.

Public content listing can use same convention.

---

## 8. Sorting

Example:
```text
?sort=-publishedAt,title
```

Only allowlisted fields accepted.

---

## 9. Filtering

Examples:
```text
?status=published
?featured=true
?locale=en
?serviceId=...
?industryId=...
```

Unknown filters are rejected or ignored consistently; contract should prefer rejection for admin APIs.

---

# 10. Public Content Endpoints

## Languages
```text
GET /public/languages
```

## Navigation
```text
GET /public/navigation/:menuKey?locale=en
```

## Pages
```text
GET /public/pages/:slug?locale=en
```

## Services
```text
GET /public/services?locale=en&category=...
GET /public/services/:slug?locale=en
```

## Industries
```text
GET /public/industries?locale=en
GET /public/industries/:slug?locale=en
```

## Case Studies
```text
GET /public/case-studies?locale=en&industry=...&service=...
GET /public/case-studies/:slug?locale=en
```

## Insights
```text
GET /public/insights?locale=en&type=article&q=...
GET /public/insights/:slug?locale=en
```

## Trust/Ecosystem
```text
GET /public/clients?locale=en
GET /public/partners?locale=en
GET /public/brands?locale=en
GET /public/brands/:slug?locale=en
GET /public/products?locale=en
GET /public/products/:slug?locale=en
GET /public/testimonials?locale=en
GET /public/certifications?locale=en
GET /public/trust-metrics?locale=en
```

## Company
```text
GET /public/team?locale=en
GET /public/faqs?locale=en
GET /public/settings
```

Only explicitly public settings are returned.

---

# 11. Public Form Endpoints

## Contact
```text
POST /public/forms/contact
```

## Consultation
```text
POST /public/forms/consultation
```

## Assessment
```text
POST /public/forms/market-entry-assessment
```

Requirements:
- input validation.
- spam protection.
- rate limit.
- attribution capture.
- server-generated lead ID.
- no internal CRM data returned.

### Response
```json
{
  "data": {
    "submissionId": "uuid",
    "received": true
  }
}
```

---

# 12. Idempotency

Public form endpoint should accept:
```text
Idempotency-Key: <uuid>
```

Recommended retention window:
- 24 hours.

Same key + same endpoint returns same logical submission result.
Same key + conflicting payload returns 409.

---

# 13. Auth Endpoints

```text
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
POST /auth/forgot-password
POST /auth/reset-password
```

Optional future:
```text
POST /auth/mfa/...
```

---

# 14. Admin CMS Endpoints

Pattern:
```text
GET    /admin/{resource}
POST   /admin/{resource}
GET    /admin/{resource}/:id
PATCH  /admin/{resource}/:id
POST   /admin/{resource}/:id/publish
POST   /admin/{resource}/:id/archive
```

Resources:
```text
pages
service-categories
services
industries
case-studies
insights
insight-categories
tags
faqs
team-members
clients
partners
brands
products
testimonials
certifications
trust-metrics
navigation
redirects
```

Hard DELETE is restricted and not the default content operation.

---

# 15. Translations API

Preferred:
translations included as nested objects in Admin create/update payload.

Example:
```json
{
  "status": "draft",
  "translations": {
    "ar-SA": {
      "title": "...",
      "slug": "..."
    },
    "en": {
      "title": "...",
      "slug": "..."
    }
  }
}
```

API validates active locales and uniqueness.

---

# 16. Media API

```text
GET  /admin/media
POST /admin/media/upload-session
POST /admin/media/finalize
GET  /admin/media/:id
PATCH /admin/media/:id
POST /admin/media/:id/replace-session
POST /admin/media/:id/archive
GET  /admin/media/:id/usages
```

Folders:
```text
GET/POST/PATCH /admin/media-folders
```

Upload session response contains presigned URL and upload token/ID.

---

# 17. Leads API

```text
GET   /admin/leads
GET   /admin/leads/:id
PATCH /admin/leads/:id/status
PATCH /admin/leads/:id/assignee
POST  /admin/leads/:id/notes
GET   /admin/leads/:id/activities
POST  /admin/leads/export      # only if feature approved
```

---

# 18. Users / Roles

```text
GET/POST/PATCH /admin/users
GET /admin/roles
GET /admin/permissions
POST/PATCH /admin/roles
```

System roles may have restrictions on deletion/key changes.

---

# 19. Languages

```text
GET   /admin/languages
POST  /admin/languages
PATCH /admin/languages/:id
POST  /admin/languages/:id/activate
POST  /admin/languages/:id/deactivate
POST  /admin/languages/:id/set-default
```

Cannot deactivate the only/default language without first moving default.

---

# 20. Audit

```text
GET /admin/audit-logs
```

Super Admin only by default.

---

# 21. Settings

```text
GET   /admin/settings
PATCH /admin/settings/:key
```

Sensitive settings/secrets must not be managed as plaintext through generic settings endpoints.

---

# 22. Health

```text
GET /health/live
GET /health/ready
```

`ready` checks critical dependencies with timeouts.

---

# 23. Cache Validation

Admin publish/update actions may emit a signed revalidation call/webhook to Next.js.

No unauthenticated public cache purge endpoint.

---

# 24. Input Rules

- Never trust locale from free text without validation.
- Validate UUIDs.
- Normalize emails.
- Normalize phone format where possible without losing original.
- Sanitize rich content.
- URLs must be validated.
- External URLs use safe protocol allowlist.

---

# 25. OpenAPI Gate

Before a wave is closed:
- OpenAPI generation succeeds.
- no duplicate operation IDs.
- typed API client generation succeeds.
- API implementation and spec are synchronized.
