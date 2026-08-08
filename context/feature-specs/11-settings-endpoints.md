# Feature 11: Settings Endpoints

## Goal

Let a logged-in user update their name and change their password. Email is fixed at signup and cannot be changed — it's tied to `emailVerified`, and editing it would require re-verification logic that isn't worth the complexity for this tool. This is the final backend feature — after this, the backend build order moves to frontend features (12 onward).

## Design

Not applicable — backend-only feature. The Settings page UI is built in Feature 17.

## Implementation

### `server/src/services/authService.js` (extend)

- `updateName({ userId, name })`: validates `name` is present and non-empty, updates the User record, returns the safe updated user object.
- `changePassword({ userId, currentPassword, newPassword })`:
  - Fetches the user, compares `currentPassword` against the stored hash with `bcrypt.compare` — reject with a clear `"Current password is incorrect"` error if it doesn't match.
  - Validates `newPassword` against the same strength policy from Feature 02 (8+ chars, upper/lower/number/special char).
  - Compares `newPassword` against the current password hash — reject with the same `"New password must be different from your current password"` error used in Feature 04's reset flow (reuse this check rather than reimplementing it — extract to a shared helper if it isn't already shared between `authService` functions).
  - Hashes and saves the new password.
  - Does not force logout on other sessions — same accepted limitation as Feature 04 (no session store, single stateless JWT cookie).

### `server/src/controllers/authController.js` (extend)

- `updateName`: reads `req.user` for the user id, validates `name` from `req.body`, calls `authService.updateName`, returns the updated safe user object.
- `changePassword`: reads `req.user` for the user id, validates `currentPassword` and `newPassword` are present in `req.body`, calls `authService.changePassword`, returns a success response. Does not return any token or user object beyond a simple success confirmation — no need to reissue the cookie since the session itself is unaffected by a password change.

### `server/src/routes/authRoutes.js` (extend)

- `PATCH /api/auth/me` (update name)
- `PATCH /api/auth/password` (change password)
- Both protected by `authMiddleware` — these require an authenticated session, unlike the forgot-password flow which is for users who can't log in at all.

## Dependencies

None new.

## Verify when done

- [ ] Updating name with a valid value succeeds and is reflected in a subsequent `GET /api/auth/me` call
- [ ] Updating name with an empty value is rejected with a clear `400` error
- [ ] Changing password with the correct current password and a valid new password succeeds
- [ ] Changing password with an incorrect current password is rejected with a clear, specific error — not a generic failure
- [ ] Changing password to the same value as the current password is rejected with the same specific error used in Feature 04's reset flow
- [ ] Changing password to a value that fails the strength policy is rejected with the same specific messaging as signup/reset
- [ ] Neither endpoint accepts or processes an `email` field, even if one is sent in the request body — confirm email truly cannot be changed through this feature
- [ ] Both endpoints reject requests with no valid auth cookie (`401`)
- [ ] Error responses follow the existing `{ success: false, error }` shape
- [ ] No console errors or unhandled promise rejections
- [ ] Server starts cleanly with no errors
