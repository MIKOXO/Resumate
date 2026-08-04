# Feature 03: Email Verification

## Goal

Add email verification via a 6-digit code sent on signup. Login is blocked until `emailVerified` is true. Includes a resend-code endpoint. Builds directly on Feature 02's auth core — no changes to signup/login logic itself beyond adding the verification gate and triggering the email send.

## Design

Not applicable — backend-only feature. The verification-code entry screen and resend UI are built in Feature 13.

## Implementation

### `server/src/models/User.js` (extend)

- Add fields: `verificationCode` (String), `verificationCodeExpiry` (Date), `lastCodeSentAt` (Date).
- All three fields are cleared (set to `null`/`undefined`) once verification succeeds — do not leave a stale code sitting on a verified account.

### `server/src/services/emailService.js`

- Configure a Nodemailer transporter using SMTP host/port config, reading `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, and `FROM_EMAIL` from environment variables (e.g. `EMAIL_HOST=smtp.gmail.com`, `EMAIL_PORT=587`, `FROM_EMAIL=Resumate <your-address@gmail.com>`). `secure` should be `false` for port 587 (STARTTLS), not `true` — a common mistake that breaks the connection on this port.
- Export a generic `sendEmail({ to, subject, html })` function — keep it generic, not verification-specific, since Feature 04 (password reset) reuses this same service.
- Do not hardcode email copy in this file — that belongs in the calling service (see below), so `emailService.js` stays a thin, reusable transport layer.

### `server/src/services/authService.js` (extend)

- Add `generateVerificationCode()`: returns a random 6-digit numeric code (as a string, to preserve leading zeros) plus an expiry timestamp (10 minutes from generation).
- Update `signup()`: after creating the user, generate a verification code, save it to the user record along with `lastCodeSentAt: now`, and call `emailService.sendEmail` with clear, simple copy containing the code (e.g. "Your Resumate verification code is: 123456. It expires in 10 minutes."). Signup should still succeed and return a response even if the email fails to send — but log the failure clearly so it's noticeable, and consider surfacing a distinct error to the client if the send itself throws, since a user with no code has no way to proceed.
- Add `verifyEmail({ userId, code })`: checks the code matches and hasn't expired, sets `emailVerified: true`, clears the code fields (including `lastCodeSentAt`). Throws a clear, specific error for "invalid code" vs "expired code" — the frontend should be able to tell the user which happened.
- Add `resendVerificationCode({ userId })`: first checks `lastCodeSentAt` — if less than **60 seconds** have passed since the last send, reject with a clear "please wait" error including how many seconds remain (so the frontend can display an accurate countdown without guessing). If the cooldown has elapsed, generate a new code (invalidating the old one), update `lastCodeSentAt` to now, resend the email.
- Update `login()`: after password verification succeeds, check `emailVerified`. If false, reject the login with a clear, specific error (distinct from "invalid credentials") so the frontend can route the user to the verification screen instead of just showing a generic login failure.

### `server/src/controllers/authController.js` (extend)

- `verifyEmail`: validates a code was provided, calls `authService.verifyEmail`, returns success. On success, this is a good place to also set the login cookie (per Feature 02's pattern) so the user is logged in immediately after verifying, rather than being sent back to a separate login step.
- `resendCode`: requires the user to be identified somehow — since they're not logged in yet (not verified), accept the email address in the request body, look up the user, call `authService.resendVerificationCode`. If the cooldown hasn't elapsed, return the specific "please wait N seconds" error so the frontend can show an accurate countdown. Otherwise return a generic success response — either way, avoid leaking whether the email exists in the system except through the cooldown timing itself (an acceptable, minor trade-off).

### `server/src/routes/authRoutes.js` (extend)

- `POST /api/auth/verify-email`
- `POST /api/auth/resend-code`

### Rate Limiting

- Apply the same rate-limiting pattern from Feature 02 to `/api/auth/resend-code` specifically — this endpoint is a spam vector (repeatedly triggering emails to an address) and needs its own limiter, separate from login/signup. Use a tighter cap here (e.g. 3-5 requests per 15-minute window) since there's no legitimate reason to need many resends in a short window.

## Dependencies

- `nodemailer` (already installed)

## Verify when done

- [ ] Signup triggers a verification email containing a 6-digit code
- [ ] Attempting to log in before verifying returns a clear, specific "please verify your email" error — not a generic auth failure
- [ ] Submitting the correct code within the expiry window verifies the account and logs the user in (cookie set)
- [ ] Submitting an expired code returns a clear "code expired" error, distinct from "invalid code"
- [ ] Submitting a wrong code returns a clear "invalid code" error
- [ ] Resend generates a new code and invalidates the old one — the old code no longer works after a resend
- [ ] Requesting resend within 60 seconds of the last send is rejected with a clear "please wait" error stating remaining seconds
- [ ] Requesting resend after the 60-second cooldown has elapsed succeeds normally
- [ ] Resend endpoint is rate-limited separately from login/signup, with a tighter cap
- [ ] Resend does not reveal whether the submitted email exists in the system (same response either way)
- [ ] All error responses follow the existing `{ success: false, error }` shape from Feature 02's error handler
- [ ] No console errors or unhandled promise rejections
- [ ] Server starts cleanly with no errors
