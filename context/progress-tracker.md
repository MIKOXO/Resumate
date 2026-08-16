# Progress Tracker — Resumate

Update this file after every meaningful implementation change.

## Current Phase

- TBD

## Current Goal

- TBD

## Completed

- Feature 01: Express server, MongoDB Atlas connection, B2 client, health check.
- Feature 02: Auth core — User model, authService/controller, httpOnly-cookie JWT middleware, rate-limited routes, CORS, cookie-parser.
- Feature 03: Email verification — code fields on User, login gated on `emailVerified`, verify/resend endpoints. E2E verified via Gmail SMTP.
- Feature 04: Password reset — reset code fields, shared `generateCode`/`validatePassword`, forgot/reset endpoints (code+newPassword only, single combined invalid/expired error). E2E handled by Mike.
- Feature 05: TeamMember CRUD (name, indexed ownerId, owner-scoped). Cascade-delete TODO for Feature 06. E2E verified.
- Feature 06: Prospect CRUD (upload/list/replace/delete + cascade) via multer, auth-gated. Closed Feature 05 TODO. E2E verified incl. B2.
- Feature 07: Python docx-service — `/generate-section`, style detection + core-competencies insertion. Marked complete by Mike.
- Feature 08: PDF conversion + naming — `/convert-to-pdf` via soffice, sanitized filenames (MMDDYYYY). Verified.
- Feature 09: Groq integration — `groqService.js` (lazy OpenAI-compatible client, fixed SQL Server prompt, bullet cleanup). Verified live.
- Feature 10: Generate endpoint — 5-step chain (B2→Groq→docx→pdf→stream), 30s timeout/504. Auth-gated.
- Feature 11: Settings endpoints — `PATCH /me` + `/password` behind authMiddleware. E2E verified. Final backend feature.
- Feature 12: Design system — Vite :3000 + `@` alias, Urbanist, shadcn deps, `index.css` tokens, Redux shell, placeholder routes.
- Feature 13: Auth pages — authService/slice/hook, password strength, PasswordInput, PasswordStrengthBar, OTPInput, 4 pages, route guards.
- Feature 14: Dashboard shell — radix-ui added, shadcn dropdown/avatar/skeleton scaffolds, EmptyState, UserMenu, TopBar, rebuilt Dashboard.
- Feature 15: Team & Prospect Tree — services, teamMembersSlice (+prospect state, toggleExpand, selectedProspectId), dialogs, ProspectList/TeamMemberRow/TeamMemberTree, Dashboard wiring.
- Feature 16: Generate Workspace — Popover/Calendar shadcn scaffolds, react-day-picker v10, DatePicker, generateService, generationSlice, useGeneration, GenerateWorkspace, ResultCard, Dashboard wired. `selectProspect` now carries `teamMemberId`. Build + lint clean.
- Feature 17: Settings page — `updateName`/`changePassword` in authService/slice/hook (separate `nameLoading`/`nameError`/`passwordLoading`/`passwordError` keys), `/settings` route behind `AuthGate`, two AuthCard-style stacked forms (name+read-only email, password), transient "Saved" confirmations, backend error messages surfaced verbatim. Build + lint clean.

## In Progress

- (none)

## Next Up

- (none — all planned features complete)

## Open Questions

- None currently open.

## Architecture Decisions

- File storage via B2 S3-compatible API (AWS SDK v3).
- Auth via httpOnly JWT cookie — never exposed to JS.
- Password hashing in authService (models stay thin).
- Verification codes: single-use, 10-min expiry, cleared on verify.
- Reset codes: same pattern as verification; no session invalidation on reset (accepted MVP limit).

## Session Notes

- Feature 03: EMAIL\_\* vars set — signup emails verified end-to-end. Test users cleaned up.
- Feature 05/06: cascade delete via shared `getOwnedTeamMember` + dynamic `import()` (ESM circular import). B2 DeleteObject idempotent. Test data cleaned up.
- Feature 14: radix-ui needed for faithful shadcn (approved). `Logo` reused as-is (links to /login, bounces back via guard) — fix when touched. Left panel hidden below `md`.
- Feature 15: dialogs use tw-animate-css (Radix doesn't animate internally); delete confirm fetches prospects for accurate count; replace has no confirm; `primaryBtn`/helpers moved to `lib/authUiHelpers.js` (clears old lint errors). Client lints clean.
- Feature 16: react-day-picker v10 installed; Popover/Calendar manually scaffolded; `selectProspect` payload changed to `{ prospectId, teamMemberId }` — one call site updated in ProspectList. Error banner in GenerateWorkspace is inline (no auto-dismiss) — intentional, unlike auth forms.
- Feature 17 post-build: Settings page restructured from two stacked cards into a single card with a segmented Profile/Security tab switcher (motion sliding pill via `layoutId`). Both forms stay mounted so their state survives tab switches. UI-only change; no spec files touched.
- Feature 17 post-build (2): removed prospect-count badge from team member rows; replaced team member delete icon and prospect replace/delete icons with the navbar's DropdownMenu pattern — a single 3-dot (MoreVertical) menu per row (`Delete` destructive on team members; `Replace resume` + `Delete` on prospects). Existing dialog logic untouched.
