# AI Workflow Rules — Resumate

These are rules, not guidelines. Follow them exactly while building this project.

## Overall Approach

- Work spec-driven. Trace every unit of work back to `project-overview.md`, `architecture.md`, or an explicit prompt from Mike. Do not add a feature, file, or dependency because it seems useful — only build what was asked for or already defined in the context files.
- Work incrementally. Build one small, complete, verifiable unit at a time. Do not consider a unit done until it works end-to-end for its stated scope.
- Read before writing. Before touching any file, check `progress-tracker.md` and the relevant context file(s) to confirm current state and exact scope. Do not infer from memory of an earlier conversation turn.

## Scoping Rules

- Work on one unit at a time. A unit is one route, one service function, one component, or one slice — never an unstructured task like "the auth system."
- Do not make speculative changes. Do not refactor, rename, or "improve" adjacent code that wasn't part of the ask, even if it looks wrong. Flag it instead.
- Do not add speculative features. Do not add pagination, search, filters, retries, or config options that weren't requested, even if they seem like an obvious next step.
- Do not add a new dependency without explicit approval. Every new npm or pip package is a decision, not a convenience — ask first.
- Touch only the files required for the current unit. If a change appears to require touching an unrelated file, stop and flag it. Do not expand scope silently.

## When to Split Work

- Split a task into smaller steps if it would require touching more than one layer (e.g. a route, a service, and a frontend component). Build and verify the backend first, then the frontend.
- Split a task if it mixes two unrelated concerns (e.g. "add auth and set up R2 upload"). Treat these as two units, not one.
- Split a task if it's large enough that partial failure would be hard to diagnose (e.g. "build the whole generate flow"). Break it into: JD input → Groq call → docx insertion → PDF conversion → download. Verify each step independently.
- Always treat client and server work as separate units. Do them in sequence, and verify each before starting the next. Never build both simultaneously in one pass.

## Handling Missing or Ambiguous Requirements

- Do not guess silently. If a requirement is missing or ambiguous, stop and ask, or state your assumption explicitly before proceeding. Never bury an assumption inside the implementation.
- Default to the narrowest reasonable interpretation, not the most feature-rich one. When in doubt, do less and state what you skipped.
- If a new instruction conflicts with the context files, surface the conflict. Do not pick one silently and proceed.
- If a requirement isn't in any of the six context files and wasn't stated in the current prompt, treat it as out of scope until Mike confirms it.

## Files You Must Not Modify Without Explicit Instruction

- Do not edit `client/src/components/ui/` (shadcn/ui generated components). Extend or wrap them instead.
- Do not create, edit, or generate values in any `.env` file. Mike sets these directly.
- Do not bump dependency versions in `package.json` or `requirements.txt` opportunistically. Any version change requires explicit approval.
- Do not edit `project-overview.md`, `architecture.md`, `code-standards.md`, `ai-workflow-rules.md`, or `ui-context.md` directly. Propose the change and wait for Mike to approve and apply it. The one exception is `progress-tracker.md` — update this yourself as units complete.
- Do not modify `docx-service/` internals once the formatting-detection logic is verified working, unless the current task explicitly calls for it. This is the highest-risk part of the system — no incidental edits while working on something else.

## Keeping Documentation in Sync

- Update `progress-tracker.md` immediately after completing a unit — not at the end of a session, not in a batch.
- If a completed unit makes `architecture.md` or `project-overview.md` inaccurate, stop and flag the discrepancy with the specific proposed edit. Do not let documentation drift silently.
- Write code comments that explain why, not what. Reserve comments for non-obvious decisions only.
- Do not introduce a new pattern — a new folder, a new state pattern, a new API convention — without also flagging that `code-standards.md` or `architecture.md` needs updating to reflect it.

## Verification Checklist — Run Before Moving to the Next Unit

Answer all of the following before starting the next unit. If any answer is no, fix it first.

1. Does this unit do exactly what was scoped — nothing more, nothing less?
2. Does it follow `code-standards.md` for file organization, layering, and naming?
3. Are loading, error, and empty states handled where relevant?
4. Is auth/ownership enforced if this touches user data?
5. Were temp files or resources cleaned up, if applicable?
6. Does anything user-facing match `ui-context.md` for colors, spacing, and font?
7. Has `progress-tracker.md` been updated to reflect this unit's completion?
8. Would this unit work correctly in isolation, without assuming a not-yet-built unit already exists?

## Additional Rules

- Do not hallucinate APIs or packages. If you are unsure whether a library method, Groq API parameter, or B2 SDK call exists as described, verify it against real documentation before writing code that depends on it.
- Prefer the smallest correct diff. Do not rewrite a full file when a five-line edit completes the unit.
- State every assumption out loud in your response, not just in a code comment. If you filled a gap — a default value, an error message, a naming choice — say so explicitly.
- Never write secrets or credentials into code, including placeholder-looking real values, even temporarily.
- Prefer boring, well-established solutions over clever ones. Mike maintains this long-term — write code a future maintainer can parse without effort.
- Make every unit independently testable or demoable. If Mike cannot run or see the result of a unit on its own, the unit is scoped too large — split it.
- Stop after two failed attempts at the same fix. Report the blocker and what you tried. Do not attempt a third speculative fix.
