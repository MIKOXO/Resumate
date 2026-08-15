# Feature 17: Settings Page

## Goal

Let a logged-in user update their name and change their password, backed by Feature 11's `PATCH /api/auth/me` and `PATCH /api/auth/password`. `/settings` is already linked from `UserMenu` but has no route or page yet.

## Design

Two independent forms on one page, not a single combined form — name-update and password-change are separate concerns with separate submit actions, separate loading/error states, and no reason to force one save button for both.

- **Layout**: reuse the auth pages' card-centered aesthetic (`AuthCard`) rather than inventing a new settings shell — this is the only non-dashboard authenticated page, no need for a third visual language. Two `AuthCard`-style sections stacked (or two cards side by side ≥`md`, stacked below), a "Back to dashboard" link/button at the top.
- **Name form**: single text input, pre-filled with `user.name` from `authSlice`, "Save" button disabled when unchanged or empty (same disabled-until-valid convention as Feature 13). Success shows a brief inline confirmation (not a banner that has to be dismissed — a small transient "Saved" state near the button, auto-dismissing, consistent with `useAutoDismiss`'s existing role in this app).
- **Password form**: `currentPassword` (`PasswordInput`), `newPassword` (`PasswordInput` + `PasswordStrengthBar`, weak-blocks-submit — exact Feature 13 pattern), `confirmNewPassword`. Submit disabled until current password is non-empty, new password is not weak, and confirm matches. On success: clear all three fields, show the same transient "Saved" confirmation — do NOT log the user out or redirect (Feature 11 confirms the session is unaffected by a password change).
- **Errors**: `BlockError` per form, matching Feature 13/15's error banner exactly — in particular, the backend's specific messages ("Current password is incorrect", "New password must be different from your current password", strength-policy messages) must surface verbatim, not get flattened into a generic failure.
- **No email field** — per Feature 11, email cannot be changed. Show it read-only (plain text, not an input) so the user isn't confused about why there's no field for it, briefly noting it's tied to verification.

## Implementation

### `client/src/services/authService.js` (extend, no new file)

- `updateName: (name) => api.patch('/me', { name })`
- `changePassword: (currentPassword, newPassword) => api.patch('/password', { currentPassword, newPassword })`
- Added directly to the existing file — both hit `/api/auth/*` on the same axios instance Feature 13 already created; no reason for a second instance against the same baseURL.

### `client/src/store/slices/authSlice.js` (extend)

- `updateName = createAsyncThunk('auth/updateName', ...)`: calls `authService.updateName`, returns updated user; `.fulfilled` replaces `state.user`.
- `changePassword = createAsyncThunk('auth/changePassword', ...)`: calls `authService.changePassword`; no user object to store, `.fulfilled` is just a success signal.
- Both follow the exact `rejectWithValue(err.response?.data?.error || '...')` pattern already used for `login`/`signup`.
- **Separate state keys from the auth-flow pages' `loading`/`error`** — the Settings page has two independent forms that must not clobber each other's UI state (submitting name shouldn't show a stale password error, or vice versa). Add `nameLoading`, `nameError`, `passwordLoading`, `passwordError` as their own fields; do not reuse the shared `loading`/`error` Feature 13 built for login/signup/verify.

### `client/src/hooks/useAuth.js` (extend)

- Expose `updateName`, `changePassword`, and the new state fields (`nameLoading`, `nameError`, `passwordLoading`, `passwordError`) alongside the existing exports.

### `client/src/pages/Settings.jsx`

- Two forms as described in Design. Reuses `AuthCard`, `BlockError`, `FieldError`, `PasswordInput`, `PasswordStrengthBar`, `useAutoDismiss`, `inputClass`/`primaryBtn` from `lib/authUiHelpers.js` — no new low-level UI primitives needed.
- Name form pre-fills from `user.name` (via `useAuth()`); "Save" disabled when `name.trim() === user.name.trim()` (no-op guard) as well as when empty.
- Password form clears all three fields after a successful submit.
- "Back to dashboard" link at the top, `<Link to="/dashboard">`.

### `client/src/App.jsx` (extend)

- Add `<Route path="/settings" element={<AuthGate requireAuth><Settings /></AuthGate>} />` — protected the same way `/dashboard` is.

## Dependencies

None new.

## Verify when done

- [ ] `/settings` is reachable from `UserMenu` and loads without a route/404 issue
- [ ] Unauthenticated access to `/settings` redirects to `/login`, consistent with `/dashboard`'s guard
- [ ] Name field pre-fills with the current user's name; email is shown read-only, not as an editable input
- [ ] Save (name) is disabled when the field is empty or unchanged from the current value
- [ ] Successful name update reflects immediately in `UserMenu`'s avatar initials and anywhere else `user.name` is displayed, without a page reload
- [ ] Password form's Save is disabled until current password is filled, new password isn't weak, and confirm matches
- [ ] Wrong current password surfaces the exact backend message ("Current password is incorrect"), not a generic error
- [ ] New password same as current surfaces the exact backend message, matching Feature 04/11's wording
- [ ] Successful password change clears all three password fields and shows a transient success confirmation — user is NOT logged out or redirected
- [ ] Submitting the name form does not show a stale error from a previous failed password submit, or vice versa — the two forms' loading/error states are fully independent
- [ ] No console errors or unhandled promise rejections
- [ ] Responsive at both mobile and desktop widths
- [ ] `npm run build` passes with no errors
