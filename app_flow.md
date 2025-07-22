# Application Flow & Structure Guide

This document explains the structure, purpose, and interconnections of all files and folders in the NestJS backend application for user, document, and ingestion management.

---

## Root Directory

- **README.md**: Project overview, setup, and usage instructions.
- **package.json**: Project dependencies, scripts, and metadata.
- **tsconfig.json**: TypeScript configuration.
- **jest.config.js**: Jest testing configuration.
- **.env / .env.example**: Environment variables for configuration (e.g., DB credentials).
- **exercise_details.md**: Exercise requirements and specifications.

---

## src/ (Main Source Folder)

### Core Entry

- **main.ts**: Application bootstrap file. Starts the NestJS server and applies global filters/interceptors.
- **app.module.ts**: Root module. Imports all feature modules and global providers.

### Feature Modules

#### 1. **auth/** (Authentication & Authorization)

- **auth.module.ts**: Auth module definition. Registers controllers/services for authentication.
- **auth.controller.ts**: Handles login, registration, and authentication endpoints.
- **auth.service.ts**: Business logic for authentication (JWT, password hashing, user validation).
- **jwt.strategy.ts**: Passport JWT strategy for validating tokens.
- **jwt-auth.guard.ts**: Guard to protect routes using JWT.
- **roles.guard.ts**: Guard for role-based access control.
- **dto/**: Data Transfer Objects for login and registration requests.

#### 2. **users/** (User Management)

- **users.module.ts**: User module definition.
- **users.controller.ts**: Handles user CRUD endpoints.
- **users.service.ts**: Business logic for user management (CRUD, find, create, update, etc.).
- **user.entity.ts**: TypeORM entity for the User table.
- **roles.enum.ts**: Enum for user roles (e.g., ADMIN, USER).
- **dto/**: DTOs for creating and updating users.

#### 3. **documents/** (Document Management)

- **documents.module.ts**: Document module definition.
- **documents.controller.ts**: Handles document CRUD endpoints.
- **documents.service.ts**: Business logic for document management.
- **document.entity.ts**: TypeORM entity for the Document table.
- **dto/**: DTOs for creating and updating documents.

#### 4. **ingestion/** (Ingestion Process Management)

- **ingestion.module.ts**: Ingestion module definition.
- **ingestion.controller.ts**: Handles ingestion process endpoints (trigger, status, etc.).
- **ingestion.service.ts**: Business logic for ingestion processes.
- **ingestion-process.entity.ts**: TypeORM entity for ingestion process records.
- **dto/**: DTO for triggering ingestion.

#### 5. **database/** (Database Integration & Seeding)

- **database.module.ts**: Database module definition. Registers TypeORM and DB providers.
- **database.providers.ts**: TypeORM connection and entity providers.
- **seed.ts**: Script to seed the database with initial data (users, documents, etc.).

### Common Utilities & Infrastructure

#### **common/**

- **decorators/**
  - **roles.decorator.ts**: Custom decorator for role-based access control.
- **filters/**
  - **http-exception.filter.ts**: Global HTTP exception filter for error handling.
  - **validation-exception.filter.ts**: Handles validation errors from DTOs.
- **interceptors/**
  - **logging.interceptor.ts**: Logs incoming requests and responses.
  - **transform.interceptor.ts**: Transforms responses to a consistent format.
- **utils/**
  - **pagination.util.ts**: Utility for paginating query results.
  - **error.util.ts**: Utility for standardized error responses.
  - **uuid.util.ts**: Utility for generating UUIDs.

---

## How Everything Connects

- **app.module.ts** imports all feature modules (auth, users, documents, ingestion, database) and registers global providers (filters, interceptors).
- **main.ts** bootstraps the app, applies global filters/interceptors, and starts the server.
- **Feature modules** (auth, users, documents, ingestion) are self-contained, each with their own controller, service, entity, and DTOs.
- **Database module** provides TypeORM integration and is imported by feature modules to access entities.
- **Common folder** provides reusable decorators, filters, interceptors, and utilities used across the app.
- **Guards and decorators** in the auth module and common folder enforce authentication and role-based access control on protected routes.
- **Seeding script** (`seed.ts`) can be run to populate the database with initial data for development/testing.

---

## Summary Table

| Folder/File       | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| src/app.module.ts | Root module, imports all feature modules            |
| src/main.ts       | App entry point, bootstraps NestJS server           |
| src/auth/         | Authentication & authorization logic                |
| src/users/        | User management (CRUD, roles)                       |
| src/documents/    | Document management (CRUD)                          |
| src/ingestion/    | Ingestion process management                        |
| src/database/     | Database config, providers, seeding                 |
| src/common/       | Shared decorators, filters, interceptors, utilities |

