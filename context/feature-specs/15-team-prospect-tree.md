# Feature 15: Team & Prospect Tree

## Goal

Replace Feature 14's static left-panel empty state with the real collapsible team member → prospect tree: add/list/delete team members, add/replace/delete prospects, lazy-loaded prospect lists, cascade-delete confirmation with an accurate prospect count, and prospect selection wired into Redux for Feature 16 to consume.

## Design

Per `ui-context.md`'s Dashboard layout pattern and the approved mockup from Feature 14's planning.

- **shadcn/ui components used**: `Dialog` (Add/Replace modals), `AlertDialog` (delete confirmations — distinct from `Dialog`, reserved for destructive actions), `Collapsible` (team member expand/collapse). Add these to `components/ui/` per Feature 12's manual-scaffold pattern; note the `radix-ui` dependency already added in Feature 14 covers what these need too — confirm before assuming a fresh install is required.
- **"Add team member" button**: pinned at the top of the left panel, always visible (not just in the empty state) — per `ui-context.md`'s original spec, which Feature 14 didn't fully implement (it only built the generic `EmptyState` component without this button). This feature closes that gap. The empty state's own CTA doubles as a second entry point when the list is genuinely empty, but the pinned button is present regardless of list state.
- **Modals animate**: `Dialog`/`AlertDialog` open with a fade + slight scale-in (not an instant snap), consistent with the restrained Framer Motion pattern already used in Features 13/14 — if the shadcn primitive's built-in animation isn't sufficient/visible enough, layer Framer Motion on top.
- **Expand/collapse**: smooth height animation via `Collapsible`, not an instant show/hide.
- **No confirmation on resume replace** — selecting a new file and clicking "Replace" is the confirmation; no extra dialog on top (confirmed decision, overrides any earlier assumption of a replace-confirmation step).
- **Delete confirmation** (`AlertDialog`) — for team members, shows the accurate prospect count ("This will also delete 3 prospects and their resumes. This cannot be undone."); for prospects, a simpler single-item warning.

## Implementation

### shadcn Components (add first)

- `Dialog` (and `DialogTrigger`/`DialogContent`/`DialogHeader`/`DialogFooter`)
- `AlertDialog` (and its sub-parts — distinct component from `Dialog`, shadcn provides both separately)
- `Collapsible` (and `CollapsibleTrigger`/`CollapsibleContent`)

### `client/src/store/slices/teamMembersSlice.js`

- State: `list` (array of team members, each optionally holding a `prospects` array once lazy-loaded, plus a `prospectsLoaded` boolean and `expanded` boolean), `selectedProspectId`, `loading`, `error`.
- `createAsyncThunk`s: `fetchTeamMembers`, `createTeamMember`, `deleteTeamMember`, `fetchProspectsForTeamMember` (lazy — only called on first expand, or when needed for a delete-confirmation count), `uploadProspect`, `replaceProspectResume`, `deleteProspect`.
- Reducer for `toggleExpand(teamMemberId)`: flips `expanded`, triggers `fetchProspectsForTeamMember` if `prospectsLoaded` is false, does nothing extra if already loaded (no refetch on every toggle).
- Reducer for `selectProspect(prospectId)`: sets `selectedProspectId` — this is what Feature 16 reads.
- Cascade-delete flow: before showing the `AlertDialog` for a team member delete, if `prospectsLoaded` is false for that member, dispatch `fetchProspectsForTeamMember` first to get an accurate count for the warning text — don't show a stale/guessed count.

### `client/src/services/teamMemberService.js` / `prospectService.js`

- Axios calls to the Feature 05/06 endpoints: `POST /api/team-members`, `GET /api/team-members`, `DELETE /api/team-members/:id`, `POST /api/team-members/:teamMemberId/prospects`, `GET /api/team-members/:teamMemberId/prospects`, `PUT /api/team-members/:teamMemberId/prospects/:id`, `DELETE /api/team-members/:teamMemberId/prospects/:id`.
- Upload/replace calls use `multipart/form-data` (the `.docx` file + name field) via `FormData`, not JSON.

### `client/src/hooks/useTeamMembers.js`

- Wraps `useSelector`/`useDispatch` for the team members slice, exposes the actions/state pages need without importing Redux internals directly.

### Components

#### `client/src/components/TeamMemberTree.jsx`

- Renders the list from `teamMembersSlice`. Loading state shows Feature 14's `TeamMemberListSkeleton`; empty state shows Feature 14's `EmptyState` (with the "Add team member" CTA wired to open the add-team-member `Dialog`); otherwise renders `TeamMemberRow` for each entry.
- The pinned "Add team member" button lives here, above the list, always rendered regardless of list state.

#### `client/src/components/TeamMemberRow.jsx`

- `Collapsible` row: name, prospect count badge (once loaded), chevron indicating expand state, a small delete icon-button (opens the `AlertDialog`).
- Expanded content: `ProspectList` (see below) + an "Add prospect" text-button at the bottom of the expanded group, per the approved mockup.

#### `client/src/components/ProspectList.jsx`

- Renders prospect rows for an expanded team member: name, "last updated" timestamp (from `uploadedAt`), a small "Replace" and "Delete" action per row (icons, per `ui-context.md`'s sizing).
- Clicking a row (not the action icons) dispatches `selectProspect`.
- Selected prospect row shows the active/highlighted state per the approved mockup (background + border treatment).

#### `client/src/components/AddTeamMemberDialog.jsx`

- `Dialog` with a single name input, submit calls `createTeamMember`. Disabled submit until name is non-empty, same disabled-until-valid pattern as Feature 13.

#### `client/src/components/AddProspectDialog.jsx`

- `Dialog` with a name input + `.docx` file input, submit calls `uploadProspect`. Client-side validates the file is `.docx` before submit (reject other types immediately with an inline error, don't just rely on the backend rejection) and validates file size is under 5MB (matches Feature 06's server-side cap — catch it client-side too for a faster, clearer error).

#### `client/src/components/ReplaceResumeDialog.jsx`

- Same file validation as `AddProspectDialog`, but only a file input (no name field — replacing doesn't rename). Submit calls `replaceProspectResume`. No confirmation step (per Design section).

#### `client/src/components/DeleteConfirmDialog.jsx`

- Generic `AlertDialog` wrapper used by both team member and prospect deletion — accepts a title/description/confirm-action as props rather than building two separate one-off dialogs.

### `client/src/pages/Dashboard.jsx` (extend from Feature 14)

- Left panel now renders `TeamMemberTree` instead of Feature 14's static `EmptyState`.
- `fetchTeamMembers` dispatched once on Dashboard mount.

## Dependencies

None new beyond `radix-ui` already added in Feature 14 (confirm it covers `Dialog`/`AlertDialog`/`Collapsible` — these are all part of the same Radix primitive family already installed).

## Verify when done

- [ ] "Add team member" button is pinned at the top of the left panel, visible regardless of whether the list is empty or populated
- [ ] Adding a team member with a valid name succeeds and appears in the list without a full page refresh
- [ ] Expanding a team member for the first time shows a loading state, then its prospects — re-collapsing and re-expanding does not refetch
- [ ] Adding a prospect with a valid `.docx` under 5MB succeeds and appears in the expanded list
- [ ] Adding a prospect with a non-.docx file or a file over 5MB is rejected client-side with a clear inline error, before any request is sent
- [ ] Replacing a prospect's resume succeeds with no confirmation dialog — just file select + click
- [ ] Deleting a prospect shows a confirmation, and only deletes after confirming
- [ ] Deleting a team member shows a confirmation with an accurate prospect count, even if that member was never expanded before the delete was triggered
- [ ] Selecting a prospect row highlights it and updates `selectedProspectId` in Redux
- [ ] All modals (`Dialog`/`AlertDialog`) animate open/close, not an instant snap
- [ ] Expand/collapse animates smoothly
- [ ] Two different logged-in users only ever see their own team members/prospects (spot-check against Feature 05/06's ownership scoping — this is a good moment to verify the backend rules actually hold end-to-end through the UI)
- [ ] No console errors or warnings
- [ ] Responsive at both mobile and desktop widths
- [ ] `npm run build` passes with no errors
