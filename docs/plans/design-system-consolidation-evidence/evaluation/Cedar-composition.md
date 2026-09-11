I created two files and changed nothing else. Here's the handoff.

## What I built

**`src/views/internal/design-system/display-preferences-study.tsx`** — a local-only specimen exporting `DisplayPreferencesStudy` (named export, plus a default export for consistency with the other files in this folder). No required props.

Composition uses existing design-system pieces only, with no edits to any of them:

- `Field` / `FieldLabel` + the v1 `Select` (`SelectTrigger` / `SelectContent` / `SelectItem`), matching the label-`htmlFor`→trigger-`id` pattern already used by `select-state-sheet.tsx`
- `Button` (`primary` for Save, `secondary` for Reset) inside `ActionGroup`
- `InlineMessage` (`presentation="summary"`, `tone="success"`) for the saved feedback
- Spacing from `v1LayoutRecipes` (`stack.completeGroups` between regions, `cluster.internalRegions` between fields and around the action row, `stack.tightText` in the header), color/text from `v1SemanticRecipes` and `v1Typography`

Copy is exactly as specified, in that order, with no added strings.

**Behavior** — all in component state, no network, no storage APIs:

- Both selects start on their first option (`1,234.56`, `Local time`)
- Save writes a `{ numberFormat, timeZone }` snapshot to `useState` and shows the feedback
- Changing either select clears the feedback only (the snapshot is untouched)
- Reset restores both first options and clears the feedback

The session snapshot is otherwise invisible, so I exposed it as `data-saved-number-format` / `data-saved-time-zone` on the section rather than inventing new visible copy. **Judgment call to flag:** Reset restores the selections and clears feedback but does *not* discard the stored snapshot — that's the literal reading of the spec, and it's unobservable in the UI either way. Say the word if Reset should also clear the store.

**Layout** — square structural surface (per the radius baseline), `max-w-xl` centered card, `p-4` → `sm:p-6`. At 375px: fields stack, buttons go full-width stacked, feedback sits below. At desktop: two field columns, actions left, feedback right. All surfaces/text/feedback use semantic tokens, so light and dark come from the theme.

**`src/views/internal/design-system/tests/display-preferences-study.test.tsx`** — three tests beside the area's existing tests: initial options + label wiring + no feedback; save stores values and shows feedback, then a change clears it; reset returns both selects to the first option.

## Unverified

- **I did not run the tests, typecheck, or lint.** This environment has no shell tool and `node_modules` is not installed, so nothing was executed this turn. Treat the test file as unrun.
- The riskiest part is driving Radix Select under jsdom. I stubbed `scrollIntoView` and the pointer-capture methods in `beforeAll` (the usual recipe), and I query triggers by `id` and assert the `label[for]` association structurally rather than relying on accessible-name computation for a `<label for>`-labelled button. If the pointer-driven option click turns out flaky, switching `chooseOption` to keyboard (`{ArrowDown}` to open, `{Enter}` to commit) is the fallback.
- **Rendered appearance is unverified** — light/dark and the 375px/desktop layouts are reasoned from the tokens and recipes, not visually checked. It isn't routed anywhere, so seeing it needs a temporary local mount (I didn't add one, since routes and the catalog were out of scope).
- Deliberate trade-off: the `role="status"` live region is always mounted so the feedback is announced when it appears, which costs ~16px of extra space below the actions on mobile while empty. Using `empty:hidden` would remove that but risks a missed announcement.
