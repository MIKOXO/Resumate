# Feature 04: Password Reset

## Goal

Add forgot-password flow: request a 6-digit reset code by email, submit the code with a new password to reset it. Reuses `emailService` from Feature 03. New password cannot match the current password. On success, the user is logged in automatically (cookie set), same pattern as email verification.

## Design

Not applicable — backend-only feature. Forgot/reset password screens are built in Feature 13.

## Implementation

### `server/src/models/User.js` (extend)

- Add fields: `resetCode` (String), `resetCodeExpiry` (Date), `lastResetCodeSentAt` (Date).
- All three fields are cleared once a reset succeeds — do not leave a stale code on the account.

### `server/src/services/authService.js` (extend)

- Add `requestPasswordReset({ email })`: looks up the user by email. If not found, return normally without throwing (see enumeration protection below). If found, check `lastResetCodeSentAt` against the same 60-second cooldown pattern as Feature 03's resend — reject with a "please wait N seconds" error if within cooldown. Otherwise generate a 6-digit code + 10-minute expiry (reuse the same code-generation logic from Feature 03, don't duplicate it — extract to a shared helper if it isn't already), save it with `lastResetCodeSentAt: now`, and call `emailService.sendEmail` with clear copy containing the code.
- Add `resetPassword({ email, code, newPassword })`: looks up the user, validates the code matches and hasn't expired (clear, distinct errors for "invalid code" vs "expired code", same as Feature 03). Validates `newPassword` against the same strength policy from Feature 02. **Compares `newPassword` against the existing password hash with `bcrypt.compare` — if it matches, reject with a clear "new password must be different from your current password" error, before hashing or saving anything.** If all checks pass, hash the new password, save it, clear the reset code fields, and return the user so the controller can issue a fresh login cookie.

### `server/src/controllers/authController.js` (extend)

- `forgotPassword`: accepts `email` in the request body, calls `authService.requestPasswordReset`. Always returns the same generic success response ("If that email exists, a reset code has been sent") regardless of whether the user was found — this is the enumeration protection. The cooldown "please wait" error is the one exception that does surface distinctly, matching Feature 03's resend behavior.
- `resetPassword`: accepts `email`, `code`, `newPassword` in the request body, calls `authService.resetPassword`. On success, generates a JWT and sets the httpOnly cookie (same as login/verify-email), returns the safe user object.

### `server/src/routes/authRoutes.js` (extend)

- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Rate Limiting

- Apply the same rate-limiting pattern from Feature 02/03 to both endpoints. `/forgot-password` uses the tighter resend-style limiter (this is the same spam vector as Feature 03's resend-code). `/reset-password` uses the standard login/signup-style limiter — it's a target for brute-forcing the 6-digit code.

### Session Handling

- No forced logout/session invalidation on other devices — out of scope for MVP, since there's no session store, only a single stateless JWT cookie. This is an accepted limitation for a 2-user internal tool, not an oversight.

## Dependencies

None new — reuses `nodemailer` (Feature 03) and `bcryptjs`/`jsonwebtoken` (Feature 02).

## Verify when done

- [ ] Requesting a reset for a real, registered email sends a 6-digit code
- [ ] Requesting a reset for a non-existent email returns the same generic success response (no enumeration leak)
- [ ] Requesting a reset twice within 60 seconds is rejected with a "please wait" error stating remaining seconds
- [ ] Submitting the correct code + a new password that passes the strength policy resets the password and logs the user in (cookie set)
- [ ] Submitting a new password identical to the current one is rejected with a clear, specific error — before any hash/save occurs
- [ ] Submitting a new password that fails the strength policy is rejected with the same specific messaging as signup
- [ ] Submitting an expired code returns "code expired", distinct from "invalid code"
- [ ] Submitting a wrong code returns "invalid code"
- [ ] Reset code is cleared after successful use — cannot be reused
- [ ] Both endpoints are rate-limited appropriately (forgot-password: resend-style cap; reset-password: login-style cap)
- [ ] All error responses follow the existing `{ success: false, error }` shape
- [ ] No console errors or unhandled promise rejections
- [ ] Server starts cleanly with no errors
