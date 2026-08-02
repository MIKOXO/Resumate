# Unit 01: Project Setup

## Read 'AGENT.md' before starting

## Goal

Set up the Express server foundation — app entrypoint, environment config, MongoDB Atlas connection, and Cloudflare R2 client config. No routes, controllers, or business logic yet. When this unit is done, the server starts cleanly, connects to MongoDB, and has a working R2 client ready to be used by later units.

## Design

Not applicable — this is a backend infrastructure unit, no UI.

## Implementation

### Environment Config

- Create `server/.env` (already gitignored) with the following keys — values are provided by Mike, do not generate or guess them:
  ```
  PORT=5000
  MONGODB_URI=
  JWT_SECRET=
  R2_ACCOUNT_ID=
  R2_ACCESS_KEY_ID=
  R2_SECRET_ACCESS_KEY=
  R2_BUCKET_NAME=
  R2_ENDPOINT=
  ```
- Create `server/.env.example` with the same keys but empty values — this one IS committed to git, so future setup (or the coworker) knows what's required without seeing real secrets.
- Load env vars via `dotenv` at the very top of `server/src/app.js`, before anything else runs.

### `server/src/config/db.js`

- Export a function `connectDB()` that connects to MongoDB Atlas using `mongoose.connect(process.env.MONGODB_URI)`.
- Log a clear success message on connect, and exit the process with a clear error message on failure — don't let the app run in an unconnected state.

### `server/src/config/r2.js`

- Export a configured `@aws-sdk/client-s3` `S3Client` instance pointed at the R2 endpoint (`process.env.R2_ENDPOINT`), using `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` as credentials, region set to `"auto"` (R2 doesn't use AWS regions).
- Export the client only — do not add upload/download helper functions here. Those belong in a `prospectService` in a later unit; this file's only job is to configure and export the client.

### `server/src/app.js`

- Standard Express app setup: `express.json()` middleware, `cors()` (allow the client's dev origin), a single health-check route (`GET /api/health` returning `{ status: "ok" }`).
- Call `connectDB()` on startup.
- No other routes yet — routes are added starting Unit 02.
- Export the app and start it listening on `process.env.PORT` (default 5000 if unset).

### `server/package.json`

- Confirm `"type": "module"` is set.
- Confirm `dev` script runs `nodemon src/app.js`.

## Dependencies

All required packages are already installed (`express`, `mongoose`, `dotenv`, `@aws-sdk/client-s3`, `cors`, `nodemon`). No new packages needed for this unit.

## Verify when done

- [ ] `npm run dev` starts the server with no errors
- [ ] Console shows a clear "MongoDB connected" message
- [ ] `GET /api/health` returns `{ status: "ok" }` when hit locally (e.g. via curl or browser)
- [ ] `.env` is confirmed present in `.gitignore` and does NOT show up in `git status`
- [ ] `.env.example` exists and is tracked by git, with empty values only
- [ ] No console errors or unhandled promise rejections on startup
- [ ] R2 client exports without throwing (no actual upload/download test yet — that's Unit 06)
