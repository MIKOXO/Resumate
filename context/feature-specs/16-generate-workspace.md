# Feature 16: Generate Workspace

## Goal

Build the right panel's real workspace: JD textarea, company name + date inputs, Generate button wired to Feature 10's `POST /api/generate`, skeleton loading during generation, and a result card with a Download button. This is the feature that finally makes the app usable end-to-end.

## Design

Per `ui-context.md`'s right panel pattern.

- **Prerequisite fix**: `teamMembersSlice`'s `selectedProspectId` doesn't carry `teamMemberId`, but `/api/generate` requires both. `selectProspect` changes from `selectProspect(prospectId)` to `selectProspect({ prospectId, teamMemberId })`. Update the one call site (`ProspectList.jsx`).
- **No prospect selected**: unchanged — Feature 14's `EmptyState` ("Select a prospect to get started"), exactly as-is.
- **Prospect selected**: `GenerateWorkspace` renders — selected prospect's name as a header, JD textarea, company name input, native `<input type="date">`, Generate button.
- **Generate button**: disabled until JD + company name + date are all non-empty (same disabled-until-valid pattern as Feature 13's auth forms).
- **During generation**: skeleton blocks replace the result-card area — a title-bar-shaped block + a button-shaped block (per `ui-context.md`'s loading rule, shadcn `Skeleton`, no spinner). Inputs and Generate button disable while a request is in flight.
- **On success**: result card fades/scales in (Framer Motion, same restrained ~200-300ms ease-out as the rest of the app — reference Feature 15's dialog entrance pattern) showing the filename and a Download button. Clicking Download triggers the browser save from the already-fetched blob — no second request.
- **On error**: block error banner (reuse Feature 15/13's error banner styling) showing the backend's specific message (404 "Prospect not found", 502 "AI generation failed" / "Resume formatting failed" / "PDF conversion failed", 504 timeout). Banner replaces the skeleton, not stacked with it.
- **Switching prospects**: resets generation _result_ state to idle only — no stale result card or error banner carried over from the previous prospect. JD/company/date form fields are NOT cleared on switch (confirmed: one JD is reused across a batch of prospects — the whole point is select prospect → Generate → select next prospect → Generate again, same JD).
- **Fields persist across generations and across prospect switches** — JD/company/date only clear if the user manually clears them. Nothing in this feature auto-clears the form.
- **Date field**: custom `DatePicker` component, not the native `<input type="date">` — the browser-default picker doesn't match the dark theme/design tokens. Built as a `Popover` (trigger button showing the selected date, or placeholder text) + `Calendar` (shadcn's calendar, backed by `react-day-picker`), manually scaffolded per Feature 12's standing pattern. Internally tracks a `Date` object; on selection, formats to `YYYY-MM-DD` before it ever reaches form state — `docx-service/naming.py` expects and parses that exact format server-side, so the conversion happens in the component, not scattered elsewhere.

## Implementation

### shadcn Components (add first)

- `Popover` (and `PopoverTrigger`/`PopoverContent`) — new to this project, manually scaffold from ui.shadcn.com per Feature 12's pattern.
- `Calendar` — also new. shadcn's `Calendar` wraps `react-day-picker`; this is the one new real npm dependency this feature introduces (see Dependencies below). Style it against the existing color tokens (`--bg-elevated` for the popover surface, `--accent-primary`/`--accent-hover` for the selected day, `--border-default`, `12px` radius per `ui-context.md`'s modal/overlay radius) — do not use `react-day-picker`'s default styling unmodified.

### `client/src/components/DatePicker.jsx`

- Props: `value` (a `YYYY-MM-DD` string or `null`), `onChange(YYYY-MM-DD string)`, `disabled`.
- `Popover` trigger button: shows the formatted date (e.g. "Aug 15, 2026") if `value` is set, otherwise muted placeholder text ("Select date"), a small calendar icon (Lucide, `h-4 w-4`), matches the visual style of the JD textarea / company name input (same border/background/radius tokens, not a separate look).
- `PopoverContent` renders `Calendar` (single-date select mode). On day select: format to `YYYY-MM-DD`, call `onChange`, close the popover.
- Popover open/close animates (fade + slight scale, same restrained pattern as Feature 15's dialogs) — not an instant snap.

### `client/src/store/slices/teamMembersSlice.js` (small edit)

- `selectProspect` reducer: change payload from `prospectId` to `{ prospectId, teamMemberId }`; store both as `selectedProspectId` and `selectedTeamMemberId` in state.
- `useTeamMembers.js`: update `selectProspect` signature to `(prospectId, teamMemberId) => dispatch(selectProspect({ prospectId, teamMemberId }))`, expose `selectedTeamMemberId`.
- `ProspectList.jsx`: update the one call site — `onClick={() => selectProspect(p._id, member._id)}`.

### `client/src/services/generateService.js`

- New axios instance, `baseURL: '/api/generate'`, `withCredentials: true`.
- `generate({ teamMemberId, prospectId, jobDescription, companyName, date })` → `POST /` with JSON body, `responseType: 'blob'` (response is a raw PDF, not a JSON envelope — confirmed against `generateController.js`).
- On error, axios still gives a JSON error body even with `responseType: 'blob'` — the caller must read the blob as text and `JSON.parse` it to get `err.response.data.error`, since blob responseType doesn't auto-parse error bodies. Handle this in the thunk, not the component.

### `client/src/store/slices/generationSlice.js`

- State: `status` (`'idle' | 'generating' | 'success' | 'error'`), `error`, `resultBlob`, `resultFilename`.
- `createAsyncThunk('generation/generate', ...)`: calls `generateService.generate`, parses the filename from the response's `Content-Disposition` header (regex on `filename="..."`), returns `{ blob, filename }`.
- Reducer `resetGeneration`: sets state back to idle/null — called whenever `selectedProspectId` changes.

### `client/src/hooks/useGeneration.js`

- Wraps `useSelector`/`useDispatch` for `generationSlice`, exposes `status`, `error`, `resultBlob`, `resultFilename`, `generate(...)`, `reset()`.

### `client/src/components/GenerateWorkspace.jsx`

- Reads `selectedProspectId`/`selectedTeamMemberId` via `useTeamMembers()`, looks up the prospect's name from `list` for the header.
- Local state for `jobDescription`, `companyName`, `date` (plain `useState`, not Redux — these are ephemeral form inputs, no other component needs them; `date` is a `YYYY-MM-DD` string, already formatted by `DatePicker`). Lives in `GenerateWorkspace`, not in a slice — deliberately, so it survives `selectedProspectId` changes for free (no special persistence logic needed, just don't tie it to a key/remount that would reset it).
- `useEffect` on `selectedProspectId` change: calls `reset()` on the generation slice **only** — clears `status`/`error`/`resultBlob`/`resultFilename`, does NOT touch the form fields.
- Generate button `onClick`: calls `generate({ teamMemberId: selectedTeamMemberId, prospectId: selectedProspectId, jobDescription, companyName, date })`.
- Renders: header → textarea + company name input + `DatePicker` (disabled while `status === 'generating'`) → conditional area below (idle: nothing extra; generating: skeleton blocks; success: `ResultCard`; error: error banner).

### `client/src/components/ResultCard.jsx`

- Props: `filename`, `blob`. Shows filename + a Download button.
- Download button `onClick`: builds a temporary object URL from `blob` (`URL.createObjectURL`), creates a hidden `<a download>` element, clicks it, revokes the URL after. No second network request.
- Entrance animation: fade + slight scale-in via Framer Motion, consistent with Feature 15's dialog pattern.

### `client/src/pages/Dashboard.jsx` (extend from Feature 14/15)

- Right panel: `selectedProspectId ? <GenerateWorkspace /> : <EmptyState ... />` (existing empty-state copy/props unchanged).

## Dependencies

- **`react-day-picker`** — new. Required by shadcn's `Calendar`. Install with `npm install react-day-picker` in `client/`. Confirm the version shadcn's current docs specify (v9 as of this writing) — don't blindly pin an old version from stale docs.
- Everything else already installed/scaffolded: `axios`, `framer-motion`, `lucide-react`, `radix-ui` (covers `Popover`), existing `Skeleton` component.

## Verify when done

- [ ] Selecting a prospect shows the JD/company/`DatePicker` form; deselecting (or having none selected) shows the original "Select a prospect" empty state
- [ ] `DatePicker` renders the custom calendar popover, not the browser's native date picker; matches dark theme tokens (no unstyled `react-day-picker` defaults visible)
- [ ] Selecting a date in `DatePicker` closes the popover, animates open/close (not an instant snap), and produces a correctly formatted `YYYY-MM-DD` value
- [ ] Generate button is disabled until JD, company name, and date are all filled
- [ ] Generate button and all three inputs disable while a request is in flight
- [ ] Downloaded PDF filename follows `Prospect_Company_MMDDYYYY.pdf` exactly — no spaces, no separators in the date (confirm `DatePicker` sends `YYYY-MM-DD` to the backend as-is; the `MMDDYYYY` conversion is `naming.py`'s job, not the frontend's — don't reformat client-side)
- [ ] Downloading does not trigger a second network request — it reuses the already-fetched blob
- [ ] A prospect with no B2 file (or invalid `prospectId`) surfaces the specific "Prospect not found" error, not a generic one
- [ ] Killing the Groq/docx-service connection surfaces the specific corresponding error message, not a generic one
- [ ] Switching to a different prospect clears the previous result card/error banner, but JD/company/date fields stay exactly as typed
- [ ] Generating for a second, third prospect with the same JD/company/date (no retyping) works correctly — this is the primary real-world use case
- [ ] Generating again for the same prospect (fields left as-is) works without needing to retype anything
- [ ] `selectProspect` now carries `teamMemberId` correctly — spot-check that `ProspectList.jsx`'s call site was updated and nothing else broke from the payload shape change
- [ ] No console errors or unhandled promise rejections
- [ ] Responsive at both mobile and desktop widths
- [ ] `npm run build` passes with no errors
