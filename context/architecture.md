# Architecture — Resumate

## Stack Table

| Layer | Technology | Role |
|---|---|---|
| Frontend framework | React (Vite) | UI rendering |
| Frontend styling | Tailwind CSS | Utility-first styling |
| Frontend components | shadcn/ui | Pre-built accessible UI components |
| Frontend icons | Lucide React | Iconography |
| Frontend animation | Framer Motion | Transitions/animations |
| Frontend HTTP | Axios | API calls from client to server |
| Frontend state | Redux Toolkit | Auth state, prospect list, generation status |
| Frontend font | Urbanist (Google Fonts) | Typography |
| Backend runtime | Node.js | Server runtime |
| Backend framework | Express | API gateway, routing, orchestration |
| Backend auth | JWT + bcryptjs | Session tokens, password hashing |
| Email | Nodemailer (Gmail SMTP) | Verification codes, password reset codes |
| Document service | Python (FastAPI) | docx formatting + section insertion |
| Document library | python-docx | Read/write docx structure and styles |
| PDF conversion | LibreOffice (headless) | docx → PDF conversion |
| AI generation | Gemini API | Core Competencies text generation |
| File storage | Cloudflare R2 | Stores prospect resume .docx files |
| Database | MongoDB Atlas (M0) | Users, prospect metadata, file references |

## System Boundaries (Folder Ownership)

| Folder | Owns |
|---|---|
| `client/src/components` | Presentational UI, no business logic |
| `client/src/pages` | Screen-level composition (Login, Signup, Dashboard) |
| `client/src/store/slices` | Client + server-derived state, async thunks |
| `client/src/services` | All Axios calls to the backend — the only layer allowed to call `server` |
| `client/src/hooks` | Reusable selector/dispatch wrappers per slice |
| `server/src/routes` | Endpoint definitions only — maps HTTP verb + path to a controller, no logic |
| `server/src/controllers` | Request parsing, input validation, calls services, shapes response — no business logic |
| `server/src/services` | All real logic: R2 access, Gemini calls, Python service calls, JWT issuance/verification, password hashing |
| `server/src/models` | MongoDB schemas only (User, TeamMember, Prospect) — no logic |
| `server/src/middleware` | JWT verification, error handling — cross-cutting concerns |
| `server/src/config` | DB connection, R2 client config |
| `docx-service/` | Owns all docx manipulation and PDF conversion — the only place `python-docx` and LibreOffice are invoked |

**Rule of thumb**: if it's business logic, it lives in a `services/` folder (client or server). Routes, controllers, and models stay thin.

## Storage Model

| Data | Where | Why |
|---|---|---|
| User accounts (email, hashed password) | MongoDB Atlas | Small, structured, needs querying |
| Team member records (name, owning userId) | MongoDB Atlas | Small, structured — groups prospects under the correct colleague |
| Prospect metadata (name, R2 file key, upload date, teamMemberId, owning userId) | MongoDB Atlas | Small, structured, needs querying |
| Prospect resume files (.docx) | Cloudflare R2, keyed `userId/teamMemberId/prospectId.docx` | Binary file, not suited to MongoDB document storage |
| Job description text | Nowhere — in-memory only, discarded after the request completes | Not needed after generation; avoids storing more prospect-adjacent data than necessary |
| Generated PDF | Nowhere persistent — streamed to the user as a download, not stored server-side | User downloads immediately; no need to retain past outputs in MVP |

No caching layer in MVP — request volume (15-20/day per user) doesn't justify one.

## Auth and Access Model

- Self-signup: email + password, password hashed with bcryptjs before storage.
- On signup, a 6-digit verification code (with a short expiry, e.g. 10 minutes) is generated, stored on the User record, and emailed via Nodemailer. The user cannot log in until `emailVerified` is true.
- Forgot password follows the same code pattern: a 6-digit reset code is generated, stored with an expiry, and emailed. Submitting the correct code allows setting a new password. Codes are single-use — cleared from the User record once consumed.
- Login returns a JWT, sent by the client on every subsequent request (Axios interceptor attaches it).
- `authMiddleware` verifies the JWT on protected routes before any controller logic runs.
- Every Prospect record stores an `ownerId` (the authenticated user) and a `teamMemberId` (which colleague it's organized under). Every TeamMember record stores an `ownerId`.
- All team member and prospect queries (list, get, update, delete) are filtered by `ownerId` matching the authenticated user's id from the JWT — a user can never read or modify another user's team members or prospects, enforced at the service layer, not just the UI.
- No roles/permissions tiers in MVP — every authenticated user has identical capabilities, scoped to their own data only.

## AI / Background Processing

- Gemini API call is synchronous, request-scoped — no queue or background job in MVP. The user waits for a direct response (target: under ~15 seconds end-to-end including docx processing and PDF conversion).
- The Python docx-service is called synchronously by Express per generate request — no async job queue. If volume grows enough that generation becomes a bottleneck, this is the first place to introduce a queue (e.g. BullMQ), but it's explicitly out of scope for MVP.
- No retries are persisted; a failed Gemini or docx-service call surfaces an error to the user, who can just click Generate again.

## Invariants

1. **No business logic in routes, controllers, or models** — it belongs in a `services/` file.
2. **No file bytes stored in MongoDB** — resumes live only in Cloudflare R2; MongoDB holds references, never binary content.
3. **Every prospect record is scoped to exactly one `ownerId` and one `teamMemberId`** — no prospect is ever queryable without an owner filter matching the authenticated user, and every team member record is likewise scoped to its `ownerId`.
4. **Job description text is never persisted** — used for one generation request, then discarded.
5. **Every route that touches prospect or generation data must pass through `authMiddleware`** — no unauthenticated access to user data, ever.
6. **The Python service is the only place docx files are opened/modified** — Express never manipulates docx content directly.
7. **Passwords are never stored or logged in plaintext**, anywhere, under any circumstance.
8. **Verification and reset codes are single-use and time-bound** — cleared after use or expiry, never reused or left valid indefinitely.
9. **Output filenames always follow `Prospect_Company_MMDDYYYY.pdf`** — no ad hoc naming.
10. **Dark theme is the only theme** — no theme-switching logic is ever introduced into the frontend.
