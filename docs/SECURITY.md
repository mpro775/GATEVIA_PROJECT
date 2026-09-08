# Security baseline

Authentication uses revocable HttpOnly sessions with a separate CSRF token. Authorization is enforced by API permissions. CORS is allowlisted, uploads are scoped and validated, rich content is sanitized, public forms are throttled and idempotent, and error responses use Problem Details without production stack traces.

Before go-live, review CSP against the approved analytics domains, perform a dependency and secret scan, test negative RBAC cases, confirm backup restoration, decide privacy retention and consent behavior, and enable MFA for infrastructure accounts. Application MFA is an approved extension point pending the client's V1 decision.
