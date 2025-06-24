# SPEC_REVIEW.md

## Review of Brief vs OpenAPI Specification

This document captures the discrepancies, edge cases, and areas of ambiguity identified when comparing the provided Eagle Bank brief (PDF) and the OpenAPI spec (`openapi.yaml`) and (`Take Home coding test v2.pdf`)

---

### 🔐 Authentication

- ❌ No `/auth`, `/login`, or `/token` endpoint exists in the OpenAPI spec, despite the brief requiring JWT-based authentication.
- ❌ No `password` field exists in the `User` schema.
- ❌ No `securitySchemes` or `BearerAuth` defined under `components.securitySchemes`.
- ❌ No global `security` block applied to protected routes in the spec.
- ✅ The brief clearly states JWT should be returned and required for all routes except user creation.

---

### 🧑 User API Gaps

- ❌ No `required` fields specified in `UserRequest`, despite PDF expecting 400 Bad Request on missing data.
- ❌ No password field (yet auth is required).
- ❌ No field-level control on PATCH — fields like email or ID should likely be immutable.
- ❌ No uniqueness constraint (email/username).

---

### 🏦 Bank Account Design

- ❌ No enforcement of ownership rules in spec — all tied to business logic only.
- ❌ No mention of sort code or account number (if this is simulating a "real" bank).
- ❌ No account types (e.g., current, savings).

---

### 💸 Transaction Model Issues

- ❌ No `createdAt` timestamp on transaction object.
- ❌ No balance snapshot or memo field — hurts auditability.
- ❌ No currency — assumed to be one fixed unit.
- ❌ Withdrawals don't validate against available balance in schema.
- ✅ Transactions are immutable as expected (PDF clarifies they cannot be modified/deleted).

---

### 🔄 Idempotency & Concurrency

- ❌ No idempotency key support (e.g., for deposits).
- ❌ No ETag, `If-Match`, or optimistic locking on PATCH endpoints — race conditions possible.

---

### 🧪 Error Handling

- ❌ Spec omits key HTTP status codes required in the brief:
  - `403 Forbidden`
  - `409 Conflict` (e.g., cannot delete user with active account)
  - `422 Unprocessable Entity` (e.g., insufficient funds)
- ❌ No reusable `ErrorResponse` schema to enforce standard error structure.
- ✅ Some 404 cases included but not consistently across all paths.

---

### 🔒 AuthZ & Token Claims

- ❌ No definition of expected JWT claims or how userId is extracted/enforced.
- ❌ No structured way to verify resource ownership beyond assumed match with `userId`.

---

### 📄 Documentation Gaps

- ❌ Endpoint descriptions are mostly missing.
- ❌ No response examples — hurts API consumer experience.
- ❌ Missing tags for grouping endpoints.
- ❌ No `operationId`s for client generation.

---

### 🚨 Miscellaneous Omissions

- ❌ No account balance endpoint — must infer from transaction history.
- ❌ No audit or activity log endpoints (could be expected in a banking API).
- ❌ No pagination, filtering or sorting hints on list endpoints (e.g., transactions).
- ❌ No multi-user roles (e.g., admin vs end-user) — not required here, but unmentioned.

---

## Summary

These gaps don’t prevent building a working prototype, but highlight key areas where additional structure, validation, or documentation would be needed in a production API — especially one operating in the financial domain.

I’ve worked around these with code-level enforcement, and documented decisions in `THINKING.md`.
