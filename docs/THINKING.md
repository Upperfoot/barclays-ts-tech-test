### 📅 24/06/2025 – Project Log

#### ✅ Decision: Use SQLite

- Chose SQLite as the database layer for this take-home due to its simplicity and zero-setup model.
- No need to install or run a separate DB server or Docker — it runs entirely in-process, which is ideal for a reviewable project.
- Transactions are fully supported, which is critical for withdrawal flows and enforcing account balance consistency.
- The `.sqlite` file can be committed or generated at runtime using migrations, ensuring reproducibility.
- However SQLite isn't designed for production systems that require horizontal scale or multi-process access.

#### ✅ Decision: Use TypeORM for ORM + Synchronise for ease of Development

- Chose TypeORM for data modelling due to:
  - Native support in NestJS
  - Familiar class-based decorators for entities
  - Ability to generate and run SQL migrations from those definitions
  - TypeORM also offers transactional query execution, which will be used for deposit/withdrawal logic.
  - Used `synchronize: true` - However... this does not simulate how schema would be managed in a production codebase, controlled migrations are much better suited (e.g., Barclays context)



