# Technology & Framework Choices

This doc outlines why I chose the tech stack I did for the Eagle Bank API take-home project — what worked well, and how it maps to more traditional stacks like Java Spring Boot.

---

## 🧠 Language: TypeScript

TypeScript felt like the right fit for this exercise for a few reasons:

- It's what I’ve been working with most recently, so I can be productive with it.
- Strong typing is great for working to a fixed contract (like the OpenAPI spec).
- It makes data contracts and error handling more explicit — which helps when dealing with banking-style domain logic.
- The editor tooling, refactoring safety, and autocomplete are all solid — especially when scaling out to more modules or domain types.

I also find TypeScript encourages me to think more carefully about state shape and error cases up front.

---

## 🚀 Framework: NestJS

I opted for [NestJS](https://nestjs.com/) because it gives me a good structure out of the box and scales well even for small projects like this. It’s built on top of Express (or Fastify), but gives you:

- A clear modular layout (controllers, services, DTOs, guards, etc.)
- Dependency injection similar to Spring’s
- Swagger/OpenAPI integration from decorators (`@ApiResponse`, `@ApiProperty`, etc.)
- First-class support for testing with Jest
- Middleware, interceptors, pipes — all the bits you’d expect in a larger backend framework

It helps me move quickly while still keeping the code readable, testable, and aligned with enterprise-style practices.

---

## 🪜 NestJS vs Spring Boot (Quick Comparison)

| Feature                     | NestJS (TypeScript)                  | Spring Boot (Java)                    |
|----------------------------|--------------------------------------|---------------------------------------|
| Language                   | TypeScript                           | Java                                  |
| DI & Modules               | ✅ Out of the box                     | ✅ Out of the box                      |
| Request validation         | ✅ `class-validator` + pipes          | ✅ `javax.validation.*`                |
| OpenAPI support            | ✅ `@nestjs/swagger` decorators       | ✅ `springdoc-openapi` or Swagger libs|
| Auth (JWT, guards)         | ✅ Built-in guard pattern             | ✅ Spring Security                     |
| Testing framework          | ✅ Jest + `@nestjs/testing`           | ✅ JUnit + Mockito                     |
| Fast prototyping           | ✅ Very quick                         | 🟡 Heavier setup                       |
| Enterprise familiarity     | 🟡 Gaining traction                   | ✅ Industry standard                   |

I chose Nest because I wanted to strike the right balance between velocity and structure — and it gave me what I needed to implement things like route guards, request validation, and Swagger with minimal overhead.

---

## 🔍 Why Not [X]?

Just for completeness:

- I considered using plain Express with middleware and `zod` validation — but I knew I’d end up recreating structure Nest gives me out of the box.
- I didn't go with Fastify directly as performance wasn't the bottleneck here, and I prefer the Nest abstraction when the domain logic grows.
- Java/Spring Boot would’ve been totally valid, but given I’ve been living more in TypeScript lately, I felt this was the most representative of how I work right now — and still maps conceptually to the Java world for anyone reviewing it.

---

Let me know if you’d like me to walk through the modules or how certain parts were structured — happy to talk through anything in detail.
