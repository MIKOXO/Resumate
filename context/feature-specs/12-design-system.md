# Feature 12: Design System

## Goal

Set up the frontend foundation: Vite dev server on port 3000, Tailwind CSS configured with the color/radius/font tokens from `ui-context.md`, shadcn/ui initialized, Urbanist font loaded, and base layout primitives (App shell, router setup) in place. No real pages or features yet — this is the scaffolding every later frontend feature builds on top of.

## Design

Every token below comes directly from `ui-context.md` — do not invent, adjust, or approximate any value. If something needed isn't in `ui-context.md`, stop and ask rather than guessing.

- Dark-only theme, no toggle, ever.
- Full color token table, border radius scale, and Urbanist font per `ui-context.md`.
- Minimal border radius (`6px`/`8px`/`12px` scale) — no Tailwind default `xl`/`2xl`/`3xl` usage anywhere.

## Implementation

### Vite Port Configuration

- In `client/vite.config.js`, set the dev server to run on port `3000` (not Vite's `5173` default):
  ```js
  export default defineConfig({
    // ...existing config
    server: {
      port: 3000,
    },
  });
  ```

### Tailwind Config

- Configure `tailwind.config.js` with custom CSS variable-backed colors matching the table in `ui-context.md` exactly: `bg-base`, `bg-surface`, `bg-elevated`, `text-primary`, `text-muted`, `text-disabled`, `accent-primary`, `accent-hover`, `border-default`, `border-strong`, `state-success`, `state-success-bg`, `state-error`, `state-error-bg`, `state-warning`.
- Define these as actual CSS custom properties in `client/src/index.css` (under `:root`, since this app is dark-only — no `:root` vs `.dark` split needed), then reference them in Tailwind config via `var(--token-name)` so components can use plain Tailwind utility classes (e.g. `bg-surface`, `text-primary`) that resolve to the correct hex values.
- Set the border radius scale in Tailwind config: `sm: 6px`, `md: 8px`, `lg: 12px` (be deliberate about naming so it doesn't collide confusingly with Tailwind's built-in scale — confirm the final class names read cleanly, e.g. `rounded-sm`/`rounded-md`/`rounded-lg` mapped to `6px`/`8px`/`12px`).

### Urbanist Font

- Add the Urbanist font via Google Fonts `<link>` tags in `client/index.html` (weights: at minimum 400, 500, 600, 700 — covers regular through bold usage across the app).
- Set `--font-sans: 'Urbanist', sans-serif` in `index.css`, apply it as the base font on `body` via Tailwind's `fontFamily` config so it's the default everywhere without needing to repeat a class on every element.

### shadcn/ui Init

- Run `npx shadcn@latest init`, configured for the dark-only theme (no light/dark toggle setup — decline any "add dark mode support" prompts the CLI offers, since this app never needs a toggle).
- Confirm the generated `components.json` points components at `client/src/components/ui/`, matching the directory structure already defined in `architecture.md`.
- Do not add individual components yet (button, input, etc.) — those get added as each later feature actually needs them, not preemptively here.

### Base App Shell

- `client/src/App.jsx`: set up `react-router-dom` with a `BrowserRouter`, placeholder routes for `/login`, `/signup`, `/dashboard` (each rendering a minimal placeholder component for now — real page content comes in Features 13-17).
- `client/src/main.jsx`: wraps `App` in the Redux `Provider` (store itself can be a minimal empty-slice placeholder for now — real slices come with Feature 13's auth pages).
- Confirm `index.css` is imported once at the app root, Tailwind directives (`@tailwind base/components/utilities`) present.

## Dependencies

None new — `tailwindcss`, `postcss`, `autoprefixer` already installed from initial setup; shadcn's own dependencies (`class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`) install automatically via its CLI.

## Verify when done

- [ ] `npm run dev` starts the Vite dev server on port 3000, not 5173
- [ ] The app renders a dark background (`--bg-base`) with no flash of unstyled/light content
- [ ] Urbanist is visibly applied as the default font (confirm in browser dev tools, not just visually)
- [ ] Tailwind utility classes using the custom tokens (e.g. a test `bg-surface` div) render the correct color
- [ ] Border radius utilities produce the correct minimal values (6px/8px/12px), not Tailwind's default rounded-xl+ scale
- [ ] shadcn/ui is initialized, `components/ui/` folder exists and is ready to receive components in later features
- [ ] Routing works: navigating to `/login`, `/signup`, `/dashboard` renders the correct placeholder without errors
- [ ] No console errors or warnings on load
- [ ] `npm run build` passes with no errors
