# Feature 09: Gemini Integration

## Goal

A `geminiService` that sends a job description to the Gemini API with a fixed, SQL-Server-specific prompt and returns clean, plain-text bullet lines — no markdown, no header, no commentary — ready to be passed directly into Feature 07's docx section-insertion logic.

## Design

Not applicable — backend-only feature, no UI.

## Implementation

### `server/src/services/geminiService.js`

- Install and configure the official `@google/genai` SDK — confirmed as the correct current package (`npm install @google/genai`).
- Model: `gemini-3.6-flash`.
- Read `GEMINI_API_KEY` from environment variables.
- The fixed prompt (exact text, do not paraphrase or "improve" it):

  ```
  Using the job description below, develop a Core Competencies section with a few main
  bullet points that is ATS compatible. This is specifically for a SQL Server Database
  Administrator resume — focus only on SQL Server–relevant skills and technologies
  mentioned in the job description. Output only the bullet points as plain text lines,
  one per line, with no markdown formatting (no asterisks, no dashes, no bold), no
  header or title, and no explanation or commentary before or after the list.

  Job description:
  {JD_TEXT}
  ```

- `generateCoreCompetencies(jobDescriptionText)`:
  - Sends the prompt (with `{JD_TEXT}` substituted) to the Gemini API.
  - Receives the response text.
  - Post-processes defensively even though the prompt asks for clean output — models don't always perfectly follow formatting instructions. Strip any leading `*`, `-`, or `•` characters some models add out of habit, strip empty lines, trim whitespace per line.
  - Returns an array of clean bullet line strings (not a single blob of text) — this is the shape Feature 07's docx service expects (newline-separated bullets).
  - If the API call fails (network error, rate limit, invalid key), throw a clear error with a specific message — do not retry automatically (confirmed: no retry/backoff logic, a failure simply surfaces to the user who can click Generate again).

## Dependencies

- `@google/genai` — confirmed correct package name

## Verify when done

- [ ] Sending a real SQL Server job description returns a clean array of bullet strings
- [ ] Output contains no markdown characters (no `*`, no `-` prefixes, no `**bold**`)
- [ ] Output contains no header/title line and no trailing commentary — only the bullet content itself
- [ ] An invalid `GEMINI_API_KEY` produces a clear, specific error (not a silent failure or generic 500)
- [ ] A non-SQL-Server-relevant job description still returns focused output per the prompt's framing (spot-check quality, not just structure)
- [ ] No console errors or unhandled promise rejections
- [ ] Server starts cleanly with no errors
