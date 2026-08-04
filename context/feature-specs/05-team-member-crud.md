# Feature 05: Team Member CRUD

## Goal

Add, list, and delete Job Applying Team members. Each is scoped to the authenticated user (`ownerId`) — a user only ever sees and manages their own team members. Deleting a team member cascade-deletes their prospects (and prospect resume files in B2), with a confirmation warning shown before the delete happens. This feature does not touch prospects directly — Feature 06 builds prospect CRUD, this feature just establishes the parent entity and the cascade behavior it triggers.

## Design

Not applicable — backend-only feature. The collapsible team member list UI is built in Feature 15.

## Implementation

### `server/src/models/TeamMember.js`

- Fields: `name` (String, required), `ownerId` (ObjectId ref to User, required, indexed), `createdAt`.
- No other fields — this is intentionally minimal. Do not add fields speculatively (e.g. no email, no role, no notes field) unless explicitly asked for later.

### `server/src/services/teamMemberService.js`

- `createTeamMember({ ownerId, name })`: validates `name` is present and non-empty, creates the record.
- `listTeamMembers({ ownerId })`: returns all TeamMember records where `ownerId` matches — always filtered, never an unscoped query.
- `deleteTeamMember({ ownerId, teamMemberId })`:
  - First confirms the team member exists AND belongs to `ownerId` — if not found or not owned by this user, throw a `404`, don't reveal whether it exists under a different owner.
  - Finds all Prospect records under this `teamMemberId` (this will call into `prospectService` once Feature 06 exists — for now, since Feature 06 isn't built yet, leave a clear `// TODO: cascade-delete prospects once prospectService exists (Feature 06)` comment and implement only the TeamMember deletion itself in this feature. Do not stub out fake prospect-deletion logic against a model that doesn't exist yet.
  - Deletes the TeamMember record.

### `server/src/controllers/teamMemberController.js`

- `create`: validates `name` from `req.body`, calls `teamMemberService.createTeamMember` with `ownerId` from `req.user`, returns the created record.
- `list`: calls `teamMemberService.listTeamMembers` with `ownerId` from `req.user`, returns the array.
- `remove`: calls `teamMemberService.deleteTeamMember` with `ownerId` from `req.user` and `teamMemberId` from `req.params`. Note: the confirmation warning itself ("this will delete N prospects") is a frontend concern (Feature 15) — this endpoint just performs the delete once called. Consider having `list` or a dedicated lightweight endpoint return a prospect count per team member so the frontend can show that number in the confirmation dialog without an extra round-trip — flag this as a decision for Mike rather than assuming; a simple approach is fine (e.g. `list` includes a `prospectCount` field once Feature 06's Prospect model exists) but don't build it now against a model that doesn't exist.

### `server/src/routes/teamMemberRoutes.js`

- `POST /api/team-members`
- `GET /api/team-members`
- `DELETE /api/team-members/:teamMemberId`
- All three routes protected by `authMiddleware` (from Feature 02) — no team member data is ever accessible without a valid session.

### Wiring

- Mount `teamMemberRoutes` in `app.js` under `/api/team-members`.

## Dependencies

None new.

## Verify when done

- [ ] Creating a team member with a valid name succeeds and is tagged with the correct `ownerId`
- [ ] Creating a team member with an empty/missing name is rejected with a clear `400` error
- [ ] Listing team members only returns the authenticated user's own records — verify with two different user accounts, confirm no cross-visibility
- [ ] Deleting a team member that belongs to the authenticated user succeeds
- [ ] Attempting to delete a team member that doesn't exist, or belongs to a different user, returns `404` — not a silent no-op, not a leak of the other user's data
- [ ] All three routes reject requests with no valid auth cookie (`401`)
- [ ] Error responses follow the existing `{ success: false, error }` shape
- [ ] The cascade-delete TODO is clearly marked in code and referenced in `progress-tracker.md` so it isn't forgotten once Feature 06 lands
- [ ] No console errors or unhandled promise rejections
- [ ] Server starts cleanly with no errors
