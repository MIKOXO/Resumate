# Feature 08: PDF Conversion & Naming

## Goal

Extend the Python docx-service with a `/convert-to-pdf` endpoint: accepts the finished `.docx` (post Feature 07's section insertion) plus prospect name, company name, and date, converts it to PDF via LibreOffice headless, and returns the PDF with the exact required filename: `ProspectName_CompanyName_MMDDYYYY.pdf` — date as 8 contiguous digits, no slashes, no dashes.

## Design

Not applicable — backend microservice extension, no UI.

## Implementation

### `docx-service/converter.py` (new file)

- `convert_to_pdf(docx_bytes: bytes) -> bytes`:
  - Writes `docx_bytes` to a temp file with a unique name (use `uuid4()` in the filename to avoid collisions under concurrent requests — do not use a fixed/shared temp filename).
  - Runs LibreOffice headless as a subprocess: `soffice --headless --convert-to pdf --outdir <temp_dir> <temp_docx_path>`. Confirmed on Mike's machine: the binary resolves as `soffice` (`/usr/bin/soffice`) — use this exact command, no need to detect/fallback to `libreoffice`.
  - Reads the resulting PDF file back into bytes.
  - **Always** deletes both the temp `.docx` and temp `.pdf` files in a `finally` block — regardless of success or failure — so temp files never accumulate.
  - If the subprocess fails (non-zero exit code, or the expected output PDF doesn't appear), raise a clear exception with the subprocess's stderr output included, so failures are diagnosable.

### `docx-service/naming.py` (new file)

- `build_filename(prospect_name: str, company_name: str, date_str: str) -> str`:
  - Sanitizes `prospect_name` and `company_name`: strip leading/trailing whitespace, remove characters that are invalid in filenames (`/ \ : * ? " < > |`) — but preserve internal spaces (e.g. "John Smith" stays "John Smith", not "JohnSmith").
  - Formats the date as exactly 8 digits, `MMDDYYYY`, no separators. Accept `date_str` as an ISO date (`YYYY-MM-DD`, what a standard HTML date input sends) and convert it — do not assume the caller already sends `MMDDYYYY`.
  - Returns `f"{prospect_name}_{company_name}_{date_formatted}.pdf"` — exactly this three-part underscore-separated structure, nothing else appended.
  - This is a pure function with no I/O — keep it easily testable in isolation from the conversion/HTTP logic.

### `main.py` (extend)

- Add `POST /convert-to-pdf`: accepts a multipart request with the `.docx` file plus `prospect_name`, `company_name`, `date` fields.
- Calls `converter.convert_to_pdf` on the file bytes.
- Calls `naming.build_filename` to compute the final filename.
- Returns the PDF binary response with `Content-Disposition: attachment; filename="<computed-filename>"` set correctly — Express (Feature 10) should be able to stream this response straight through to the browser without needing to touch the filename itself.
- Wrap in try/except — conversion failures return a clear JSON error (`500`) with the LibreOffice stderr content included for debugging, not a raw traceback.

## Dependencies

- No new Python packages (uses `subprocess`, part of the standard library).
- **System dependency**: LibreOffice must be installed and available on PATH. Confirmed present at `/usr/bin/soffice` on Mike's development machine.

## Verify when done

- [ ] `build_filename("John Smith", "Anthropic", "2026-07-22")` returns exactly `"John Smith_Anthropic_07222026.pdf"` — no slashes, no dashes, correct order
- [ ] Filenames with invalid filesystem characters in the name/company (e.g. a company name containing `/`) are sanitized correctly, internal spaces preserved
- [ ] `POST /convert-to-pdf` with a valid docx + fields returns a valid, openable PDF with the correct filename in `Content-Disposition`
- [ ] Temp files are confirmed cleaned up after both a successful and a failed conversion (check the temp directory manually after each)
- [ ] Concurrent requests (send two conversions at once) do not collide on temp filenames or corrupt each other's output
- [ ] A LibreOffice subprocess failure (test by temporarily renaming/removing the binary from PATH, or feeding a corrupt docx) returns a clear JSON error, not a hung request or raw traceback
- [ ] No unhandled exceptions during any test run
