# Code Standards — Resumate

## General

- Keep modules small and single-purpose — a file that does upload, formatting, and naming should be three files, not one.
- Fix root causes, not symptoms — do not patch a formatting bug with a special-case `if`; fix the underlying detection logic.
- Do not mix unrelated concerns in one component, controller, or service — a controller parses/validates/responds, it does not also talk to R2.
- No dead code, commented-out blocks, or TODO-and-forget — either it's used, removed, or tracked in `progress-tracker.md`.
- Every async operation (API calls, file I/O, docx/PDF processing) must have explicit error handling — no silent failures.

## JavaScript

- Use ES modules (`import`/`export`) throughout, both client and server — no `require`/`module.exports` mixing.
- Avoid implicit `any`-equivalent looseness — validate shapes of external input (API responses, uploaded files, env vars) before trusting them; don't assume a shape and let it fail downstream.
- Use JSDoc type comments on service functions and shared utilities where the shape of input/output isn't obvious from the name alone.
- No magic strings/numbers for things defined elsewhere (file naming format, allowed file types, status codes) — pull from a shared constants file.
- Prefer `async/await` over raw `.then()` chains for readability and consistent error handling via `try/catch`.

## React (Frontend)

- Functional components with hooks only — no class components.
- Components stay presentational; data fetching and business logic live in `services/` and are accessed via `hooks/`, not called directly inside components.
- One component, one responsibility — split a component the moment it's doing layout AND data logic AND conditional rendering for multiple states.
- Loading, error, and empty states are handled explicitly in every data-driven component — no unguarded assumptions that data exists.
- No inline styles — Tailwind utility classes only, per `ui-context.md`.

## Express (Backend)

- Routes only map HTTP verb + path to a controller — no logic in route files.
- Controllers validate input and shape responses — no direct DB, R2, or Gemini calls in a controller; that belongs in a service.
- Services contain all business logic and are the only layer that talks to MongoDB, Cloudflare R2, Gemini, or the Python docx-service.
- Every protected route runs through `authMiddleware` before reaching a controller — no exceptions.
- Errors are passed to a centralized `errorHandler` middleware — controllers don't format error responses themselves.

## API Routes

- Validate and parse request input (body, file type, required fields) before any logic runs — reject bad input early with a clear message.
- Enforce auth and ownership before any read or mutation — every prospect-related query is filtered by the authenticated user's `ownerId`, never trust a client-supplied user id.
- Return consistent response shapes across all endpoints — e.g. `{ success, data, error }` — so the frontend can handle responses predictably.
- Non-2xx responses always include a human-readable `error` message, not just a status code.

## Data and Storage

- Metadata (users, prospect records, file references, timestamps) belongs in MongoDB Atlas — nothing else.
- Resume files (.docx) belong in Cloudflare R2 — never stored as binary/base64 in MongoDB.
- Job description text and generated PDFs are not persisted anywhere — processed in-memory/temp storage per request, then discarded.
- Any temp files written during docx/PDF processing (client uploads, LibreOffice output) must be cleaned up after the request completes, success or failure.

## File Organization

- `client/src/components/` — presentational UI only, no business logic
- `client/src/pages/` — screen-level composition (Login, Signup, Dashboard)
- `client/src/store/slices/` — Redux state + async thunks per domain (auth, prospects, generation)
- `client/src/services/` — all Axios calls to the backend; the only client-side layer allowed to make HTTP requests
- `client/src/hooks/` — reusable selector/dispatch wrappers per slice
- `server/src/routes/` — endpoint definitions only
- `server/src/controllers/` — request parsing, validation, response shaping
- `server/src/services/` — all business logic: R2, Gemini, Python service, auth, team members, prospects
- `server/src/models/` — MongoDB schemas only (User, TeamMember, Prospect)
- `server/src/middleware/` — auth verification, centralized error handling
- `server/src/config/` — DB connection, R2 client config
- `docx-service/` — all docx manipulation and PDF conversion logic (Python), isolated from Express
