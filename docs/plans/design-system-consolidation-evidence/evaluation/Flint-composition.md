## Handoff

**Files added (2, nothing else touched):**
- `src/views/internal/design-system/display-preferences-study.tsx` — the specimen
- `src/views/internal/design-system/tests/display-preferences-study.test.tsx` — focused tests beside the area's existing tests

**Component** — `export const DisplayPreferencesStudy` (plus a default export matching sibling files in this directory), no required props.

Composition uses existing design-system pieces only, unmodified: `Field`/`FieldLabel`, v1 `Select`, `ActionGroup`, `Button` (`primary` + `secondary` tones), `InlineMessage`/`InlineMessageTitle` (`success`, `summary`, compact). Copy is exactly as specified.

Structure and spacing follow the accepted grammar recorded in `spacing-rhythm-study`: square `border border-border bg-card` panel, 16px inset at narrow / 24px at `sm`+ (`p-4 sm:p-6`), heading + supporting line as one group, 24px to the field group, fields stacked at 375px and two-column at `sm`+ with a 24px gap, then a 32px break and a `border-t` rule before the footer. Footer holds the saved feedback (left, wrapping to its own line on mobile) and the right-aligned `Reset` / `Save preferences` pair. All color comes from tokens (`bg-card`, `border-border`, `text-foreground`, `text-supporting-foreground`, feedback-success roles), so light and dark both resolve through the theme.

**Behavior:** both selects start on their first option. Save copies the current selections into component state and shows the feedback; changing either select clears the feedback. Reset returns both selects to the initial options and clears the feedback. No fetch, no storage APIs — state dies with the mount. `data-number-format` / `data-time-zone` / `data-saved-number-format` / `data-saved-time-zone` on the section expose the live and stored values for verification without adding visible copy.

Judgment call worth confirming: Reset restores the selects and clears feedback, but leaves the last-saved session snapshot in place, since the brief scoped Reset to options and feedback only. Say the word if Reset should also discard the snapshot.

**Unverified:** I had no shell in this session, so I could not run `vitest`, `tsc --noEmit`, or oxlint, and I did not view the component rendered at either width or in dark theme. The layout/theming claims above are from token and class usage, not observed output. The tests are written but unrun; the Radix Select interactions rely on the usual jsdom stubs (`hasPointerCapture`, `setPointerCapture`, `releasePointerCapture`, `scrollIntoView`) added in `beforeAll`, and that path is the most likely thing to need adjustment on first run.
