# Taste Skill

Use when building or reshaping a user-facing surface where visual quality matters — a new
screen, a component, a redesign. `skills/design.md` owns the token architecture (the
constitution); this skill owns the judgment on top of it: an intentional direction and a
render audit that keeps output from reading as generic AI default. The project's voice
(tone, personality, audience) lives in `docs/wiki/project.md` — read it first; a warm personal
app and a data console want opposite choices, and this skill is voice-agnostic.

## Commit to a direction

Before laying anything out, decide the one thing someone remembers. Intentionality beats
intensity — refined-minimal and bold-maximal both work; templated-default is the only real
failure. Pick a direction the voice actually supports and execute it precisely, rather than
averaging every safe choice into the same centered-hero, three-equal-cards, indigo-gradient
page every model reaches for.

## AI-slop tells to avoid

These are the defaults that make a UI read as machine-generated. Each is a smell, not a law —
break one on purpose, never by inertia:

- One accent used everywhere, or a purple/indigo gradient as the whole identity.
- Pure `#000`/`#fff`, evenly-weighted cards, everything at the same radius and elevation.
- Centered hero + three equal feature cards + generic icon set, regardless of the content.
- Decorative status dots, fake-precise numbers, emoji as iconography.
- Motion sprinkled everywhere instead of concentrated on a few meaningful moments.
- Copy in the model's own voice (em-dash reflex, "seamless/effortless/elevate") over the
  project's voice.

## Render audit (before "done")

Judge the rendered surface with realistic data, not the empty state. `skills/ui-ux.md` owns the
mechanical checks — interaction states, empty/loading/error states, WCAG contrast, overflow at
real content lengths — run those. The taste-specific layer on top:

- One accent per screen; one radius system; consistent icon stroke width.
- Spacing has rhythm (a scale, not arbitrary pixels); optical alignment, not just geometric.
- Nothing renders as the default the model reaches for by inertia (see the tells above).

Fix priority when auditing an existing surface: type → color cleanup → states → spacing →
component structure. Cheap high-impact first.

Influence: distilled from Anthropic's `frontend-design` skill and `Leonxlnx/taste-skill` (MIT) —
the AI-tells catalog and render audit re-authored voice-agnostic, with token architecture
delegated to `skills/design.md` rather than duplicated here.
