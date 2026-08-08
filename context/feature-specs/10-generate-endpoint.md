# Feature 10: Generate Endpoint

## Goal

Orchestrate the full generate flow end-to-end: fetch a prospect's resume from B2, generate Core Competencies via Groq, insert it into the docx via the Python service, convert to PDF with the correct filename, and stream the result back to the client as a download. This is the feature that finally connects Features 06-09 into the actual product behavior.

## Design

Not applicable — backend-only feature. The Generate button, loading states, and download UI are built in Feature 16.

## Implementation

### `server/src/services/generateService.js`

- `generateResume({ ownerId, teamMemberId, prospectId, jobDescription, companyName, date })`:
  1. Confirm the prospect exists and belongs to `ownerId` + `teamMemberId` (reuse `prospectService`'s existing ownership lookup, don't duplicate it) — throw a specific `"Prospect not found"` error (`404`) if not.
  2. Download the prospect's `.docx` from B2 using the stored `b2Key` — throw a specific `"Failed to retrieve resume file"` error if this step fails.
  3. Call `groqService.generateCoreCompetencies(jobDescription)` — throw a specific `"AI generation failed"` error (propagate the underlying message where useful) if this step fails.
  4. Call the Python service's `POST /generate-section` with the downloaded docx bytes + the bullet lines from step 3 — throw a specific `"Resume formatting failed"` error if this step fails.
  5. Call the Python service's `POST /convert-to-pdf` with the modified docx from step 4, plus the prospect's name, `companyName`, and `date` — throw a specific `"PDF conversion failed"` error if this step fails.
  6. Return the PDF bytes and the filename/`Content-Disposition` value exactly as returned by the Python service in step 5 — do not reassign or recompute the filename in Express, Feature 08 already owns that logic.
- Each step's error is distinct and specific — this makes debugging failures fast right now, and can be simplified into a single generic client-facing message later once the system is stable (not needed yet).
- Nothing in this flow writes to MongoDB, B2, or disk — no persistence, matching the existing invariant that job description text and generated PDFs are not stored.

### Overall Request Timeout

- Wrap the full multi-step chain (Groq call + two Python service calls) with an overall timeout of **30 seconds**. If the chain hasn't completed by then, abort and return a specific `"Generation is taking longer than expected, please try again"` error (`504`) rather than letting the client hang indefinitely.
- Implement this as a `Promise.race` between the generation chain and a timeout promise, or equivalent — whichever pattern is cleanest given the HTTP client already in use for the Python service calls.

### `server/src/controllers/generateController.js`

- `generate`: validates `teamMemberId`, `prospectId`, `jobDescription`, `companyName`, `date` are all present in `req.body`. Calls `generateService.generateResume` with `ownerId` from `req.user`. On success, sets the response headers (`Content-Type: application/pdf`, `Content-Disposition` from the Python service's response) and streams the PDF bytes back. On failure, passes the specific error through to the existing error handler — no generic catch-all message here, the specific errors from the service layer are the point.

### `server/src/routes/generateRoutes.js`

- `POST /api/generate`
- Protected by `authMiddleware`.

### Wiring

- Mount `generateRoutes` in `app.js`.
- Confirm the Python service's base URL is configurable via an environment variable (e.g. `DOCX_SERVICE_URL=http://localhost:8001`), not hardcoded — Express needs this to call `/generate-section` and `/convert-to-pdf`.

## Dependencies

None new — uses `axios` (already installed) for the calls to the Python service.

## Verify when done

- [ ] A full valid request (real prospect, real JD, real company/date) returns a working PDF with the correct `Prospect_Company_MMDDYYYY.pdf` filename
- [ ] Requesting generation for a prospect that doesn't exist or isn't owned by the authenticated user returns a specific `404` "Prospect not found" error
- [ ] Temporarily breaking the Groq connection (bad API key) produces the specific "AI generation failed" error, not a generic one
- [ ] Temporarily stopping the Python service produces the specific "Resume formatting failed" or "PDF conversion failed" error (whichever step it fails at), not a generic one
- [ ] An artificially slow response (or a deliberately long timeout test) triggers the 30-second overall timeout with the specific "taking longer than expected" error, not an indefinite hang
- [ ] No job description text, generated PDF, or intermediate docx is persisted anywhere (confirm no new files on disk, no new B2 objects, no new MongoDB writes after a generate call)
- [ ] All error responses follow the existing `{ success: false, error }` shape
- [ ] No console errors or unhandled promise rejections
- [ ] Server starts cleanly with no errors
