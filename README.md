# Sentinel Desk — Secure Web Application

Sentinel Desk is a full-stack cybersecurity internship project that demonstrates secure application design for authenticated personal records. The application combines OAuth authentication, server-side role-based access control, ownership-aware CRUD operations, Zod validation, audit logging, and an OWASP-focused security documentation page in one working interface.

The project was designed to show how secure coding principles become visible product behavior: users can manage only their own notes, administrator operations are enforced on the server, malformed input is rejected before persistence, and security-relevant events are recorded for review.

## Project Highlights

| Area | Implementation |
| --- | --- |
| Authentication | Manus OAuth with protected session-aware routes |
| Authorization | Server-enforced `admin` and `user` roles using tRPC middleware |
| Secure data access | Notes are scoped to the authenticated owner for read, update, and delete operations |
| Input validation | Zod schemas validate note and audit-event data before persistence |
| Administration | Admin console with user directory, roles, last sign-in timestamps, and recent audit activity |
| Auditability | Login, logout, note creation, note updates, and note deletion are recorded as audit events |
| Security education | OWASP-focused security controls page explaining the project’s defensive design |
| Resilience | Loading, empty, error, and retry states are provided for data-driven interfaces |
| Identity handling | Locally customized administrator display names persist across OAuth sign-in cycles |

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui
- **Backend:** Node.js, Express 4, tRPC 11
- **Database:** MySQL with Drizzle ORM
- **Security:** Manus OAuth, server-side RBAC, ownership checks, Zod validation, audit logging
- **Testing:** Vitest and TypeScript compiler checks
- **Hosting:** Manus Web App hosting with GitHub synchronization

## Application Areas

### Overview

The authenticated dashboard presents the security posture of the workspace, provides navigation to protected tools, and explains how validation, authorization, and observability work together.

### My Notes

Authenticated users can create, read, update, and delete personal notes. Every operation is validated on the server, and ownership checks prevent one user from accessing another user’s records. The interface includes explicit loading, empty, error, and retry states.

### Admin Console

The admin console is available only to users with the `admin` role. It presents a user directory, role information, last sign-in timestamps, audit-event counts, and recent security activity. The authorization boundary is enforced by a server-side admin procedure rather than by frontend visibility alone.

### Security Controls

The security page maps the implementation to practical OWASP-oriented controls, including authentication, authorization, input validation, data protection, auditability, and defensive error handling.

## Security Design

> Security decisions are enforced at the backend boundary first and reflected in the frontend second.

The application uses protected tRPC procedures for authenticated operations and a dedicated admin procedure for administrator-only operations. Note queries and mutations include the authenticated user identifier so that ownership is enforced at the database access layer. Zod schemas reject malformed or incomplete inputs before they reach persistence logic. Audit events are validated before insertion and include the actor, event type, and relevant metadata.

The OAuth user upsert flow treats the provider name as an initial identity value. Once a local display name exists, subsequent OAuth sign-ins preserve it. This prevents a customized administrator name from being replaced by a provider username during a new login session.

## Project Structure

```text
client/
  src/
    components/       Shared layout and UI components
    pages/            Overview, notes, admin, security, and fallback pages
    lib/trpc.ts       Typed tRPC client
    App.tsx           Application routes and providers

drizzle/
  schema.ts           Users, notes, and audit-log database schema

server/
  db.ts               Database helpers and audit integration
  routers.ts          Authentication, notes, and admin procedures
  *.test.ts           Vitest security and behavior tests
  _core/              OAuth, session, server, and framework infrastructure

shared/
  security.ts         Shared Zod security schemas and validation rules

docs/
  auth-verification.md
  delivery-notes.md
  profile-name-verification.md
  ui-auth-verification-harness.md
```

## Local Development

The project uses Node.js and pnpm. A configured MySQL-compatible database and the application’s OAuth environment variables are required for the full authenticated workflow.

```bash
pnpm install
pnpm dev
```

The development server starts the React frontend and Express/tRPC backend through the project’s standard development command. Do not commit secrets or local environment files.

## Verification Commands

Run the automated tests and static type checks with:

```bash
pnpm test
pnpm check
```

The test suite covers authentication and logout behavior, login and logout audit creation, note CRUD operations, ownership rejection, role authorization, validation failures, and the OAuth display-name persistence regression.

## Verification Evidence

The final verification confirmed that:

1. An authenticated user can open **My Notes**.
2. An administrator can open the **Admin Console**.
3. Signing out returns the application to the **Sign in to continue** gate.
4. The dashboard profile area displays **Mohammed Faizan Raza**.
5. The Admin Console user directory displays **Mohammed Faizan Raza** with the `admin` role.
6. The customized name remains intact after signing out and signing in again.

## Limitations and Future Improvements

This project is an educational and portfolio implementation rather than a production security certification. OAuth availability depends on the configured identity platform, and the benchmark environment does not replace a formal penetration test or threat-model review of a deployed organization’s infrastructure.

Potential future improvements include passwordless account recovery, stronger session monitoring, rate limiting, security headers configured through deployment infrastructure, automated dependency scanning, a formal CI pipeline, and expanded integration tests against a disposable database.

## Internship Context

**Project:** Secure Web Application

**Developer:** Mohammed Faizan Raza

**Purpose:** Cybersecurity internship evaluation project demonstrating secure authentication, authorization, validation, protected data access, auditability, and OWASP-oriented secure coding practices.

**Live application:** [Open the deployed application](https://secwebapp-hn6q79gm.manus.space)

**Repository:** [View the source code on GitHub](https://github.com/Mohammed-Faizan5/secure-web-app)

## License

This project is provided for educational, portfolio, and authorized defensive-security research purposes.
