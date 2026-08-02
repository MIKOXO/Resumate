# Feature 02: Auth Core

## Goal

Implement self-signup and login with JWT stored in an httpOnly cookie (not returned in the response body, never touched by client JS). Includes `authMiddleware` for protecting routes and rate limiting on both endpoints. Email verification and forgot-password are separate features (03, 04) — this feature produces working signup/login only, with `emailVerified` defaulting to `false` and no verification enforcement yet (that gate is added in Feature 03).

## Design

Not applicable — backend-only feature. No UI in this feature; frontend auth pages come in Feature 13.

## Implementation

### `server/src/models/User.js`

- Fields: `email` (unique, required, lowercase), `password` (hashed, required), `name` (required), `emailVerified` (Boolean, default `false`), `createdAt`.
- No verification/reset code fields yet — those are added in Features 03/04 respectively. Don't add them speculatively here.
- Pre-save hook (or explicit call in the service — pick one and be consistent) hashes the password with `bcryptjs` before storage. Never store or log the plaintext password anywhere.

### `server/src/services/authService.js`

- `signup({ name, email, password })`: checks for existing email, hashes password, creates the User, returns the created user's safe fields (no password hash).
- `login({ email, password })`: finds user by email, compares password with `bcrypt.compare`, throws a clear auth error on mismatch (don't reveal whether it was the email or password that was wrong — generic "Invalid credentials" message).
- `generateToken(userId)`: signs a JWT with `process.env.JWT_SECRET`, reasonable expiry (e.g. 7 days).
- `getCurrentUser(userId)`: fetches and returns safe user fields for the `/me` endpoint.

### `server/src/controllers/authController.js`

- `signup`: validates input — email format, name present, and a strong password policy: minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character. Reject weak passwords with a clear message listing what's missing (not just "invalid password"). Calls `authService.signup`, on success calls `authService.generateToken`, sets it as an httpOnly cookie, returns the safe user object (never the token itself, never the password hash) in the JSON body.
- `login`: validates input presence, calls `authService.login`, sets the httpOnly cookie on success, returns the safe user object.
- `me`: reads `req.user` (set by `authMiddleware`), returns safe user fields. Used by the frontend to hydrate auth state on app load.
- `logout`: clears the cookie, returns a success response.

### Centralized Error Handler

- Create `server/src/middleware/errorHandler.js` — an Express error-handling middleware (signature `(err, req, res, next)`), registered last in `app.js`, after all routes.
- Response shape is consistent everywhere: `{ success: false, error: <message> }`.
- Map known error types to correct status codes: validation errors → `400`, auth failures (invalid credentials, missing/invalid token) → `401`, rate limit → `429` (already handled by `express-rate-limit` itself, but confirm the shape matches this pattern), not found → `404`. Anything unrecognized defaults to `500` with a generic "Something went wrong" message — never leak a raw stack trace or internal error detail to the client.
- Log the full error server-side (`console.error` is fine for now — no logging library needed yet) for anything that hits the `500` fallback, so failures are debuggable even though the client only sees a generic message.
- Controllers do not catch-and-format errors themselves. Since this project isn't using Express 5's built-in async error forwarding, wrap controller functions with a small `asyncHandler` utility (`server/src/middleware/asyncHandler.js` — a function that wraps an async route handler and forwards any thrown/rejected error to `next(err)`), rather than adding a new dependency for this. Apply it to every controller function written in this feature and going forward.

### Cookie Configuration

- Cookie name: `token` (or similar, be consistent).
- Options: `httpOnly: true`, `secure: true` in production (`false` acceptable in local dev over http), `sameSite: 'lax'`, appropriate `maxAge` matching the JWT expiry.
- Use the `cookie-parser` middleware in `app.js` so `authMiddleware` can read `req.cookies.token`.

### `server/src/middleware/authMiddleware.js`

- Reads the JWT from `req.cookies.token` (not an `Authorization` header — this project uses cookie-based auth).
- Verifies with `process.env.JWT_SECRET`. On success, attaches the decoded user id to `req.user`. On failure (missing/invalid/expired), responds `401` with a clear error, does not proceed to the controller.

### `server/src/routes/authRoutes.js`

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` — protected by `authMiddleware`
- `POST /api/auth/logout`

No other auth routes yet — verification and password reset routes are added in Features 03/04.

### Rate Limiting

- Install and configure `express-rate-limit`.
- Apply a limiter to `/api/auth/signup` and `/api/auth/login` specifically — a 15-minute window (`windowMs: 15 * 60 * 1000`) allowing 10 attempts per window per IP. This is tight enough to block automated brute-force but loose enough that a real person who mistyped their password a few times isn't locked out mid-session.
- On limit exceeded, respond `429` with a clear, non-technical error message the frontend can display as-is.

### CORS Update

- Update the `cors()` config in `app.js` (from Feature 01) to `{ origin: process.env.CLIENT_ORIGIN, credentials: true }` — required for cookies to be sent/received cross-origin between the Vite dev server and the Express server.
- Add `CLIENT_ORIGIN` to `.env` and `.env.example` (e.g. `http://localhost:5173`).

## Dependencies

- `express-rate-limit` (rate limiting on auth endpoints)
- `cookie-parser` (reading the httpOnly cookie server-side)

## Verify when done

- [ ] Signup creates a user with a hashed password, `emailVerified: false`
- [ ] Signup rejects passwords failing the strength policy (missing uppercase/lowercase/number/special char, or under 8 characters) with a clear, specific error message
- [ ] Signup response body contains no password hash and no raw JWT
- [ ] Login sets an httpOnly cookie (confirm via browser dev tools — cookie should not be readable from `document.cookie` in the console)
- [ ] `GET /api/auth/me` returns the current user when the cookie is present and valid, `401` when absent/invalid
- [ ] `authMiddleware` correctly blocks access to a route it protects when no valid cookie is present
- [ ] Logout clears the cookie
- [ ] Hitting login or signup repeatedly beyond the configured threshold returns `429`, not a stack trace
- [ ] All error responses (auth failure, validation failure, rate limit) follow the same `{ success: false, error }` shape
- [ ] No raw stack trace or internal error detail is ever sent in a response body
- [ ] An unexpected error (e.g. force a DB disconnect) still returns a clean `500` response, not a crashed server
- [ ] CORS allows the Vite dev origin with credentials — a cross-origin request from the client actually receives and sends the cookie correctly
- [ ] No console errors or unhandled promise rejections
- [ ] `npm run build` (or equivalent server start) passes with no errors
