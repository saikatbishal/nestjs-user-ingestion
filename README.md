# NestJS User & Document Management Backend

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup & Seeding](#database-setup--seeding)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Design Decisions](#design-decisions)
- [Performance & Scalability](#performance--scalability)
- [Microservices & Integration](#microservices--integration)
- [Logging & Monitoring](#logging--monitoring)
- [CI/CD & Deployment](#cicd--deployment)
- [Third-Party Libraries](#third-party-libraries)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

A modular, scalable NestJS backend for user authentication, document management, and ingestion controls. Designed for maintainability, testability, and cloud-readiness.

## Features

- JWT-based authentication (register, login, logout)
- Role-based access control (admin, editor, viewer)
- User management (CRUD, role assignment)
- Document management (CRUD, upload)
- Ingestion process management and triggering
- Modular code structure with independent modules
- Unit and integration tests for all modules
- Database seeding for large datasets

## Architecture

- **NestJS** (TypeScript, modular)
- **PostgreSQL** (recommended, can be swapped)
- **JWT** for authentication
- **Microservices-ready** (integration points for Python ingestion backend)

## Folder Structure

```
/ (project root)
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── auth/
│   ├── users/
│   ├── documents/
│   ├── ingestion/
│   ├── common/
│   └── database/
├── test/
├── docker/
├── docker-compose.yml
├── README.md
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL (local or cloud)
- Git

### Installation

```zsh
git clone https://github.com/your-username/nestjs-user-docs-app.git
cd nestjs-user-docs-app
npm install
```

## Environment Variables

Create a `.env` file in the root:

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/nestdb
JWT_SECRET=your_jwt_secret
```

See `.env.example` for all options.

## Database Setup & Seeding

1. Ensure PostgreSQL is running and `DATABASE_URL` is set.
2. Run migrations (if using TypeORM/Prisma):
   ```zsh
   # Example for TypeORM
   npm run typeorm:migrate
   # Example for Prisma
   npx prisma migrate dev
   ```
3. Seed the database with large test data:
   ```zsh
   npm run seed
   ```

## Running the Application

```zsh
npm run start:dev
```

The server will start on `http://localhost:3000` by default.

## API Documentation

- API endpoints are documented using Swagger (if enabled):
  - Visit `http://localhost:3000/api` for Swagger UI.
- **Authentication**
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/logout`
- **User Management**
  - `GET /users`
  - `POST /users`
  - `PATCH /users/:id`
  - `DELETE /users/:id`
- **Document Management**
  - `GET /documents`
  - `POST /documents`
  - `PATCH /documents/:id`
  - `DELETE /documents/:id`
- **Ingestion**
  - `POST /ingestion/trigger`
  - `GET /ingestion/processes`

## Testing

- Run all tests:
  ```zsh
  npm run test
  ```
- Run tests with coverage:
  ```zsh
  npm run test:cov
  ```
- Coverage target: **90%+**

## Design Decisions

- **Modular structure**: Each domain (auth, users, documents, ingestion) is a separate module.
- **DTOs**: Used for input validation and type safety.
- **Guards & Interceptors**: For authentication, authorization, and logging.
- **Database**: PostgreSQL for relational data and scalability.
- **Microservices**: Ingestion module is designed for inter-service communication.

## Performance & Scalability

- Designed for large datasets (1000+ users, 100,000+ documents).
- Efficient queries and pagination implemented.
- Caching and indexing strategies recommended for production.

## Microservices & Integration

- Ingestion module can communicate with a Python backend via HTTP/gRPC/RabbitMQ.
- See `/src/ingestion/` for integration points.

## Logging & Monitoring

- Custom logger in `/src/common/logging/` (or use NestJS built-in logger).
- Error handling via global filters.
- Monitoring hooks can be added (e.g., Prometheus, Sentry).

## CI/CD & Deployment

- **GitHub Actions** workflow example in `.github/workflows/` (add as needed).
- Deployment steps:
  1. Clone repo
  2. Install dependencies
  3. Set up environment variables
  4. Run migrations and seed
  5. Start the app
- Docker and Kubernetes configs available in `/docker/` (if needed)

## Third-Party Libraries

- **@nestjs/jwt**: JWT authentication
- **@nestjs/typeorm** or **@prisma/client**: ORM
- **class-validator**: DTO validation
- **swagger**: API docs
- **bcryptjs**: Password hashing

## Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a pull request


---
Nestjs take-home assignment project
