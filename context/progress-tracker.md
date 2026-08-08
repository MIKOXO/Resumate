# Progress Tracker — Resumate

Update this file after every meaningful implementation change.

## Current Phase

- Feature 12+ (frontend features begin, spec not yet written)

## Current Goal

- TBD (next spec not yet written)

## Completed

- Feature 01: Project Setup — Express server, MongoDB Atlas connection, Backblaze B2 client configuration, and health check completed.
- Feature 02: Auth Core — User model, authService (signup/login/generateToken/getCurrentUser), authController, authMiddleware (httpOnly cookie JWT), authRoutes with rate limiting, CORS updated with credentials, cookie-parser added.
- Feature 03: Email Verification — User model extended with `verificationCode`/`verificationCodeExpiry`/`lastCodeSentAt`, `emailService` (Nodemailer, generic `sendEmail`), `generateVerificationCode`/`verifyEmail`/`resendVerificationCode` in authService, login gated on `emailVerified`, verify-email (protected, sets cookie) and resend-code (rate-limited, email-body lookup) endpoints. All checklist items verified end-to-end against live Gmail SMTP.
- Feature 04: Password Reset — User model extended with `resetCode`/`resetCodeExpiry`/`lastResetCodeSentAt`; shared `generateCode` helper and `validatePassword` extracted into authService (single source of truth, also used by signup); `requestPasswordReset` (enumeration-safe, 60s cooldown, resend-style limiter) and `resetPassword` (looks up user by `resetCode` + unexpired `resetCodeExpiry`, single combined "invalid or expired reset code" error, no email on submit; strength → bcrypt same-password rejection before any hash/save → hash+save, clears code fields, sets login cookie via controller); routes `POST /api/auth/forgot-password` (resendCodeLimiter) and `POST /api/auth/reset-password` (authLimiter). Syntax, pure logic, and validation-path checks passed; live e2e verification handled by Mike (Atlas connectivity restored on his side).
- Feature 05: Team Member CRUD — TeamMember model (name, indexed ownerId), teamMemberService (create/list/delete scoped to ownerId; delete has `// TODO: cascade-delete prospects once prospectService exists (Feature 06)`), controller + routes protected by authMiddleware. e2e verified: create 201/ownerId tag, empty name 400, owner-scoped list (no cross-visibility), delete 200 then 404, cross-user/unknown delete 404, no-cookie 401.
- Feature 06: Prospect CRUD — Prospect model, prospectService (upload/list/replace/delete + deleteAllProspectsForTeamMember), multer controller + routes, all authMiddleware-gated. Feature 05's cascade-delete TODO closed. e2e verified against live DB + B2: upload/replace/delete with real B2 objects, renamed .txt and >5MB rejected with 400, duplicate names allowed, owner-scoped list, cross-user 404, no-cookie 401. Test data cleaned up.
- Feature 07: Python Docx Service — `docx-service/main.py` (FastAPI, POST /generate-section, try/except → JSON error), `docx-service/formatter.py` (body style detection by frequency tally, header style detection by bold/all-caps/size signals + known header words + dominant pattern, insert_core_competencies appends header + bullet paragraphs via in-memory BytesIO), `docx-service/requirements.txt`. Service starts cleanly with uvicorn. Marked complete by Mike.
- Feature 08: PDF Conversion & Naming — `docx-service/converter.py` (convert_to_pdf — uuid4 temp filenames, soffice --headless subprocess, always cleans up in finally block, raises RuntimeError with stderr on failure), `docx-service/naming.py` (build_filename — strips invalid chars, preserves internal spaces, parses YYYY-MM-DD → MMDDYYYY), `main.py` extended with POST /convert-to-pdf (multipart: file + prospect_name + company_name + date, returns PDF with Content-Disposition filename, 500 JSON on failure). Conversion verified working against real .docx file.
- Feature 09: Groq Integration — `server/src/services/groqService.js` (`generateCoreCompetencies` — OpenAI-compatible client pointed at Groq base URL, lazy-initialized so server starts cleanly without key set, fixed SQL Server prompt verbatim, strips leading `*`/`-`/`•` chars, drops empty lines, returns string array). `openai` package installed. `GROQ_API_KEY` added to `.env.example`. Live test confirmed: clean bullet array returned, no markdown chars, invalid key surfaces clear 401 error.
- Feature 10: Generate Endpoint — `server/src/services/generateService.js` (5-step orchestration: B2 GetObject download → Groq bullets → Python `/generate-section` → Python `/convert-to-pdf` → stream PDF back; `Promise.race` 30s timeout returns 504; each step throws a distinct named error), `generateController.js` (validates all 5 required fields, streams PDF with `Content-Type: application/pdf` + `Content-Disposition` from Python service), `generateRoutes.js` (`POST /api/generate`, auth-gated), mounted in `app.js`. `DOCX_SERVICE_URL` added to `.env.example`.
- Feature 11: Settings Endpoints — `authService.updateName` + `changePassword` (current-password check, strength policy, same-password rejection via shared `rejectSamePassword` helper reused by `resetPassword`). Controllers `updateName` + `changePassword` (success-only). Routes `PATCH /api/auth/me` + `PATCH /api/auth/password`, both behind `authMiddleware`. E2e verified: name update + empty-name 400, password change + wrong-current/same/weak rejections, `email` field ignored, 401 without cookie, `{ success: false, error }` shape, clean start. Final backend feature.

## In Progress

- None.

## Next Up

- Feature 12+ (frontend features; spec not yet written)

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
- Feature 03 (in progress): emailService created, User model extended, authService/controller/routes updated for verification and resend. Mike must add EMAIL\_\* values to .env before signup emails will send.
- Feature 03 (complete): EMAIL\_\* vars were already set in .env — signup emails send successfully via Gmail SMTP (250 OK). Full flow tested against live DB: signup sends code, unverified login returns 403, wrong code → "Invalid verification code", expired code → "code expired", correct code verifies + sets cookie, resend within 60s → 429 "Please wait N seconds", resend after cooldown issues new code that invalidates the old one, resend to unknown email returns generic success, server starts cleanly. All test users cleaned up.
- Feature 04: Password Reset — reset code fields added, `generateCode`/`validatePassword` extracted as shared helpers, `requestPasswordReset`/`resetPassword` in authService, forgot/reset-password controllers + routes with rate limiting. Syntax/pure-logic/validation checks passed; live e2e confirmed by Mike after restoring Atlas access.
- Feature 04 refinement: `resetPassword` no longer requires email — client sends only `code` + `newPassword`; user looked up by `resetCode` + unexpired `resetCodeExpiry` (`User.findOne({ resetCode: code, resetCodeExpiry: { $gt: new Date() } })`). Single combined "invalid or expired reset code" error replaces the previously distinct invalid/expired messages (no useful distinction to surface without email). Email still required on `forgotPassword` (request step).
- Feature 05: TeamMember model + service + controller + routes (POST/GET /api/team-members, DELETE /:id, authMiddleware-gated). Prospect cascade-delete left as TODO in teamMemberService for Feature 06 — must wire `prospectService` deletion (and B2 file removal) there when Prospect model lands. All test data cleaned up.
- Feature 06: Notes — cascade delete uses a shared `getOwnedTeamMember` helper + dynamic `import()` to avoid an ESM circular import (prospectService also imports teamMemberService). DOCX MIME kept as a local const in prospectService + prospectController (no shared constants file exists yet). S3 DeleteObject is idempotent, so already-missing keys naturally proceed to the Mongo delete. Test data cleaned up.
- Feature 07 (complete): `docx-service/requirements.txt` (fastapi, uvicorn, python-docx, python-multipart), `main.py` (FastAPI, POST /generate-section, try/except → JSON error), `formatter.py` (detect_body_style tallies font+size across all paragraphs; detect_header_style scores candidates on bold+all-caps+size signals, prefers known header words, picks dominant style; insert_core_competencies appends header + bullet paragraphs using in-memory BytesIO). Fallback logs via print + logging.warning including filename.
- Feature 08 (complete): `docx-service/converter.py` (convert_to_pdf — uuid4 temp filenames, soffice --headless subprocess, always cleans up in finally block, raises RuntimeError with stderr on failure), `docx-service/naming.py` (build_filename — strips invalid chars, preserves internal spaces, parses YYYY-MM-DD → MMDDYYYY), `main.py` extended with POST /convert-to-pdf (multipart: file + prospect_name + company_name + date, returns PDF with Content-Disposition filename, 500 JSON on failure). Conversion verified working against real .docx file.
- Feature 09 (complete): `server/src/services/groqService.js` created — `openai` npm package used as OpenAI-compatible client pointed at `https://api.groq.com/openai/v1`. Client is lazy-initialized (not at module load) so server starts cleanly without `GROQ_API_KEY` set. Fixed SQL Server DBA prompt used verbatim. `generateCoreCompetencies` substitutes `{JD_TEXT}`, calls `llama-3.3-70b-versatile` via chat completions, post-processes response (strips leading `*`/`-`/`•`, trims whitespace, drops empty lines), returns string array. Invalid key surfaces as `"Groq API request failed: 401 Invalid API Key"` with `status: 502`. `GROQ_API_KEY` added to `.env.example`. Live test confirmed: 7 clean SQL Server bullets returned, no markdown chars, no empty lines, invalid key error clear and specific.
- Feature 10 (complete): `server/src/services/generateService.js` — 5-step chain (B2 GetObject → Groq → Python `/generate-section` → Python `/convert-to-pdf` → return PDF bytes + `Content-Disposition`), each step throws a distinct named error, full chain wrapped in `Promise.race` with 30s/504 timeout. `generateController.js` validates all 5 required body fields, streams PDF back. `generateRoutes.js` mounts `POST /api/generate` behind `authMiddleware`. Wired in `app.js`. `DOCX_SERVICE_URL` added to `.env.example`.
- Feature 11 (complete): `rejectSamePassword` extracted as the shared same-password guard and reused by `resetPassword`. Both settings routes behind `authMiddleware` (unlike the unauthenticated forgot/reset flow). No rate limiters per spec — endpoints require an authenticated session (scoping note). E2E verified against live Atlas; test user cleaned up.
