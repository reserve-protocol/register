Done. Two new files, nothing else touched.

**Files**
- `src/views/internal/design-system/display-preferences-study.tsx` — the specimen, `export const DisplayPreferencesStudy` (plus a default export matching the folder's convention), no required props.
- `src/views/internal/design-system/tests/display-preferences-study.test.tsx` — four focused tests beside the area's existing tests.

**What it does**
- Composed only from existing design-system parts: `Field`/`FieldLabel`, v1 `Select`, `Button` (primary Save, `tone="secondary"` Reset), `ActionGroup`, `InlineMessage`/`InlineMessageTitle` (success, summary), `v1Typography`, and semantic role tokens — no shared component, token, catalog, route, or approval-record changes.
- State: `preferences` (both start on the first option), a session-only `storedPreferences` record set by Save, and a `savedFeedbackVisible` flag. Save stores + shows "Preferences saved"; either select change clears the feedback; Reset restores `1,234.56` / `Local time` and clears feedback. No fetch, no localStorage/sessionStorage.
- Hierarchy/spacing: title + supporting copy, then a field group (`grid gap-4`, stacked at 375px, two columns from `sm`), then a `border-t` action footer. Colors are all theme tokens (`bg-card`, `border-border`, `text-supporting-foreground`, success feedback tokens), so light/dark both follow the theme.

**Decisions worth your review**
- The saved feedback lives in a permanently mounted `role="status"` live region so it announces; it reserves the action-row height only from `sm` up, so the desktop layout never shifts on Save while mobile just reveals the pill (an empty 12px gap remains below the fields on mobile).
- Reset restores the visible options and clears feedback but leaves the last stored session values in place — the spec was silent on that; say the word if Reset should also drop the store.
- The store is otherwise invisible, so it's exposed as `data-stored-preferences` on the section for evidence rather than adding copy beyond the specified strings.
- Actions read Reset then "Save preferences" (`justify-end`), matching the repo's existing `ActionGroup` usage in `multi-select-filter`. Both fit side by side at 375px.

**Unverified — please note**
- `node_modules` is not installed in this workspace and I have no shell here, so I ran **no** tests, typecheck, lint, or Prettier. Everything above is static reasoning against the repo's source.
- The riskiest part is the two tests that change a select: they drive Radix via keyboard (`ArrowDown` to open, `Enter` on the option) specifically to avoid jsdom's missing pointer-capture APIs, and they assume the trigger shows the selected item text while closed (Radix's detached-fragment behavior). That path is untested here and may need adjustment on first run.
- Visual claims about 375px and desktop, and light/dark rendering, come from the token and breakpoint choices only — nothing was rendered or screenshotted.
