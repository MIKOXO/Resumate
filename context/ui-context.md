# UI Context — Resumate

## Theme

Dark only. No light mode, no theme toggle — ever. The design language is a dark technical workspace: near-black backgrounds, layered surfaces for depth, white as the primary accent (not a saturated brand color), and muted, modern success/error tones rather than default bright red/green. Minimal border radius throughout — sharp and professional, not soft or bubbly.

## Colors

All components must use these tokens — no hardcoded hex values anywhere.

| Role | CSS Variable | Value |
|---|---|---|
| Page background | `--bg-base` | `#0A0A0B` |
| Surface (cards, panels) | `--bg-surface` | `#141416` |
| Elevated (modals, dropdowns, popovers) | `--bg-elevated` | `#1C1C1F` |
| Primary text | `--text-primary` | `#FAFAFA` |
| Muted text | `--text-muted` | `#A1A1AA` |
| Disabled text | `--text-disabled` | `#5C5C61` |
| Primary accent | `--accent-primary` | `#FFFFFF` |
| Accent hover | `--accent-hover` | `#E4E4E7` |
| Border (default) | `--border-default` | `#2A2A2E` |
| Border (strong / inputs) | `--border-strong` | `#3A3A3F` |
| Success | `--state-success` | `#3DD68C` |
| Success background | `--state-success-bg` | `#123324` |
| Error | `--state-error` | `#F16063` |
| Error background | `--state-error-bg` | `#3A1616` |
| Warning | `--state-warning` | `#F5B94D` |

## Typography

| Role | Font | Variable |
|---|---|---|
| UI text (all of it) | Urbanist | `--font-sans` |

Urbanist is the only font in the project — no monospace font needed (no code display in this app).

## Border Radius

Minimal, professional rounding only. No `rounded-xl`/`2xl`/`3xl` (Tailwind default scale) anywhere.

| Context | Class / Value |
|---|---|
| Inline / small UI (inputs, small buttons, badges) | `rounded-md` → `6px` |
| Buttons, cards | `rounded-lg` → `8px` |
| Modals, overlays, larger panels | `12px` (custom `--radius-lg` token, not Tailwind's `xl`) |
| Avatars, icon-only circular buttons, status dots | `rounded-full` — the only case full rounding is allowed |

## Component Library

shadcn/ui on top of Tailwind CSS. Components live in `components/ui/` and are added via the shadcn CLI — never hand-written from scratch, never edited directly once generated (see `ai-workflow-rules.md`). Project-specific composition happens in `components/`, wrapping shadcn primitives rather than modifying them.

## Layout Patterns

- **Dashboard**: two-panel layout, not a nav sidebar. This app has one real screen — a sidebar implies navigation between sections that don't exist here.
  - **Top bar**: fixed, thin, bottom border (`--border-default`). App name/logo, user email, logout button.
  - **Left panel**: fixed width (~300px), full height below top bar, right border separator. Scrollable list of Job Applying Team members, each a collapsible row — expand to reveal that member's prospects nested underneath. "Add Team Member" action pinned at the top; "Add Prospect" appears inside an expanded team member's group. Each prospect row shows name + last-updated indicator.
  - **Right panel**: flexible width, the active workspace. Selected prospect's name, JD textarea, company name + date inputs, Generate button, and the result/download card once generation completes.
- **Auth screens** (Signup, Login, Verify Email, Forgot Password, Reset Password): centered card on `--bg-base`, max-width ~400px, `--bg-surface` background, `12px` radius. Verify Email screen uses a 6-digit code input (segmented, one box per digit) with a "resend code" text link below.
- **Settings**: accessed from the top bar (icon or user menu), opens as a page or modal — same centered-card treatment as auth screens. Fields: name, email, change password (current password required). Save button uses the same primary button style as Generate.
- **Modals**: centered overlay with backdrop blur, `--bg-elevated` background, `12px` radius. Used for "Add Prospect" upload and "Replace Resume" confirmation.
- **Empty states**: when no prospect is selected, right panel shows a centered placeholder (icon + short text) — never a blank space.
- **Loading**: skeleton-based everywhere, shaped to match the content about to appear. No generic spinners.
  - Left panel: 4-5 skeleton rows matching real prospect row dimensions (small square + two text-line placeholders).
  - Right panel (during generation): skeleton blocks matching the eventual result card — a title-bar-shaped block plus a button-shaped block for the download action.
  - Use shadcn's `Skeleton` component for all of the above.

## Icons

Lucide React. Stroke-based icons only — no filled icon sets mixed in. Sizes: `h-4 w-4` for inline/small UI, `h-5 w-5` for buttons and standalone action icons.
