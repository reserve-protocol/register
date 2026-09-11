Here's what the typed catalogs say — I read no files beyond that and changed nothing.

## Owners to use

| Need | Owner | Design authority | Implementation | Adoption |
|---|---|---|---|---|
| Field / TextInput | `src/components/design-system-v1/field.tsx` | `current-baseline` | canonical-candidate | **none** |
| Select | `src/components/design-system-v1/select.tsx` | `current-baseline` | canonical-candidate | **none** |
| Button | `src/components/button/index.tsx` | `current-baseline` | canonical-candidate | **none** |
| Typography | `src/components/design-system-v1/typography.ts` (`v1Typography`) | `current-baseline` | rendered | n/a (foundation) |
| Spacing relationships | `src/components/ui/v1-layout-recipes.ts` (`v1LayoutRecipes`) | `current-baseline` | reusable recipe | n/a |

Sources: `component-catalog-primary.ts:60-121` (Button), `:438-493` (Field, id `input`), `:541-592` (Select); `foundation-catalog.ts:42-79` (Typography); `v1-layout-recipes.ts:1-24`.

## Acceptance status

All four are accepted current baselines with decision entries: Field/TextInput (`decisions.md#2026-08-19--field-and-textinput-baseline-accepted`), Select (`#2026-08-19--bounded-value-select-baseline-accepted`), Button (`#2026-08-14--button-width-belongs-to-the-action-group-composition`), Typography accepted per `design-system-reference.md:486-493`. All three components are `review: ready`.

**Production adoption is `none` for all three.** Per `design-system.md:45,128`, accepted lab output does not imply product use — fine for a lab-local form, but you're not authorized to change shared defaults or migrate production consumers.

One live caveat: Select carries `{ name: 'Popup item row density', status: 'provisional' }` (`component-catalog-primary.ts:588`). The 8px popup / 12px item balanced-inset and the 14px/16px single-line option role are **under review and must not compound as authority** (`:581`). The trigger geometry you consume is accepted; the popup density is not.

## Established owner vs. specimen

The registry splits these on independent axes (`design-system-reference.md:718-726`): `implementationStatus` of `canonical-candidate` or `reusable-recipe` names an authoritative source under `src/components/`; `specimen` does not. Your four owners are all canonical-candidate/recipe. By contrast `transaction-action` is `designAuthority: exploratory` + `implementationStatus: specimen`, sourced from `src/views/internal/design-system/transaction-truth-spectrum.tsx` (`component-catalog-primary.ts:296-300`) — rendered, but not authority, and it's the paused Current Review target (`current-review.ts:45-46`). Rule of thumb: an owner lives in `src/components/`; a specimen lives in `src/views/internal/design-system/`.

## Default spacing composition

Compose from `v1LayoutRecipes` rather than raw utilities — use a recipe only for the *matching relationship*, not an equal pixel value (`design-system-reference.md:137-139`):

- **Form container inset:** `inset.ordinaryContent` (24px).
- **Between fields:** `stack.completeGroups` (24px) for complete groups, or `stack.internalRegions` (16px) between internal regions.
- **Inside a Field** (label → control → help): already owned at 8px by `field.tsx:25` (`space-y-2`). Don't re-add it.
- **Button row:** consume `ActionGroup` (`src/components/design-system-v1/action-group.tsx`) — horizontal peers at the accepted 8px gap; Button still owns size, tone, state (`design-system-reference.md:210-215`).
- **Typography:** `v1Typography.label` for field labels (14px/500), `.supporting` for help text (14px/300/20px line-height), `.itemTitle` or `.sectionTitle` for the form heading.

Button width is composition-owned and intrinsic by default; a narrow vertical stack should use equal full-width 44px actions rather than ragged content-width buttons (`design-system-reference.md:180-186`).

Before review, run the foundation-conformance pass (`design-system-reference.md:101-114`): every value must map to an accepted foundation or be labeled an unresolved exception.
