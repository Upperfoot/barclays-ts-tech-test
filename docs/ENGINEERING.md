# Engineering Approach & Methodology

This document outlines how I approached the Eagle Bank API project from an engineering principles perspective — including the decisions I made, the conventions I followed, and the things I consciously left out given the scope.

---

## 🧠 Development Principles

While this is a take-home task, I’ve tried to keep things grounded in the way I’d approach a real-world service — balancing speed and clarity with some nods to longer-term maintainability.

### ✅ DRY (Don’t Repeat Yourself)

- Reused validation decorators and DTOs rather than duplicating logic between controller and service layers.
- Avoided “just get it done” copies — especially around user/account ownership checks and error shaping.

### ✅ SOLID

- Controllers are thin; they delegate logic to services.
- Business logic lives in services, and access control is handled via route guards.
- Nest's dependency injection container keeps things loosely coupled and testable.

### ✅ TDD Where It Made Sense

- I used Jest and `@nestjs/testing` to write focused unit tests, particularly around core logic and error paths.
- Contract testing via Pact is included to show awareness of integration boundaries, even though there’s no real frontend consumer.
- I didn't try to test absolutely everything — I prioritised flows with access logic, validation, and risk of regressions.

### ✅ Auto-Generated Swagger Documentation
- I used NestJS/Swagger package to auto generate living documentation on the current OpenAPI spec
- Prevents documentation drift from implementation

---

## Architectural Notes

- In line with CAP theory, this application treats monetary operations as strongly consistent, while accepting eventual consistency at the presentation layer. This mirrors the model used by real-world financial institutions, where performance and user experience are balanced with transactional integrity.
- Account Display Balances may be eventually consistent, but Transactional Success/Failure modes must be strongly consistent 
- Transactions will be handled via the [Transaction Outbox](https://microservices.io/patterns/data/transactional-outbox.html) pattern, and each Transactions has an Idempotency key attached to prevent duplicate requests - this requires a transaction ingress (API request handlers), and a transaction processor (transaction worker CLI)

## 🛠 Decisions Taken

Some specific choices I made to help simplify or clarify the build:

- Opted for **NestJS** over raw Express to get structure, DI, and Swagger support quickly.
- Used **TypeScript** for safety and expressiveness — it’s also what I’ve been working with most recently.
- Could have set up **Docker + Compose** for local setup and portability, however I have kept this simple via my tech choices (e.g. SQLite)
- Full e2e test coverage, focus on testing producer boundaries
- JWT auth was handled via Passport strategy and guarded routes — roughly mirroring Spring Security flows.
- I kept the code style close to idiomatic NestJS, using pipes, interceptors, and guards where appropriate.
- As with any type of money handling, working with purely integers to prevent rounding errors and letting presentation layer handle the display format - Could add information on Currency on display format
- I was thinking of implementing a simple Transactional Outbox system to split concerns of Transaction Intent from Transactional Outcome and allow OOB processing, I've instead called our ProcessTransactionHandler inline - but have done tests to ensure transactional locks are in place for requests coming in at the same moment - this ProcessTransactionHandler can be moved out into a separate Queue System for OOB processing

---

## 🤔 Things I Skipped (On Purpose)

- Internationalisation (i18n), currency conversion, or multi-user roles (could be future layers)
- Event-Driven systems/Asynchronous patterns (e.g. CDC, 2PC, Event Sourcing)

---

## 💬 Summary

This project wasn’t about cramming in everything — it was about delivering something clean, explainable, and extensible, using the patterns I tend to reach for in real-life systems.

If you have questions about trade-offs or anything I didn’t cover, I’m happy to walk through the reasoning.

