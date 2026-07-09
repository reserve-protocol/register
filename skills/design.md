# Design System Standard

Use this when setting up or evolving an app's visual system. It defines the token architecture; the actual palette, fonts, and personality are per-project choices recorded in `docs/wiki/project.md`.

## Token Architecture

One style entrypoint (e.g. `styles.css`) owns every token. Components never hardcode values that a token covers.

- **Semantic layer** (what components consume): `bg`, `surface`, `fg`, `fg-muted`, `border`, `ring`. Semantic names decouple components from the palette — retheming touches one file.
- **Brand ramp**: one primary family (50–950), used for primary actions, selection, focus.
- **Accent ramp** (optional): one secondary family for personality moments. More than two expressive families reads as noise.
- **Status ramps**: success / warning / danger / info, each with a muted surface variant for badges and callouts.
- **Domain ramps** (optional): when the product visualizes typed entities (node kinds, categories), give each a token — components look up by type, never inline colors.
- **Type scale**: display font for headings/hero only; text font for body/labels/data; mono for code and numbers that align.
- **Radius, shadow, spacing scales**: pick a scale, ban off-scale values.
- **Motion tokens**: durations and easings; concentrate motion on a few loci; honor `prefers-reduced-motion`.

## House Style Baseline

A 1px `border-border` plus one token shadow on a `bg-surface` card is the default framed element. Density fits a work tool: compact but readable. If two components disagree on chrome, the one matching this recipe wins.

## Rules

- New raw color families, inline rgba shadows, and off-scale radii are review blockers.
- Dark mode (when supported) flips the semantic layer, not the components.
- The register — playful vs sober, dense vs airy — is a project decision. Write it in `docs/wiki/project.md` and apply it through token choices, not per-component improvisation.
