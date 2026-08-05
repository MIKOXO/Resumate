# Feature 06: Prospect CRUD

## Goal

Add, list, replace, and delete prospects nested under a team member. Each prospect's resume (.docx) is stored in Backblaze B2, keyed `userId/teamMemberId/prospectId.docx`; metadata lives in MongoDB. Also closes the cascade-delete TODO left in Feature 05 — deleting a team member now actually deletes its prospects (B2 files + Mongo records) via this feature's service.

## Design

Not applicable — backend-only feature. Upload/replace/delete UI and the collapsible tree are built in Feature 15.

## Implementation

### `server/src/models/Prospect.js`

- Fields: `name` (String, required), `ownerId` (ObjectId ref to User, required, indexed), `teamMemberId` (ObjectId ref to TeamMember, required, indexed), `b2Key` (String, required), `uploadedAt` (Date), `createdAt`.
- Duplicate `name` values under the same `teamMemberId` are allowed — `name` is not a uniqueness constraint, the document `_id` is the real identifier. Do not add a unique index on `name`.

### `server/src/services/prospectService.js`

- `uploadProspect({ ownerId, teamMemberId, name, file })`:
  - Validates the team member exists and belongs to `ownerId` (reuse `teamMemberService`'s ownership check, don't duplicate the lookup logic).
  - Validates the file is a real `.docx` — check the MIME type (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`) reported by multer, not just the filename extension, since a renamed file can fake an extension.
  - Generates the `b2Key` as `${ownerId}/${teamMemberId}/${prospectId}.docx` — generate the Mongo `_id` first (e.g. via `new mongoose.Types.ObjectId()`) so the key is known before the B2 upload call.
  - Uploads the file buffer to B2 using the client from `config/r2.js` (renamed to reflect B2 in Feature 01 — confirm the file's actual name/export before importing).
  - Creates the Prospect record with the generated `_id`, `b2Key`, and `uploadedAt: now`.
- `listProspects({ ownerId, teamMemberId })`: returns all Prospect records matching both `ownerId` and `teamMemberId` — always both filters, never just one.
- `replaceProspectResume({ ownerId, teamMemberId, prospectId, file })`:
  - Confirms the prospect exists and belongs to `ownerId` + `teamMemberId` — `404` if not.
  - Same `.docx` MIME validation as upload.
  - Uploads the new file to the _same_ `b2Key` (overwrite, not a new object) — the prospect keeps its identity, only the file content changes.
  - Updates `uploadedAt: now`. Does not change `name`.
- `deleteProspect({ ownerId, teamMemberId, prospectId })`:
  - Confirms ownership, `404` if not found/not owned.
  - Deletes the B2 object at `b2Key` first, then deletes the Mongo record. If the B2 delete fails, do not delete the Mongo record — surface the error instead of leaving an orphaned reference to a file that's actually still there (or, if it's a "file already gone" error specifically, proceed with the Mongo deletion since the end state is correct either way).
- `deleteAllProspectsForTeamMember({ ownerId, teamMemberId })`: new function, used by the cascade delete below — finds all prospects under the team member, calls `deleteProspect` for each (reuse the single-delete logic, don't duplicate it).

### Close Feature 05's TODO

- In `server/src/services/teamMemberService.js`, update `deleteTeamMember`: replace the `// TODO: cascade-delete prospects` comment with an actual call to `prospectService.deleteAllProspectsForTeamMember({ ownerId, teamMemberId })`, awaited before the TeamMember record itself is deleted.

### `server/src/controllers/prospectController.js`

- `upload`: uses `multer` (memory storage, 5MB file size limit, single-file field) to receive the upload, validates `name` and `teamMemberId` are present in the request, calls `prospectService.uploadProspect` with `ownerId` from `req.user`. Returns the created record.
- `list`: calls `prospectService.listProspects` with `ownerId` from `req.user` and `teamMemberId` from `req.params` or query. Returns the array.
- `replace`: same multer config as upload, calls `prospectService.replaceProspectResume`. Returns the updated record.
- `remove`: calls `prospectService.deleteProspect`. Returns success.
- Multer file-size-limit errors and wrong-file-type rejections should produce a clear `400` response via the existing error handler — not a generic multer stack trace.

### `server/src/routes/prospectRoutes.js`

- `POST /api/team-members/:teamMemberId/prospects` (upload)
- `GET /api/team-members/:teamMemberId/prospects` (list)
- `PUT /api/team-members/:teamMemberId/prospects/:prospectId` (replace)
- `DELETE /api/team-members/:teamMemberId/prospects/:prospectId` (delete)
- All routes protected by `authMiddleware`.

### Wiring

- Mount `prospectRoutes` in `app.js`.
- Install and configure `multer` if not already fully set up from Feature 01/02 (check first — don't reinstall if it's already a dependency).

## Dependencies

- `multer` (file upload handling — confirm it's installed; it was listed in the original server dependency list but may not have been configured for actual use yet)

## Verify when done

- [ ] Uploading a valid `.docx` under a valid team member succeeds, file appears in the B2 bucket at the expected key, Prospect record created in MongoDB
- [ ] Uploading a non-.docx file (e.g. a renamed .txt) is rejected with a clear `400` error, not silently accepted
- [ ] Uploading a file over 5MB is rejected with a clear `400` error, not a crash
- [ ] Two prospects with the same name under the same team member are both created successfully — no false uniqueness conflict
- [ ] Listing prospects only returns records matching both the correct `ownerId` AND `teamMemberId`
- [ ] Replacing a prospect's resume overwrites the same B2 key (confirm old file content is actually gone, not just added alongside) and updates `uploadedAt`
- [ ] Deleting a prospect removes both the B2 file and the Mongo record — confirm the B2 object is actually gone, not just the Mongo record
- [ ] Deleting a team member now cascade-deletes all its prospects (B2 files + Mongo records) — verify this closes Feature 05's TODO correctly
- [ ] Attempting any prospect operation on a team member/prospect not owned by the authenticated user returns `404`
- [ ] All routes reject requests with no valid auth cookie (`401`)
- [ ] Error responses follow the existing `{ success: false, error }` shape
- [ ] No console errors or unhandled promise rejections
- [ ] Server starts cleanly with no errors
