### 📅 24/06/2025 – Project Log (Initial Setup + Accounts Creation + Listings)

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

### Testing against original openapi.yaml spec
- My thoughts and evolution of this has diverged somewhat, I was planning to do a simple comparison of yaml versus original yaml 
  from the specification, but the improvements I've made to showcase breadth and depth of understanding have made this difficult
  to compare like for like (authentication handlers, idempotency keys, changes in schema)

## Wrap Up

So successfully created the start of the project, hooked up our data layer (SQLite), Swagger Documentation start, Class Validation & Transformation, and also managed to get an Integration Test together of our Account creation and listing (without authentication for now) - tomorrow's focus is going to be on authentication with Passport & JWT tokens, storing our userId (uuid) as the sub (subject)

Also added a little video demo of my progress thus far

### 📅 25/06/2025 – Project Log - Authentication + Authorisation

- Integrated JWT Passport, adding our JWT Strategy and AuthServices
- Added Users & User Entities
- Requires updating our existing E2E tests to include authorisation, will add helpers
- Not focusing on Unit Tests yet for Internal Logic, will continue focusing on large impact tests (E2E)

## User Endpoints

- As spoke about before will derive the userId from the JWT token in the payload, no need to pass this about