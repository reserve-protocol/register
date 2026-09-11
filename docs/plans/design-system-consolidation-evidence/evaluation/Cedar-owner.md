## Owners to use (all four are established, not specimens)

| Need | Owner | Authority | Impl | Adoption |
|---|---|---|---|---|
| Field / TextInput | `src/components/design-system-v1/field.tsx` | current-baseline | canonical-candidate | none |
| Select | `src/components/design-system-v1/select.tsx` | current-baseline | canonical-candidate | none |
| Button | `src/components/button/index.tsx` | current-baseline | canonical-candidate | none |
| Typography | `src/components/design-system-v1/typography.ts` (`v1Typography`) | current-baseline | foundation | n/a |

Registry rows: `component-catalog-primary.ts:444` (Field), `:541` (Select), `:86` (Button); typography at `foundation-catalog.ts:43`.

**Acceptance evidence:** [Field/TextInput baseline](docs/wiki/decisions.md#2026-08-19--field-and-textinput-baseline-accepted) (`decisions.md:244`), [read-only fields stay context-neutral](docs/wiki/decisions.md:233), [Bounded-value Select](docs/wiki/decisions.md:341), [Button width is composition-owned](docs/wiki/decisions.md:75). Typography acceptance is recorded in the reference, not a dated decision heading (`design-system-reference.md:462-468`); its full role scale lives in `typography-review-contract.ts`.

**Production adoption: none, for all four.** Every entry is `adoptionStatus: 'none'` — opt-in inside the lab only. Accepted lab output does not imply product use (`design-system.md:45`), and a local lab form is not an adoption slice.

## Established owner vs. specimen

The registry splits these axes deliberately (`design-system-reference.md:679-687`): design authority (`current-baseline` = authoritative now) is separate from implementation (`specimen` vs `reusable-recipe`/`canonical-candidate`) and adoption. An **established owner** is `current-baseline` + a named source under `src/components`. A **specimen** renders in the lab but names no reusable source and settles nothing.

For your form, treat as *not* owners:
- **`ActionGroup`** (`design-system-v1/action-group.tsx`) — exploratory recipe awaiting review (`design-system-reference.md:197-202`). Usable, but label it provisional; don't cite it as the footer-action rule.
- **`InlineAction`** (co-located with Button) — provisional transaction-pressure candidate for Max/Use only (`component-catalog-primary.ts:120`).
- **Legacy `src/components/ui/{input,select,button}`** — production primitives and migration evidence, not V1 authority.
- **Select popup row density** — the 8px/12px balanced inset and 14/16 single-line option role are explicitly `provisional` in the Select review dependencies (`component-catalog-primary.ts:556`). Consume Select as-is; don't re-derive that density.

## Default spacing composition

Compose through `src/components/ui/v1-layout-recipes.ts` rather than raw utilities — conformance requires every value map to a named recipe (`design-system-reference.md:101-119`):

- `stack.tightText` (4px) — label/value or title/description pairs
- `stack.relatedContent` (8px) — label → control → help inside one Field (matches the accepted 8px Field relationship)
- `stack.internalRegions` (16px) — between field groups
- `stack.completeGroups` / `inset.ordinaryContent` (24px) — form section gap and outer content inset
- `cluster.relatedContent` (8px) — horizontal Button peers

Component-owned geometry you should not restate locally: Field/Select trigger 44px, 20px inset (18px adorned/trailing chevron side, 12px value→chevron); default Button 24px text-side / 22px icon-side inset; compact Button 14/12.

**One conflict to know:** the spacing foundation still states "48px is the default single-line row" (`foundation-catalog.ts:102`), while accepted Field/Select/Button geometry is 44px. Component contracts own control height; the 48px line is provisional spacing grammar. Use 44px.

**Typography defaults:** `label` (14/20/500) for field labels, `body` (16/24/300) for entered values, `supporting` (14/20/300) for help and errors, `itemTitle` (16/24/500) for section titles. The 12px auxiliary role is restricted — not for form copy.

No files were modified.
