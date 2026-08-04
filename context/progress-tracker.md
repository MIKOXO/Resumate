# Progress Tracker — Resumate

Update this file after every meaningful implementation change.

## Current Phase

- Feature 04: Password Reset

## Current Goal

- TBD

## Completed

- Feature 01: Project Setup — Express server, MongoDB Atlas connection, Backblaze B2 client configuration, and health check completed.
- Feature 02: Auth Core — User model, authService (signup/login/generateToken/getCurrentUser), authController, authMiddleware (httpOnly cookie JWT), authRoutes with rate limiting, CORS updated with credentials, cookie-parser added.
- Feature 03: Email Verification — User model extended with `verificationCode`/`verificationCodeExpiry`/`lastCodeSentAt`, `emailService` (Nodemailer, generic `sendEmail`), `generateVerificationCode`/`verifyEmail`/`resendVerificationCode` in authService, login gated on `emailVerified`, verify-email (protected, sets cookie) and resend-code (rate-limited, email-body lookup) endpoints. All checklist items verified end-to-end against live Gmail SMTP.

## In Progress

- None yet.

## Next Up

- Feature 04: Password Reset (spec not yet written)

## Open Questions

- None currently open.

## Architecture Decisions

- File storage uses Backblaze B2 through its S3-compatible API and the existing AWS SDK v3 client.
- Auth uses httpOnly cookie (cookie-parser) for JWT transport — never exposed to client JS.
- Password hashing done explicitly in authService (not a pre-save hook) to keep models thin per code-standards.
- Verification codes are single-use and time-bound (10 min expiry), cleared from the User record on successful verification, per architecture invariant 8.

## Session Notes

- Feature 01 static checks and B2 client configuration passed. Mike confirmed the live MongoDB Atlas connection works.
- Feature 02: All dependencies were already present in package.json. CLIENT_ORIGIN added to .env.example — Mike must add the value to .env directly.
- Feature 03 (in progress): emailService created, User model extended, authService/controller/routes updated for verification and resend. Mike must add EMAIL_* values to .env before signup emails will send.
- Feature 03 (complete): EMAIL_* vars were already set in .env — signup emails send successfully via Gmail SMTP (250 OK). Full flow tested against live DB: signup sends code, unverified login returns 403, wrong code → "Invalid verification code", expired code → "code expired", correct code verifies + sets cookie, resend within 60s → 429 "Please wait N seconds", resend after cooldown issues new code that invalidates the old one, resend to unknown email returns generic success, server starts cleanly. All test users cleaned up.
