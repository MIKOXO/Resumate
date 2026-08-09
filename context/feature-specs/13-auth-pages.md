# Feature 13: Auth Pages

## Goal

Build Login, Signup, Verify Email, and Forgot/Reset Password pages — fully wired to the backend endpoints from Features 02-04. Compact, no-scroll cards, live inline validation, animated icon interactions, a shared 6-box OTP input with dual timers, and disabled-until-valid buttons throughout. This is the first feature where the frontend actually talks to the real backend.

## Design

Per `ui-context.md`: centered card on `--bg-base`, max-width ~400px, `--bg-surface` background, `12px` radius (`rounded-lg`). Additional constraints specific to this feature:

- **Compact, no scroll** — every auth screen must fit within a typical viewport with zero scrolling. Keep vertical spacing tight and deliberate; this is a hard constraint, not a suggestion.
- **Subtle border, minimal shadow** — `border border-default`, at most a very soft `shadow-sm`-equivalent (near-none) — no heavy card elevation.
- **Icons**: all input icons sit on the right side of the field (not left, per explicit instruction), using Lucide React at `h-4 w-4` per `ui-context.md`'s inline sizing.
- **Password eye icon**: toggles between `Eye`/`EyeOff`, animated via Framer Motion (a small scale/fade transition on swap, not an instant snap), functional (actually toggles the input's `type` between `password`/`text`).
- **Buttons**: disabled (visually muted, `cursor-not-allowed`) until all fields are valid. Loading state replaces button text with a small animated spinner (Framer Motion or a simple CSS-driven spin via Lucide's `Loader2` icon) — minimal, not a full skeleton, not a large spinner.
- **Inline errors**: appear live, under the specific field, as the user types (e.g. invalid email format shown immediately, not on submit). Small text in `--state-error`.
- **Block errors**: for server-side/request-level failures (wrong credentials, expired code, etc.) — a bordered banner above the form fields, `--state-error` border and text, `--state-error-bg` background, `8px` radius. Clear, specific, human-readable message — reuse exactly what the backend returns where it's already clear (per Features 02-04's specific error messaging), don't paraphrase it into something vaguer.

## Implementation

### Shared Components

#### `client/src/components/PasswordInput.jsx`

- Wraps a text input with the animated eye-icon toggle described above. Used by Signup, Reset Password, and (for the current-password field) later in Feature 17's Settings page — build it generic enough to be reused there without modification.

#### `client/src/components/PasswordStrengthBar.jsx`

- Per `ui-context.md`: thin animated bar (Framer Motion width/color transition), three tiers (weak/`--state-error`, medium/`--state-warning`, strong/`--state-success`), paired with a text label. Strength logic mirrors the backend policy exactly (8+ chars, uppercase, lowercase, number, special character) — implement as a small pure utility function, not duplicated inline in the component, so Signup and Reset Password both import the same check.
- Used by Signup and the Reset Password step.

#### `client/src/components/OTPInput.jsx`

- 6 separate boxes, horizontal, auto-advances focus to the next box on digit entry, supports paste (pasting a 6-digit code fills all boxes at once), backspace moves focus back. Subtle focus animation per box (Framer Motion border/scale on active box).
- Displays two independent timers, clearly distinguished visually:
  - **Expiry countdown**: `MM:SS` counting down from 10:00. When it hits `0:00`, the input is disabled and a clear "Code expired, request a new one" message replaces it.
  - **Resend cooldown**: separate, smaller text near the "Resend code" link — disabled and showing "Resend in 47s" style countdown for 60 seconds after each send, becomes a clickable link at zero (per `ui-context.md`).
- Accepts an `onComplete(code)` callback fired once all 6 digits are entered — doesn't require a separate explicit submit click, but also exposes the raw code value to a parent-controlled submit button for the Forgot Password flow (see below), since that flow can't verify the code independently (see Design note).

### `client/src/store/slices/authSlice.js`

- State: `isAuthenticated`, `user` (safe fields only — name, email), `loading`, `error`.
- Additional state for the forgot-password flow specifically: `resetFlow: { step, email }` — `step` is one of `'request' | 'otp' | 'reset'`. This tracks progress through the three-part flow without needing separate routes per step (see Routing below).
- `createAsyncThunk`s: `login`, `signup`, `verifyEmail`, `resendVerificationCode`, `fetchCurrentUser` (calls `/me` on app load), `logout`, `requestPasswordReset`, `resetPassword`.
- Reducers handle setting `resetFlow.step` forward as each part of the forgot-password flow succeeds.

### `client/src/services/authService.js`

- Axios calls (with `withCredentials: true` already configured on the shared `axiosInstance`) to: `POST /api/auth/login`, `POST /api/auth/signup`, `GET /api/auth/me`, `POST /api/auth/logout`, `POST /api/auth/verify-email`, `POST /api/auth/resend-code`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`.

### `client/src/hooks/useAuth.js`

- Wraps `useSelector`/`useDispatch` for the auth slice — exposes `{ user, isAuthenticated, loading, error, login, signup, logout, ... }` as a single hook so pages don't import actions/selectors directly.

### Pages

#### `client/src/pages/Login.jsx`

- Fields: email (mail icon, right-aligned), password (`PasswordInput`).
- Live inline validation: email format checked as-typed; password just needs non-empty (login doesn't enforce the strength policy — that's a signup/reset-only rule).
- Submit disabled until both fields pass their live checks.
- On submit: calls `login`. On success, redirect to `/dashboard`. On failure: if the error indicates unverified email specifically (distinct error from Feature 02/03), redirect to `/verify-email` instead of showing a generic block error — otherwise show the block error banner with the backend's specific message.
- Links: "Forgot password?" → `/forgot-password`, "Don't have an account? Sign up" → `/signup`.

#### `client/src/pages/Signup.jsx`

- Fields: name (user icon, right-aligned), email (mail icon, right-aligned), password (`PasswordInput` + `PasswordStrengthBar`), confirm password (`PasswordInput`, no strength bar needed on this one).
- Live inline validation: name non-empty, email format, password against the strength policy (live, matching the bar), confirm-password matches password (checked live as the user types the second field, not just on submit).
- Submit disabled until all four fields pass.
- On submit: calls `signup`. On success, redirect to `/verify-email` (not directly to dashboard — email isn't verified yet).
- Link: "Already have an account? Log in" → `/login`.

#### `client/src/pages/VerifyEmail.jsx`

- Uses `OTPInput`. Subtitle shows the email being verified (masked, e.g. `m***e@gmail.com`, if straightforward to implement — otherwise show it plainly, don't over-engineer masking for an internal tool).
- `onComplete` auto-submits to `verifyEmail` (real server verification exists here — see Design note point 2).
- On success: cookie is set by the backend response, redirect to `/dashboard`.
- On failure: block error banner with the specific "invalid code" or "expired code" message from the backend.
- Resend link wired to `resendVerificationCode`, respecting the cooldown timer.

#### `client/src/pages/ForgotPassword.jsx`

- Single route, internal step state driven by `resetFlow.step` in the auth slice — no separate routes per step, since deep-linking into the middle of this flow isn't meaningful (the state doesn't persist across a page refresh, and that's an acceptable limitation for this internal tool).
- **Step `'request'`**: email input only, live format validation, submit calls `requestPasswordReset`. On success, moves to step `'otp'`. Always shows the same generic success framing per the backend's enumeration-protection behavior (Feature 04) — do not imply confirmation that the email exists.
- **Step `'otp'`**: uses `OTPInput`, but does NOT call any verify endpoint on complete (none exists for this flow — see Design note point 2). Instead, `onComplete` simply validates the code is 6 digits client-side and advances to step `'reset'`, carrying the code value forward in local component state (not Redux — this is transient, only needed for the next screen's submission). Resend link here calls `requestPasswordReset` again (reuses the same endpoint/cooldown as the initial request).
- **Step `'reset'`**: new password (`PasswordInput` + `PasswordStrengthBar`, reusing the same component/logic as Signup) + confirm password. Submit calls `resetPassword` with the code carried from the previous step. **This is where a wrong/expired code actually surfaces as an error** — block error banner with the backend's specific message. If it fails here, do not silently send the user back to the OTP step; show the error on this screen and let them retry submission (they'd need to go back manually via a "start over" link if the code truly expired).
- On successful reset: cookie is set, redirect to `/dashboard`.

### Routing (`client/src/App.jsx`, extend from Feature 12)

- Replace the placeholder routes with the real page components: `/login`, `/signup`, `/verify-email`, `/forgot-password`, `/dashboard` (still a placeholder — real dashboard is Feature 14).
- Add a simple auth guard: unauthenticated users hitting `/dashboard` redirect to `/login`; authenticated users hitting `/login` or `/signup` redirect to `/dashboard`. Base this on `authSlice`'s `isAuthenticated`, hydrated via `fetchCurrentUser` called once on app load in `main.jsx` or a top-level layout component.

## Dependencies

None new — `react-router-dom`, `@reduxjs/toolkit`, `react-redux`, `axios`, `framer-motion`, `lucide-react` all already installed.

## Verify when done

- [ ] All four auth screens fit without scrolling at a standard laptop viewport (test at ~1366x768 minimum)
- [ ] Password eye icon toggles visibility with a visible animation, functions correctly (actually changes input type)
- [ ] All input icons are right-aligned per spec
- [ ] Email format, password strength, and confirm-password-match errors all appear live as the user types, not only on submit
- [ ] Submit buttons are visibly disabled until all fields are valid, and cannot be clicked while disabled
- [ ] Loading state shows a minimal animated indicator, not a full-page spinner or skeleton
- [ ] Block error banners appear for server-side failures with the backend's specific message, styled per the error token/border spec
- [ ] OTP input: 6 boxes, auto-advance, paste-fill works, backspace navigates back correctly
- [ ] OTP expiry countdown and resend cooldown are visually distinct and both function independently
- [ ] Verify Email flow: real server verification on code entry, correct redirect to dashboard on success
- [ ] Forgot Password flow: email step → OTP step (client-only format check, no premature verification) → reset step, with the actual code validity only checked at final submission — confirm an expired/wrong code correctly surfaces its error on the reset step, not the OTP step
- [ ] Signup redirects to Verify Email, not directly to dashboard
- [ ] Auth guard correctly redirects unauthenticated users away from `/dashboard` and authenticated users away from `/login`/`/signup`
- [ ] No console errors or warnings
- [ ] Responsive at both mobile and desktop widths
- [ ] `npm run build` passes with no errors
