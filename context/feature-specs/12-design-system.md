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

### Tailwind v4 Config

This project uses Tailwind v4, which is CSS-first — there is no `tailwind.config.js` to fill out the way Tailwind v3 projects work. Do not create one; do not install `postcss`/`autoprefixer` for this (v4 doesn't need them, it uses the `@tailwindcss/vite` plugin directly).

- In `client/vite.config.js`, import and add the `@tailwindcss/vite` plugin to the `plugins` array.
- In `client/src/index.css`, use `@import "tailwindcss";` at the top (replaces the old `@tailwind base/components/utilities` three-line directive from v3).
- Define the design tokens from `ui-context.md` inside a `@theme` block in `index.css` — this is how v4 replaces `tailwind.config.js`'s `theme.extend.colors`. Example shape (fill in the real values from `ui-context.md`'s color table, do not approximate):

  ```css
  @theme {
    --color-bg-base: #0a0a0b;
    --color-bg-surface: #141416;
    --color-bg-elevated: #1c1c1f;
    --color-text-primary: #fafafa;
    --color-text-muted: #a1a1aa;
    --color-text-disabled: #5c5c61;
    --color-accent-primary: #ffffff;
    --color-accent-hover: #e4e4e7;
    --color-border-default: #2a2a2e;
    --color-border-strong: #3a3a3f;
    --color-state-success: #3dd68c;
    --color-state-success-bg: #123324;
    --color-state-error: #f16063;
    --color-state-error-bg: #3a1616;
    --color-state-warning: #f5b94d;

    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;

    --font-sans: 'Urbanist', sans-serif;
  }
  ```

- With this `@theme` block, Tailwind v4 auto-generates the matching utility classes (`bg-surface`, `text-primary`, `rounded-sm`, `font-sans`, etc.) — no separate config file mapping needed, the CSS variable names drive the class names directly.

### Urbanist Font

- Add the Urbanist font via Google Fonts `<link>` tags in `client/index.html` (weights: at minimum 400, 500, 600, 700 — covers regular through bold usage across the app).
- `--font-sans` is already defined in the `@theme` block above — apply `font-sans` on `body` (or a root wrapper) so Urbanist is the default everywhere without repeating a class on every element.

### shadcn/ui Setup (Manual Scaffold)

The `shadcn` CLI (both the classic pinned version and the current `@latest` v4) is unreliable for this project as of implementation time — the classic CLI is blocked by registry version drift against the new component registry format, and the current v4 CLI imposes its own preset theme/font system (e.g. Geist, Base UI/Radix presets) that conflicts with this project's Urbanist font and custom tokens. Do not attempt to run either CLI. Instead, manually scaffold what `shadcn init` would normally produce:

- Create `client/components.json` by hand, matching what a `new-york-v4` style, CSS-variables-based init would produce — pointing components at `client/src/components/ui/`.
- Create `client/src/lib/utils.js` with the standard `cn()` helper (combines `clsx` + `tailwind-merge`):

  ```js
  import { clsx } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  export function cn(...inputs) {
    return twMerge(clsx(inputs));
  }
  ```

- Install the four dependencies shadcn components rely on: `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`.
- Do not add individual UI components (button, input, etc.) via any CLI in this or later features — since the CLI path is unreliable, components should be added by copying the source directly from shadcn's component documentation/registry site (ui.shadcn.com) and adapting it to this project's `cn()` helper and `@theme` tokens, one component at a time, as each later feature actually needs it.

### Base App Shell

- `client/src/App.jsx`: set up `react-router-dom` with a `BrowserRouter`, placeholder routes for `/login`, `/signup`, `/dashboard` (each rendering a minimal placeholder component for now — real page content comes in Features 13-17).
- `client/src/main.jsx`: wraps `App` in the Redux `Provider` (store itself can be a minimal empty-slice placeholder for now — real slices come with Feature 13's auth pages).
- Confirm `index.css` is imported once at the app root, Tailwind directives (`@tailwind base/components/utilities`) present.

## Dependencies

- `@tailwindcss/vite` (Tailwind v4's Vite plugin — replaces the v3 `postcss`/`autoprefixer` pattern; if `tailwindcss` v4 is already installed but `@tailwindcss/vite` isn't, install it now)
- shadcn's own dependencies (`class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`) install automatically via its CLI

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
