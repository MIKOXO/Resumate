# Feature 07: Python Docx Service

## Goal

A standalone FastAPI microservice that accepts a `.docx` file and a block of generated text, detects the resume's existing formatting, inserts a "CORE COMPETENCIES" section at the end matching that formatting (or a sensible fallback if no clear pattern is found), and returns the modified `.docx`. This is the highest-risk piece of the system — must be tested against real, varied prospect resumes before being considered done, not just a single sample file.

## Design

Not applicable — no UI, this is a backend microservice.

## Implementation

### Project Setup (`docx-service/`)

- `main.py`: FastAPI app with a single endpoint for now (see below).
- `formatter.py`: all style-detection and insertion logic — kept separate from `main.py` so the HTTP layer stays thin, same layering principle as the Express side.
- `requirements.txt`: `fastapi`, `uvicorn`, `python-docx`, `python-multipart` (needed for FastAPI to receive file uploads).

### `POST /generate-section` (in `main.py`)

- Accepts a multipart request: the `.docx` file + a `text` field containing the Core Competencies content (plain text, likely bullet-separated by newlines — confirm the exact format Express will send in Feature 09, but build against newline-separated bullet lines for now).
- Calls `formatter.insert_core_competencies(docx_bytes, bullet_lines)`.
- Returns the modified `.docx` as a binary response (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
- Wrap in a try/except — on any failure (corrupt file, unexpected structure), return a clear JSON error with a `422` or `500` status, not a raw Python traceback.

### `formatter.py` — Style Detection

**Header style detection:**

- Scan all paragraphs in the document. Identify candidate "section header" paragraphs using these signals together (not any single one alone): short text length (e.g. under ~40 characters), bold formatting, and/or a font size noticeably larger than the document's most common body-text font size, and/or all-caps text.
- Common section headers to look for as reference patterns (case-insensitive): "EXPERIENCE", "EDUCATION", "SKILLS", "SUMMARY", "CERTIFICATIONS" — if any of these (or close variants) are found, use that paragraph's exact formatting (font name, size, bold, color, all-caps) as the template for the new "CORE COMPETENCIES" header.
- If multiple candidates are found with inconsistent formatting, prefer the most frequently repeated style among them (the dominant pattern), not just the first match.
- **Fallback**: if no confident header pattern is detected, use plain 12pt, bold, same font family as the document's body text (detected separately, see below) — no oversized or stylized fallback. Log clearly (e.g. `print` or basic logging) whenever the fallback is used, including the resume filename, so these cases are identifiable during testing.

**Body/bullet style detection:**

- Identify the document's dominant body-text style: the font name, size, and formatting used by the _most common_ paragraph style across the document (not the last paragraph, which could be an outlier like a footer or date line). A reasonable approach: tally font+size combinations across all non-header paragraphs, use the most frequent.
- **Fallback**: if detection is inconclusive (e.g. document has too few paragraphs to establish a pattern, or wildly inconsistent formatting throughout), use plain 12pt, regular (non-bold), a common default font (e.g. Calibri or the document's first-detected font if any exists) as the fallback — matches the header fallback's "plain 12pt" principle.

### `formatter.py` — Insertion

- Bullets are plain text lines, each prefixed with a "•" character (simple text prefix, not a real Word numbered/bulleted list — confirmed as the MVP approach; real list formatting is a possible future improvement, not part of this feature).
- Insert order: a new paragraph with "CORE COMPETENCIES" in the detected/fallback header style, followed by one paragraph per bullet line in the detected/fallback body style, each starting with "• ".
- Insertion point: strictly at the end of the document — after the last existing paragraph, not interspersed anywhere else.
- Return the modified document as bytes (use an in-memory buffer — `io.BytesIO` — not a temp file on disk, to keep this stateless and avoid cleanup complexity).

### Testing Requirement

- Before this feature is considered done, test `insert_core_competencies` against at least 5 real, varied prospect resumes (different fonts, different header styles, at least one resume with no clear header pattern to confirm the fallback path works). Visually inspect the output — formatting-matching quality is not something a passing test suite alone can confirm; Mike must eyeball the resulting documents.

## Dependencies

- `fastapi`
- `uvicorn` (ASGI server to run the FastAPI app)
- `python-docx`
- `python-multipart` (required by FastAPI for handling file uploads in multipart requests)

## Verify when done

- [ ] Service starts cleanly with `uvicorn main:app` (or equivalent) with no errors
- [ ] `POST /generate-section` with a valid docx + text returns a valid, openable `.docx` file
- [ ] Tested against at least 5 real prospect resumes with varied formatting — confirm visually that the new section's font/size/bold reasonably matches each resume's existing style
- [ ] At least one tested resume has no clear header pattern — confirm the plain-12pt fallback is used and logged clearly
- [ ] Bullets render as "• text" plain paragraphs, correctly appended after the last existing paragraph — not inserted mid-document
- [ ] A corrupted or invalid docx input returns a clear JSON error, not a raw Python traceback
- [ ] No unhandled exceptions during any of the 5+ test runs
