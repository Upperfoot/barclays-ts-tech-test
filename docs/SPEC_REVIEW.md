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

- ❌ Accounts references accountNumber as the path field {accountNumber}, this should be a unique identifier as the same Account Number may be used across several sort-codes (12345678 / 10-10-10 != 12345678 / 20-20-20), we should use a unique identifier in it's place, returned in responses in POST, GET (ONE/MANY), PATCH 

---

### 💸 Transaction Model Issues

- ❌ Transactions may fail in banking systems as they are processed OOB, usually with a Transaction Outbox
- ✅ Transactions are immutable from a user perspective as expected (PDF clarifies they cannot be modified/deleted), however for the purposes above, it is valid and in fact correct to hold and modify a transaction STATUS
- ❌ Transactions don't define a format of their ID - will assume a UUID format (e.g. crypto.randomUuid())

---

### 🔄 Idempotency & Concurrency

- ❌ No idempotency key support (e.g., for deposits).
- ❌ No ETag, `If-Match`, or optimistic locking on PATCH endpoints — race conditions possible.

---

### 🧪 Error Handling

- ✅ Some 404 cases included but not consistently across all paths.

---

### 🔒 AuthZ & Token Claims

- ❌ No definition of expected JWT claims or how userId is extracted/enforced.
- ❌ No structured way to verify resource ownership beyond assumed match with `userId`.

---

### 📄 Documentation Gaps

- ❌ Endpoint descriptions are mostly missing.

---

### 🚨 Miscellaneous Omissions

- ❌ No pagination, filtering or sorting hints on list endpoints (e.g., transactions).
- ❌ No multi-user roles (e.g., admin vs end-user) — not required here, but unmentioned.

---

## Summary

These gaps don’t prevent building a working prototype, but highlight key areas where additional structure, validation, or documentation would be needed in a production API — especially one operating in the financial domain.

I’ve worked around these with code-level enforcement, and documented decisions in `THINKING.md`.
