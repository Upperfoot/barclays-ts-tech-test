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

## 🛠 Decisions Taken

Some specific choices I made to help simplify or clarify the build:

- Opted for **NestJS** over raw Express to get structure, DI, and Swagger support quickly.
- Used **TypeScript** for safety and expressiveness — it’s also what I’ve been working with most recently.
- Used **Docker + Compose** for local setup and portability, without introducing too much infra.
- JWT auth was handled via Passport strategy and guarded routes — roughly mirroring Spring Security flows.
- I kept the code style close to idiomatic NestJS, using pipes, interceptors, and guards where appropriate.

---

## 🤔 Things I Skipped (On Purpose)

- Full e2e test coverage (out of scope, but could be added easily with `@nestjs/testing`)
- Advanced DB constraints and rollback logic for transactions — just out of scope for now
- Internationalisation (i18n), currency conversion, or multi-user roles (could be future layers)

---

## 💬 Summary

This project wasn’t about cramming in everything — it was about delivering something clean, explainable, and extensible, using the patterns I tend to reach for in real-life systems.

If you have questions about trade-offs or anything I didn’t cover, I’m happy to walk through the reasoning.

