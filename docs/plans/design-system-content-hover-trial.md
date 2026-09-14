# Interactive content hover — accepted lab treatment

Status: visual treatment accepted September 14; systematic lab rollout verified.
Fixed point: `289b2af86` plus inherited dirty work. No commit or checkpoint.

## Accepted rollout contract

The user accepted the tested solid pale-beige treatment and requested systematic
application to relevant surfaces, not a gradient. This authorizes V1 design-system
and lab adoption, not migration of legacy product screens. Medium scope: existing
token values stay fixed; local content consumers and documentation change.

Inventory and disposition:

| Surface | Disposition |
| --- | --- |
| Governance, Earn Index/Yield, current rebalance | Retain the verified role |
| Discover desktop records and compact/full linked cards | Apply; retain loading exclusion, chart/ticker behavior and opaque mask continuity |
| Portfolio Index/Yield positions | Apply whenever the existing whole-row callback exists, including constrained widths |
| Pending withdrawals | Remove inherited desktop hover: actions are inside the row, not the row itself |
| Earlier rebalance browse records | Apply to non-loading stretched-link records; preserve active/history resting surfaces |
| Neutral linked catalog rows/cards and current-review list | Apply to content-navigation surfaces; preserve destinations, resting colors, icons and focus |
| Historical rebalances, Holdings, Owned positions, DeFi | Remain static; only their existing links/actions respond |
| Controls, menus, navigation chrome, option selectors, blue spotlight, illustrative studies | Retain separate control/selection/intent roles |
| Production legacy tables/screens and shared Table/DataTable defaults | No migration or defaults change |

Highest stable seam: routed browser hover tests plus retained navigation, loading,
mask/motion and responsive specs; a source inventory pins deliberate consumers
and rules out incidental interactive fills on static rows. Check both themes and
desktop/constrained forms, full-card masks, and keyboard links. Independent paired
review checks scope/semantics and cascade/test correctness. No new copy, event,
financial behavior, global selector or new hover value. The earlier trial below
is historical; fresh rollout evidence follows here.

Review topology: one implementation owner, with the project-required independent
Light/Intent and Dark/Risk read-only pair. Reviewers receive only the scoped path
inventory, contract and verification claims; neither writes files or runs a
competing preview. The parent owns reconciliation, rendered evidence and final
verification. Unavailable review stays pending, never presumed passed.

## Rollout verification and handoff

- RED first reproduced the missing mobile Portfolio hover. Initial combined
  hover/navigation checks passed 6/6 after the consumer rollout. Additional RED
  checks reproduced loading ticker-mask tint, then the visually detected white
  ticker capsule inside a hovered Discover card; both were corrected locally.
- Combined hover, row-link, Discover card and motion suites passed 20/20. After
  the decorative-strip correction, the final hover suite passed 6/6 in both
  themes, including full-card masks/strip, skeleton and static exclusions,
  matching 390/1400 fills, unchanged geometry and catalog child inheritance.
- Inspected actual hovered desktop Discover and final narrow full-card captures
  in both themes. The strip and masks now meet the card fill; the arrow retains
  its own control treatment. Motion was not redesigned. Current-source guards
  reported no drift. These are browser renders, not physical-device certification.
- Semantic roles, source hygiene, catalog and Earn unit checks passed 56/56.
  Final application/E2E types, scoped oxlint/Prettier and wiki/diff checks pass.
  The scope tool sees 3,509 inherited branch paths; the active V1 bounded-lab
  cadence applies, not an unrelated whole-repository production gate.
- Light/Intent and Dark/Risk independently found no blocker. The final ticker
  correction received an affected Risk review: descendant specificity wins over
  the retained large-screen border rule, without changing the nested arrow or
  loading state. Source search found no missed eligible lab row among remaining
  muted fills; controls, navigation and studies remain deliberate exclusions.
- The existing 3005 preview loads the current classes/token without restart.
  Isolated checks used 3047 and stopped afterward. No commit, checkpoint,
  installation, shared Table/DataTable default, production screen, product copy,
  financial calculation, permission or transaction change.

Engineer review required before production adoption: validate the existing
CSS/Tailwind token and semantic owner against product themes, row-action
ownership, focus/selection and nested controls. The user accepted this visual
treatment; that does not authorize production migration. The inventory above
and the central V1 engineer register carry this distinction.

Reproduce with the existing runtime, `pnpm_config_verify_deps_before_run=false`,
`DESIGN_SYSTEM_PORT=3047`, and a temporary `CURRENT_REBALANCE_CAPTURE_DIR`:

```sh
pnpm design-system:review content-hover-lab-regressions.spec.ts table-row-links-lab-regressions.spec.ts discover-cards-lab-regressions.spec.ts discover-motion-lab-regressions.spec.ts
pnpm design-system:review content-hover-lab-regressions.spec.ts
pnpm typecheck
```

## Earlier bounded trial (historical)

The following contract and verification record describe the initial three-family
trial, before user acceptance and the rollout above. They are not limits on the
accepted lab inventory or evidence of production adoption.

### Contract and usage

The user approved previewing a warm row hover on governance proposals and two
table families. A white content row should shift toward pale ivory next to
beige seams; dark content should lighten subtly rather than becoming black.
One opt-in semantic role will serve proposal records, Earn opportunities and
current-rebalance rows. Empty/loading Earn and static history must not acquire
interactive feedback. Native links, focus, selection, help and all data remain
unchanged. The local preview is the user-facing review artifact.

The candidate adds `interactive-content-hover` at the CSS/Tailwind theme owner
and `interaction.contentHover` at the semantic owner, consumed only by these
three lab compositions. Light initially mixes 65% card with 35% secondary;
dark mixes 95% card with 5% foreground. The result is opaque and independent of
the surrounding substrate. These values are a visual trial, not accepted tokens
for production adoption. Existing generic subtleHover, control hover, selection,
focus and substrate-subtle roles stay untouched.

One ownership shape is sufficient: caller opts into an interaction role, theme
owns its value. Reusing substrate-subtle is rejected because it means attached
structural depth, not interaction. Per-table colors and global replacement of
generic hover are rejected. The three examples are review surfaces, not blanket
migration. No new copy, analytics action, financial logic or persistence.

### Proof and review

Focused browser checks at 390/1400 in both themes: same opaque color across the
three consumers; warm near-white light fill separated from beige seams; dark
fill lighter than its card; unchanged geometry; loading and static history do
not gain row hover. Inspect actual hovered captures and the user's loaded source.
Retain governance and table interaction specs, types, semantic/source-hygiene
checks, lint and wiki checks. Review the bounded final diff through the project's
Intent and Risk pair; broad inherited branch changes are not this trial.

No production migration is authorized. Engineer review required before adopting
the new shared token/role; the handoff must cover theme values, compiled token
wiring, consumer opt-in, focus/selection distinction and real product semantics.

### Verification and reconciliation

- RED reproduced translucent/cool hover before the token existed. That first
  pass also exposed a test route mistake: current rows mount at the current-table
  hash, not the generic table route. The final spec targets that exact surface.
- Combined hover/governance suite: 8/8. Surrounding hover, current-table
  navigation/focus and Earn states/interactions/sorting: 17/17. Final hover-only
  run after test strengthening: 2/2. All ran on isolated port 3047, leaving the
  user's 3005 preview running; no source drift during captures.
- Semantic roles, source hygiene, catalog and Earn unit checks: 56/56.
  Application/E2E typecheck, final E2E types, scoped lint/formatting and wiki/diff
  checks pass. Existing duration and unit-library warnings were not changed.
- Inspected actual hovered proposal/Earn/current desktop light captures and
  compact dark Earn. The loaded user preview exposes the new theme token and
  opt-in classes. These are real browser renders, not production adoption or
  physical-device/assistive-technology certification.
- Light review found no implementation blocker; stale guide wording and missing
  central engineering handoff were corrected. Dark review found no source
  blocker but identified a timing weakness in negative hover assertions: they
  could sample before a transition. The final spec waits for the row's own
  animations to finish, then compares. No application fix was required.

Scope is medium: a new additive, otherwise unused theme role with exactly three
lab consumers. The scope tool's high hint includes 3,500 inherited branch paths
and shared-machinery signals; no existing token, shared default or production
consumer changed. The bounded opt-in test/paired-review cadence is used rather
than broad production migration gates. No checkpoint, commit or install.

Reproduce with the existing Node 24/pnpm runtime and
`pnpm_config_verify_deps_before_run=false`, `DESIGN_SYSTEM_PORT=3047`, and
`CURRENT_REBALANCE_CAPTURE_DIR` pointing to a temporary directory:

```sh
pnpm design-system:review content-hover-lab-regressions.spec.ts governance-record-layout-lab-regressions.spec.ts
pnpm design-system:review content-hover-lab-regressions.spec.ts earn-family-lab-regressions.spec.ts current-rebalance-table-lab-regressions.spec.ts --grep 'interactive content hover|Earn candidate|current table ready navigation preserves context|current table controls and responsive focus retain context'
pnpm exec vitest run src/components/design-system-v1/tests/semantic-roles.test.ts src/components/design-system-v1/tests/source-hygiene.test.ts src/views/internal/design-system/tests/component-catalog.test.ts src/views/internal/design-system/tests/earn-family.test.tsx
pnpm typecheck
```
