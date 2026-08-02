# Progress Tracker — Resumate

Update this file after every meaningful implementation change.

## Current Phase

- Feature 03: Email Verification

## Current Goal

- TBD

## Completed

- Feature 01: Project Setup — Express server, MongoDB Atlas connection, Backblaze B2 client configuration, and health check completed.
- Feature 02: Auth Core — User model, authService (signup/login/generateToken/getCurrentUser), authController, authMiddleware (httpOnly cookie JWT), authRoutes with rate limiting, CORS updated with credentials, cookie-parser added.

## In Progress

- None yet.

## Next Up

- Feature 03: Email Verification

## Open Questions

-

## Architecture Decisions

- File storage uses Backblaze B2 through its S3-compatible API and the existing AWS SDK v3 client.
- Auth uses httpOnly cookie (cookie-parser) for JWT transport — never exposed to client JS.
- Password hashing done explicitly in authService (not a pre-save hook) to keep models thin per code-standards.

## Session Notes

- Feature 01 static checks and B2 client configuration passed. Mike confirmed the live MongoDB Atlas connection works.
- Feature 02: All dependencies were already present in package.json. CLIENT_ORIGIN added to .env.example — Mike must add the value to .env directly.
