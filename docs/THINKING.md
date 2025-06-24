### 📅 24/06/2025 – Project Log

#### Use SQLite

- Chose SQLite as the database layer for this take-home due to its simplicity and zero-setup model.
- No need to install or run a separate DB server or Docker — it runs entirely in-process, which is ideal for a reviewable project.
- Transactions are fully supported, which is critical for withdrawal flows and enforcing account balance consistency.
- The `.sqlite` file can be committed or generated at runtime using migrations, ensuring reproducibility.
- However SQLite isn't designed for production systems that require horizontal scale or multi-process access.

#### Use TypeORM for ORM + Synchronise for ease of Development

- Chose TypeORM for data modelling due to:
  - Native support in NestJS
  - Familiar class-based decorators for entities
  - Ability to generate and run SQL migrations from those definitions
  - TypeORM also offers transactional query execution, which will be used for deposit/withdrawal logic.
  - Used `synchronize: true` - However... this does not simulate how schema would be managed in a production codebase, controlled migrations are much better suited (e.g., Barclays context)

### Use AppModule + Separate Modules for each Concern (isolation / better testing)

- AppModule (Root Entry Module)
- AccountsModule - Account Module, Controller, Entities, Handlers
- UsersModule - Account Module, Controller, Entities, Handlers
- TransactionsModule - Account Module, Controller, Entities, Handlers

### Conflict/Concurrency Resolution
- Transactions will store regardless of outcome if passed initial validation
- Transactions will be processed OOB by a Worker to ensure concurrency issues are handled (two or more transactions at the same time)
- Account Numbers & Sort Codes - Will keep this simple - use string-based accountNumber and sortCode values with fixed-length digit formats. A maximum of 5 retry attempts are made to avoid DB uniqueness violations, falling back to a 409 Conflict if generation fails. - Account Numbers in production - this would be managed by a dedicated issuance service with modulus validation, uniqueness, and auditability built-in.
- Idempotency keys will be added for Transactions to demonstrate, will avoid Accounts/Users for now