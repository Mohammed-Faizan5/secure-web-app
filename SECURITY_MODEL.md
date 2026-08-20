# Secure Application Security Model

## Domain vocabulary

A **user** is an authenticated identity represented by the built-in OAuth-backed `users` table. A **regular user** may manage only their own notes. An **admin** may inspect user and audit information but remains subject to the same authenticated session boundary. A **note** is private user-owned content stored in the database. An **audit event** is an append-only security-relevant record describing authentication or data-management activity.

## Trust boundaries

The browser is an untrusted client. All authorization, ownership checks, validation, and audit-event creation occur on the server. The database is accessed only through server-side helpers and typed procedures. Session cookies are HTTP-only, secure, signed, and same-site according to the existing OAuth/session infrastructure.

## Security assumptions

The application is intended for authorized defensive-security demonstration and internship evaluation. OAuth identity is the source of authentication truth. Client-side route visibility is treated as presentation only; protected procedures enforce authorization independently. User-controlled note fields are validated with Zod before persistence, and database queries scope records by the authenticated user identifier.

## Required controls

The implementation must demonstrate authentication, role-based authorization, server-side ownership checks, input validation, safe rendering, secure session handling, auditability, and explicit handling of loading, empty, and error states. The security information page will describe these controls and their limitations without claiming that the application is immune to all vulnerabilities.
