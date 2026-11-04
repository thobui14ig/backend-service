# Project context

This repository contains the NestJS/TypeScript backend for Thotool. The React
frontend is maintained separately in `frontend-user`.

## Application responsibilities

- Authentication, user/reseller/sub-user management, and service renewals.
- APIs for links, comments, Facebook groups/pages, TikTok users, and phone
  customer workflows.
- Proxy, token, VPS, order, transaction, notification, and configuration
  services.
- Dashboard statistics and supporting application endpoints.
- PostgreSQL/MySQL support is configured through environment variables and
  TypeORM in `src/app.module.ts`.

## Architecture and conventions

- Feature modules live under `src/modules`; shared application endpoints are
  under `src/app`; shared guards and utilities are under `src/common`.
- Preserve the existing application/use-case/port/infrastructure separation.
  Put business rules in use cases, persistence in infrastructure adapters, and
  define dependencies through application ports and module providers.
- Keep controllers focused on HTTP concerns and continue using the existing
  authentication and role guards.
- Inspect the matching frontend API client and route before changing an
  endpoint; keep request/response contracts compatible unless the task requires
  a coordinated change.
- Do not put credentials or environment-specific secrets in source code.
- Validate backend changes with focused Jest tests where available and
  `npm run build`.
