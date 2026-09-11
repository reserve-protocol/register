Everything below comes from the typed catalogs, which the router names as authority over prose (`docs/wiki/domains/design-system.md:35-45`). I changed no files.

## Owners to consume

| Need | Owner | Evidence |
|---|---|---|
| Field / TextInput | `src/components/design-system-v1/field.tsx` | `component-catalog-primary.ts:461-463` |
| Select (bounded value) | `src/components/design-system-v1/select.tsx` | `component-catalog-primary.ts:565-567` |
| Button | `src/components/button/index.tsx` | `component-catalog-primary.ts:87-89` |
| Action row | `src/components/design-system-v1/action-group.tsx` | `design-system-reference.md:197-202` |
| Typography | `src/components/design-system-v1/typography.ts:1-6` (four reusable roles); full nine-role scale in `typography-review-contract.ts:6-81` | `foundation-catalog.ts:42-52` |
| Spacing | `src/components/ui/v1-layout-recipes.ts:8-30` | `foundation-catalog.ts:80-96` |

Do not reach for `src/components/ui/*` shadcn primitives for this form — those are legacy/migration evidence (`design-system-reference.md:862-866`).

## Status

All four are on the same three independent axes:

- **Design authority:** `current-baseline` for Field, Select, Button (`component-catalog-primary.ts:461,565,87`) and Typography (`foundation-catalog.ts:48-50`).
- **Acceptance:** human-accepted decisions exist — Field/TextInput (`decisions.md:244-254`), Select (`decisions.md:341-356`), Button width/hierarchy (`decisions.md:75`, `design-system-reference.md:142-163`), Typography (`design-system-reference.md:476-480`).
- **Implementation:** `canonical-candidate` for all three components.
- **Production adoption:** `none` for all of them (`component-catalog-primary.ts:481,577,107`). Opt-in in the lab is fine; you are not authorized to change shared defaults or migrate production consumers.

One live caveat: Select's popup row density is `provisional` (`component-catalog-primary.ts:588`; scope at `:581`). Render it, but don't treat the 40px row / 14px-16px option role as settled authority.

## Default spacing composition

Follow the accepted contained-form pattern (`decisions.md:220-231`), rendered at `contained-form-row-review.tsx:121-161`:

1. Form container: 24px inset (`inset.ordinaryContent`, `p-6`) on a white `card` surface, square by default.
2. Title → supporting copy: 4px (`stack.tightText`).
3. Title block → first field: 24px; between complete field groups: 24px (`stack.completeGroups`).
4. Inside each field: 8px label/control/help — already owned by `Field` (`field.tsx:25`, `space-y-2`). Don't re-add margins.
5. Control geometry is component-owned: 44px fully rounded, 20px horizontal inset for Field and the default Select trigger. Labels align to the control's outer edge.
6. Actions: horizontal `ActionGroup` at 8px; a vertical stack goes full width, default 44px.
7. 16px is for internal regions between related blocks; reserve 32px+ for separate regions.

Use the named recipes rather than raw utilities, and run the foundation-conformance pass (spacing, typography, color, radius, dependencies) before calling it reviewable (`design-system-reference.md:101-119`).

## Established owner vs. specimen

The registry keeps these axes deliberately separate (`design-system-reference.md:695-703`):

- **Established owner:** `designAuthority: current-baseline` **and** `implementationStatus: canonical-candidate | reusable-recipe` naming a real source under `src/components`, backed by an accepted decision. Field, Select, Button, Typography all qualify.
- **Specimen:** rendered in the lab only — `implementationStatus: specimen`, usually `designAuthority: exploratory`, no reusable source you may import. Example: the Transaction system entry (`component-catalog-primary.ts:297-299`).

Rendered output never implies authority, and lab acceptance never implies production use (`design-system.md:45`).
