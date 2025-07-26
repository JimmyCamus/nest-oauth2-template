<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="90" alt="Nest Logo" /></a>
</p>

<h1 align="center">Nest OAuth2 Template</h1>

A robust, modular NestJS template for building secure, scalable applications with OAuth2 authentication (Google & Github), JWT, Redis, PostgreSQL, and best practices for configuration and testing.

---

## Features

- **NestJS 11+** modular architecture
- **OAuth2 authentication** with Google and Github (Passport strategies)
- **JWT-based session management**
- **Redis** for session and cache management
- **PostgreSQL** as the main database (TypeORM integration)
- **Centralized configuration** with validation and custom exceptions
- **Logging** with [nestjs-pino](https://github.com/iamolegga/nestjs-pino)
- **Rate limiting** with Throttler
- **Unit and e2e testing** with mocks and real integrations
- **Extensible structure** for adding new OAuth providers or modules

---

## Main Endpoints

- `GET /health`  
  Returns application status and uptime.

- `GET /auth/google`  
  Redirects to Google OAuth2.

- `GET /auth/google/redirect`  
  Handles Google OAuth2 callback.

- `GET /auth/github`  
  Redirects to Github OAuth2.

- `GET /auth/github/redirect`  
  Handles Github OAuth2 callback.

- `GET /auth/profile`  
  Returns authenticated user profile (requires valid JWT/session).

---

## Configuration

All environment variables are validated at startup.  
Example `.env` file:

```
NODE_ENV=development
PORT=8000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/redirect

# Github OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:8000/auth/github/redirect

AUTH_REDIRECT_URL=http://localhost:8000/auth/profile

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=yourdb

# JWT
JWT_SECRET=your-jwt-secret

# Redis
REDIS_HOST=localhost
REDIS_PASSWORD=yourredispassword
```

---

## How to Run

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up your `.env` file** (see example above).

3. **Start the application:**
   ```bash
   pnpm start
   ```
   The app will run on the port specified in your `.env` (`PORT`).

---

## Testing

- **Unit tests:**

  ```bash
  pnpm test
  ```

- **End-to-end (e2e) tests:**
  ```bash
  pnpm test:e2e
  ```
  You can use mocks for Redis and Postgres in-memory for the database to speed up CI/CD and local testing.

---

## Extending the Template

- Add new OAuth providers in `src/auth/strategies/`.
- Customize configuration validation in `src/config/lib/validate.ts`.
- Add new endpoints and modules following the modular structure.

---

## Requirements

- Node.js 18+
- PostgreSQL and Redis (or their mocks for testing)
- pnpm package manager

---

## License

MIT

---

## Author

Jeremy Camus Varela

---

## Contributions

Pull requests and suggestions are welcome!
