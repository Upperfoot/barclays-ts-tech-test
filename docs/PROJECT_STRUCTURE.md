# 🧱 Project Structure Overview

This project is a modular **NestJS API** following a clean domain-driven design with clearly separated concerns for maintainability and testability.

## 📁 Root Files

```txt
main.ts                # App bootstrap
app.module.ts          # Root module
app.service.ts         # App-wide providers
app.controller.ts      # Health check or root route
```

---

## 📦 Domain Modules

### `accounts/`
Handles account lifecycle operations.

```txt
accounts.controller.ts
account.entity.ts
accounts.module.ts
handlers/
  ├─ create.account.handler.ts
  ├─ delete.account.handler.ts
  ├─ list.account.handler.ts
  └─ patch.account.handler.ts
```

---

### `auth/`
Manages authentication, JWT handling, and guards.

```txt
auth.controller.ts
auth.module.ts
auth.service.ts
jwt.strategy.ts
jwt.guard.ts
handlers/
  └─ login.handler.ts
```

---

### `transactions/`
Handles transaction logic including creation and processing.

```txt
transactions.controller.ts
transactions.module.ts
transaction.entity.ts
handlers/
  ├─ create.transaction.handler.ts
  ├─ get.transaction.handler.ts
  ├─ list.transaction.handler.ts
  └─ process.transaction.handler.ts
```

---

### `users/`
Responsible for user management (create, read, update, delete).

```txt
users.controller.ts
users.module.ts
users.service.ts
user.entity.ts
handlers/
  ├─ create.user.handler.ts
  ├─ delete.user.handler.ts
  ├─ get.user.handler.ts
  └─ patch.user.handler.ts
```

---

## 🧩 Shared / Common Layer

Utilities and cross-cutting concerns that apply across the whole app.

```txt
common/
  ├─ app.setup.ts
  ├─ auth-test-helper.ts
  ├─ current-user.decorator.ts
  ├─ error-responses.decorator.ts
  ├─ helpers.ts
  ├─ idempotent.request.ts
  ├─ interfaces.ts
  └─ validation.filter.ts
```

---

## 🧪 Testing

Test specs are colocated with their respective modules:

```txt
app.controller.spec.ts
auth/auth.controller.spec.ts
transactions/transactions.controller.spec.ts
users/users.controller.spec.ts
accounts/accounts.controller.spec.ts
```

---

## ✅ Design Summary

- **Handler-based architecture**: Each action (e.g. create, delete) has its own handler for clean separation.
- **Domain-first** module layout: Files grouped by feature, not by type.
- **Shared utilities** live in a `common/` folder and support DRY principles.
- **Swagger-ready** with decorators like `@ApiHeader` and `@ApiTags`.
