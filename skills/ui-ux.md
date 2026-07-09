# UI/UX Skill

Use this before building or changing user-facing UI: app shells, dashboards, onboarding, settings, forms, chat surfaces, empty states, and responsive behavior.

Influence: distilled from `https://github.com/pbakaus/impeccable` (Apache 2.0). The project's own register (tone, personality, audience) lives in `docs/wiki/project.md` — read it first; this file carries the register-independent rules.

## Token Discipline

Color, spacing, radius, shadow, type scale, and motion come from design tokens defined in the app's style entrypoint (see `skills/design.md` for the token architecture).

- Use semantic tokens and the brand/status ramps. The names here (`bg-surface`, `text-fg`, `text-fg-muted`, `border-border`, `ring-ring`) are illustrative — the project's real semantic names live in its style entrypoint and design-system wiki page (shadcn-style repos use `bg-card`/`text-foreground`, etc.). Do not introduce new raw color families or inline rgba shadows.
- Reuse the shared UI primitives (Button, Card, Input, Select, Textarea, Badge, Tooltip) before hand-rolling a control. Hand-rolled raw controls in feature components are a smell — add or adjust a primitive variant instead.
- A display font is for headings and hero moments — not for body, labels, or data.
- Accent color is for primary actions, selected state, focus, status, and meaningful signals only.
- Motion is purposeful and concentrated on a few loci; no scattered micro-interactions, no page-load choreography. Honor `prefers-reduced-motion`.

## Before Editing UI

1. Read the relevant existing component/page and the style entrypoint.
2. Identify the user path this surface belongs to.
3. Define the target state and at least one edge state: empty, loading, error, long text, disabled, or unauthenticated.
4. Check whether a local component or pattern already exists before creating a new one.

## Layout Rules

- Product-stable type sizes; no viewport-scaled type for app UI.
- Group related controls tightly; separate distinct regions generously.
- Flex for one-dimensional control rows; grid for page-level two-dimensional layouts.
- Cards only for genuinely framed repeated items or tool panels. Do not nest cards.
- JS-gate breakpoint-exclusive heavy content (autoplaying video, large lists, iframes) — CSS-hiding the extra copy still mounts, downloads, and plays it.
- Touch targets at least 44x44px where pointer/touch interaction is expected.
- Text must not overflow buttons, panels, cards, or sidebars at supported widths.

## Interaction Rules

Every interactive component needs these states when applicable: default, hover, focus-visible, active, disabled, loading, error, success.

Forms use visible labels — placeholders are hints, not labels. Error messages are specific and connected to the field. Setup flows should not block the whole product unless a required prerequisite is truly missing; prefer progressive disclosure. Empty states say what appears there and give a clear next action.

## Visual Quality Bans

Rewrite before shipping if you see: gradient text · heavy glassmorphism as a primary surface (light backdrop-blur on chrome is fine) · identical icon-card grids as the main composition · radii beyond the token scale · side-stripe accent borders · decorative page-load choreography · gray text on colored backgrounds with weak contrast · hidden focus indicators · custom controls that break keyboard behavior.

## Verification

Scale visual evidence to what changed (`skills/workflow.md` § Calibrate: Radius × Size). Copy, token-value, or class tweaks on an existing surface need a spot-check of that surface — or none, when nothing rendered can clip, wrap, or overflow. Structural, layout, interaction-state, or responsive changes need the full evidence below.

For UI changes at that level, fresh evidence includes the relevant scoped checks plus **inspection of the actual rendered UI** (screenshot, smoke artifact, or manual run) covering default and one edge state — **with realistic data volume**: pagination, overflow, and truncation states need enough data to actually trigger them; a near-empty screen verifies nothing about them. When responsive visibility classes change, check every breakpoint band the old and new classes straddle — a control removed at `sm` and reintroduced at `lg` leaves the band between them broken while mobile and desktop screenshots both pass. Automation is defect evidence, not proof of good design — green gates have shipped broken screens.
