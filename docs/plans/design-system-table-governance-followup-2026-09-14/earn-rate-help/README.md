# Compact Earn rate help — September 14

User found the two-line identity/rate header visually unbalanced. Their Reserve
Rights / vlRSR-CMCindex screenshot matches the Long content fixture. This bounded
lab correction preserves all values, wording, rate meaning and help behavior.

The value line previously contained a 32px IconButton: its 24px text sat 28px
below the label instead of 24px, and ended 36px inside the right edge. The helper
therefore changed both the vertical rhythm and the apparent text alignment.
[RED](red/results.json) reproduces those relationships in Default/Long content
at 320/390px. It also exposes the old target's missing vertical hit-area expansion.

The compact Index label remains plain “Avg. 30d%” text beside a quiet 16px help
icon in a canonical InlineAction. Its 20px layout has a 44px hit region outside
the visible line; the value remains a separate 24px line on the right content
edge. Loading reserves the icon footprint. Keyboard/tap still opens and focuses
the existing rate FAQ. The desktop IconButton, Yield rate layout and all shared
defaults are unchanged. No new tooltip, wording, financial rule or analytics
action is introduced.

Low-profile self-review; baseline is `289b2af86` plus inherited work, including
the [prior follow-up](../README.md). No checkpoint, install or production adoption.
This is a local composition change, not a shared InlineAction contract change.
Scope inspection reports a medium size signal from 3,475 accumulated branch
files; this batch changes only one local app owner, one regression spec and the
lab guide. No shared default, trust boundary or production contract is changed.

An interim whole-label button passed geometry/interaction checks, but self-review
found its new visible text did not match the preserved accessible help name.
[Name RED](name-red/results.json) catches that treatment; the final action is
icon-only so neither the period label nor accessible help name must change.

## Verification

- Initial geometry RED: one expected failure; [receipt](red/results.json).
- Interim whole-label trial: [2/2 focused](green/results.json) and
  [19/19 surrounding](combined/results.json), before the icon-only correction.
- Accessible-name RED: [one expected failure](name-red/results.json).
- Icon-only surrounding run: [17 passes and two harness failures](hit-boundary/results.json).
  Geometry, naming and actual taps passed, but the new overflow assertion counted
  the intended 12px invisible hit expansion into the cell's 24px padding as a
  defect. The final oracle checks the owning table cell, not the inner content
  wrapper; no app change was needed. Earlier text-collision guards stay intact.
- Final focus run: [2/2 passed](final/results.json), after correcting the cell-boundary
  oracle; the 17 surrounding cases above passed on the same application code.
- Final source: [manifest](source-final.json), 2,442 files.
  The digest is recorded in the manifest.
  Comparing with the parent receipt identifies exactly the three paths above.

Final command (existing Node 24/pnpm runtime, no install), with
`DESIGN_SYSTEM_PORT=3047`, `pnpm_config_verify_deps_before_run=false`, and
`CURRENT_REBALANCE_CAPTURE_DIR` pointing to a temporary directory:

```sh
pnpm design-system:review earn-rate-layout-lab-regressions.spec.ts earn-family-lab-regressions.spec.ts earn-recovery-lab-regressions.spec.ts overnight-lab-regressions.spec.ts --grep Earn
pnpm design-system:review earn-rate-layout-lab-regressions.spec.ts
pnpm exec vitest run src/views/internal/design-system/tests/earn-family.test.tsx
pnpm typecheck
```

Rendered/interaction proof covers Default and the screenshot's Long content,
320/390px, both themes, label/value alignment and right edge, the unchanged
2.29% APR, expanded-hit taps and keyboard FAQ opening/focus. The surrounding
suite covers loading/missing/empty, Yield, desktop, sorting, disclosures and
responsive focus; no transaction is sent. This is not a physical-phone,
screen-reader, financial-source, production-flow or full-CI certification.

Final unit 18/18, application/E2E types, final E2E types after the oracle change,
scoped oxlint/Prettier, wiki/link/hash/diff checks pass. Source remained unchanged
during capture. Eight final captures are retained; light 390px Long content and
dark 320px Default were visually inspected, alongside the surrounding state
captures. Existing Tailwind duration and unit-library warnings remain unrelated.
The isolated 3047 runner stopped; the existing 3005 preview was not restarted.
Self-review found no remaining blocker for this local change. No new workflow
machinery, shared default, copy, transaction or financial behavior was introduced.
