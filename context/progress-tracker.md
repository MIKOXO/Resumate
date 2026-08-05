# Progress Tracker — Resumate

Update this file after every meaningful implementation change.

## Current Phase

- TBD (next spec not yet written)

## Current Goal

- TBD (next spec not yet written)

## Completed

- Feature 01: Project Setup — Express server, MongoDB Atlas connection, Backblaze B2 client configuration, and health check completed.
- Feature 02: Auth Core — User model, authService (signup/login/generateToken/getCurrentUser), authController, authMiddleware (httpOnly cookie JWT), authRoutes with rate limiting, CORS updated with credentials, cookie-parser added.
- Feature 03: Email Verification — User model extended with `verificationCode`/`verificationCodeExpiry`/`lastCodeSentAt`, `emailService` (Nodemailer, generic `sendEmail`), `generateVerificationCode`/`verifyEmail`/`resendVerificationCode` in authService, login gated on `emailVerified`, verify-email (protected, sets cookie) and resend-code (rate-limited, email-body lookup) endpoints. All checklist items verified end-to-end against live Gmail SMTP.
- Feature 04: Password Reset — User model extended with `resetCode`/`resetCodeExpiry`/`lastResetCodeSentAt`; shared `generateCode` helper and `validatePassword` extracted into authService (single source of truth, also used by signup); `requestPasswordReset` (enumeration-safe, 60s cooldown, resend-style limiter) and `resetPassword` (looks up user by `resetCode` + unexpired `resetCodeExpiry`, single combined "invalid or expired reset code" error, no email on submit; strength → bcrypt same-password rejection before any hash/save → hash+save, clears code fields, sets login cookie via controller); routes `POST /api/auth/forgot-password` (resendCodeLimiter) and `POST /api/auth/reset-password` (authLimiter). Syntax, pure logic, and validation-path checks passed; live e2e verification handled by Mike (Atlas connectivity restored on his side).
- Feature 05: Team Member CRUD — TeamMember model (name, indexed ownerId), teamMemberService (create/list/delete scoped to ownerId; delete has `// TODO: cascade-delete prospects once prospectService exists (Feature 06)`), controller + routes protected by authMiddleware. e2e verified: create 201/ownerId tag, empty name 400, owner-scoped list (no cross-visibility), delete 200 then 404, cross-user/unknown delete 404, no-cookie 401.
- Feature 06: Prospect CRUD — Prospect model, prospectService (upload/list/replace/delete + deleteAllProspectsForTeamMember), multer controller + routes, all authMiddleware-gated. Feature 05's cascade-delete TODO closed. e2e verified against live DB + B2: upload/replace/delete with real B2 objects, renamed .txt and >5MB rejected with 400, duplicate names allowed, owner-scoped list, cross-user 404, no-cookie 401. Test data cleaned up.

## In Progress

- None yet.

## Next Up

- Feature 07: (not yet written)

## Open Questions

- None currently open.

## Architecture Decisions

- File storage uses Backblaze B2 through its S3-compatible API and the existing AWS SDK v3 client.
- Auth uses httpOnly cookie (cookie-parser) for JWT transport — never exposed to client JS.
- Password hashing done explicitly in authService (not a pre-save hook) to keep models thin per code-standards.
- Verification codes are single-use and time-bound (10 min expiry), cleared from the User record on successful verification, per architecture invariant 8.
- Reset codes follow the same pattern as verification codes: single-use, 10-min expiry, cleared on successful reset. No session invalidation on password reset — accepted MVP limitation (stateless JWT, no session store).

## Session Notes

- Feature 01 static checks and B2 client configuration passed. Mike confirmed the live MongoDB Atlas connection works.
- Feature 02: All dependencies were already present in package.json. CLIENT_ORIGIN added to .env.example — Mike must add the value to .env directly.
- Feature 03 (in progress): emailService created, User model extended, authService/controller/routes updated for verification and resend. Mike must add EMAIL_* values to .env before signup emails will send.
- Feature 03 (complete): EMAIL_* vars were already set in .env — signup emails send successfully via Gmail SMTP (250 OK). Full flow tested against live DB: signup sends code, unverified login returns 403, wrong code → "Invalid verification code", expired code → "code expired", correct code verifies + sets cookie, resend within 60s → 429 "Please wait N seconds", resend after cooldown issues new code that invalidates the old one, resend to unknown email returns generic success, server starts cleanly. All test users cleaned up.
- Feature 04: Password Reset — reset code fields added, `generateCode`/`validatePassword` extracted as shared helpers, `requestPasswordReset`/`resetPassword` in authService, forgot/reset-password controllers + routes with rate limiting. Syntax/pure-logic/validation checks passed; live e2e confirmed by Mike after restoring Atlas access.
- Feature 04 refinement: `resetPassword` no longer requires email — client sends only `code` + `newPassword`; user looked up by `resetCode` + unexpired `resetCodeExpiry` (`User.findOne({ resetCode: code, resetCodeExpiry: { $gt: new Date() } })`). Single combined "invalid or expired reset code" error replaces the previously distinct invalid/expired messages (no useful distinction to surface without email). Email still required on `forgotPassword` (request step).
- Feature 05: TeamMember model + service + controller + routes (POST/GET /api/team-members, DELETE /:id, authMiddleware-gated). Prospect cascade-delete left as TODO in teamMemberService for Feature 06 — must wire `prospectService` deletion (and B2 file removal) there when Prospect model lands. All test data cleaned up.
- Feature 06: Notes — cascade delete uses a shared `getOwnedTeamMember` helper + dynamic `import()` to avoid an ESM circular import (prospectService also imports teamMemberService). DOCX MIME kept as a local const in prospectService + prospectController (no shared constants file exists yet). S3 DeleteObject is idempotent, so already-missing keys naturally proceed to the Mongo delete. Test data cleaned up.
