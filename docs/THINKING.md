### 📅 24/06/2025 – Initial Analysis & Gotchas

#### ✅ Decision: Stack Selection
- Chose **NestJS with TypeScript** to align with my recent experience and give me a well-structured backend out of the box.
- It mirrors Spring Boot conceptually, which fits Barclays’ environment and mindset well.

#### ⚠️ Gotcha: No Auth Endpoint Specified
- The OpenAPI spec includes no authentication routes or schema.
- Yet the brief explicitly asks for a user to authenticate and use a JWT.
- **Decision**: Implement a `POST /auth/login` endpoint and secure all routes (except user creation) with JWT + Bearer scheme.
- Also decided to manually update the OpenAPI decorators to reflect the security model.

#### ⚠️ Gotcha: No Password Field in User Schema
- The schema lacks `password`, yet authentication is expected.
- **Decision**: Add a `password` field in the user DTO, hash it using `bcrypt`, and exclude it from any public-facing responses.

#### ⚠️ Gotcha: OpenAPI Spec Incomplete or Misaligned
- Several response codes mentioned in the brief (e.g. `422 Unprocessable Entity`, `403 Forbidden`, `409 Conflict`) are not included in the OpenAPI spec.
- **Decision**: Extend controller decorators to reflect all scenario-based status codes as per the PDF brief — not just what's in the spec file.

#### ⚠️ Gotcha: No Mention of Uniqueness Constraints
- No validation for email/username uniqueness in spec or models.
- **Decision**: Enforce uniqueness at the service layer for now; in a real app, this would likely be DB-level with a unique index.

#### ⚠️ Gotcha: Ownership Checks Are Implied, Not Explicit
- All access control scenarios (e.g. "cannot fetch another user's account") rely on `userId`, but there’s no explanation of how the system links token claims to resource ownership.
- **Decision**: Token will carry `userId` claim, which is used in a route guard to enforce resource ownership.
