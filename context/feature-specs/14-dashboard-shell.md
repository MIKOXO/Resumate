# Feature 14: Dashboard Shell

## Goal

Build the two-panel Dashboard shell — top bar, left panel, right panel — that Features 15-17 slot their real content into. No real team member/prospect data yet; this feature only builds the structural frame, empty states, skeleton loading components, and a working user dropdown (Settings/Logout). `/dashboard` now renders this real shell instead of Feature 12/13's placeholder.

## Design

Per `ui-context.md`'s Dashboard layout pattern:

- **shadcn/ui components used**: `DropdownMenu` (user menu), `Avatar` (or a simple initials circle if `Avatar` feels like overkill for two users — use judgment, but prefer the shadcn primitive for consistency with the rest of the system). Add these to `client/src/components/ui/` per Feature 12's manual-scaffold pattern.
- **Top bar**: fixed, thin, bottom border (`--border-default`). Left side: the reusable `Logo` component (already built — locate and reuse it, do not recreate it). Right side: a user icon/avatar button that opens a dropdown containing "Settings" (routes to `/settings`, built in Feature 17 — the link can exist now even though the page doesn't yet) and "Logout" (calls the logout thunk, redirects to `/login`).
- **Left panel**: fixed width (~300px), right border separator. Skeleton state (4-5 placeholder rows) and empty state ("No team members yet — Add one to start organizing prospects") both exist as components, per the approved mockup — this feature builds and displays these without wiring any real fetch (Feature 15 owns the actual data/loading transition).
- **Right panel**: flexible width, centered empty state ("Select a prospect to get started") per the approved mockup.
- **Animations**: page/shell entrance fades and slightly rises on mount (Framer Motion, same restrained pattern as Feature 13's auth pages — ~200-250ms, ease-out, no bounce). The user dropdown opens/closes with a small scale+fade transition, not an instant snap. Empty-state icons can have a very subtle idle presence (e.g. a slow, minimal opacity pulse) — nothing distracting, this is a resting state, not an active one.

## Implementation

### shadcn Components (add first)

- `DropdownMenu` (and its sub-parts — `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`) from ui.shadcn.com, adapted to this project's tokens.
- `Avatar` (`AvatarFallback` at minimum, for initials-based display since there's no photo upload in this app).

### `client/src/components/UserMenu.jsx`

- Avatar/icon button (shows the current user's initials via `AvatarFallback`, pulled from `authSlice`'s `user.name`) that triggers the `DropdownMenu`.
- Menu items: "Settings" (a `Link` to `/settings`), "Logout" (calls `useAuth()`'s logout function, then navigates to `/login`).
- Animated open/close via Framer Motion or the shadcn dropdown's built-in animation primitives — confirm it's not an abrupt show/hide.

### `client/src/components/TopBar.jsx`

- Renders the reusable `Logo` component on the left (locate its existing path from Feature 12/13's work — do not rebuild it) and `UserMenu` on the right, with the border/height spec from `ui-context.md`.

### `client/src/components/TeamMemberListSkeleton.jsx`

- 4-5 skeleton rows matching the dimensions of a real team-member/prospect row (small square + two text-line placeholders), using shadcn's `Skeleton` component (add this too if not already present from an earlier feature — check first).

### `client/src/components/EmptyState.jsx`

- Generic, reusable empty-state component: icon + short title + short subtitle, centered. Used for both the left panel's "no team members" state and the right panel's "select a prospect" state — pass icon/title/subtitle as props rather than building two separate one-off components.

### `client/src/pages/Dashboard.jsx`

- Two-panel grid layout (`260px` fixed left / flexible right) below the `TopBar`, per the approved mockup.
- Left panel: renders `EmptyState` with the "no team members" copy for now (Feature 15 will replace this with real conditional logic: skeleton while loading → real tree once data exists → this same empty state only when genuinely empty).
- Right panel: renders `EmptyState` with the "select a prospect" copy — this one's copy/behavior stays exactly as-is even after Feature 16 lands, since it's only shown when nothing is selected.

## Dependencies

None new — `framer-motion`, `lucide-react` already installed; shadcn's `DropdownMenu`/`Avatar`/`Skeleton` are manually scaffolded per Feature 12's pattern, not npm packages.

## Verify when done

- [ ] `/dashboard` renders the real shell — top bar, two-panel layout — not Feature 12/13's placeholder
- [ ] The existing reusable `Logo` component is used in the top bar, not rebuilt from scratch
- [ ] User avatar/icon in the top bar opens a dropdown with "Settings" and "Logout" options
- [ ] "Logout" actually logs the user out (clears the session) and redirects to `/login`
- [ ] "Settings" link exists and points to `/settings` (page itself doesn't need to exist yet — Feature 17 builds it)
- [ ] Dropdown open/close is animated, not an instant snap
- [ ] Left panel shows the "no team members" empty state; `TeamMemberListSkeleton` component exists and renders correctly when manually toggled/tested, even though nothing wires it to real loading yet
- [ ] Right panel shows the "select a prospect" empty state
- [ ] Shell has a subtle entrance animation on mount, consistent with Feature 13's auth page pattern
- [ ] Layout matches the approved mockup: 260px left panel, flexible right panel, correct borders per `ui-context.md`
- [ ] No console errors or warnings
- [ ] Responsive at both mobile and desktop widths
- [ ] `npm run build` passes with no errors
