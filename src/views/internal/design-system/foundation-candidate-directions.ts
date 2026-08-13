export interface FoundationCandidateDirection {
  summary: string
  sources: string[]
  carryForward: string[]
  adapt: string[]
  leaveBehind: string[]
  validateNext: string[]
}

export const FOUNDATION_CANDIDATE_DIRECTIONS: Record<
  string,
  FoundationCandidateDirection
> = {
  color: {
    summary:
      'Build a restrained semantic palette around a warm canvas, clear raised and inset surfaces, Reserve blue, and purpose-specific status and data roles.',
    sources: [
      'Current Home, Discover, and Index DTF overview',
      'Previous color-standard work on codex/ui-standardization',
      'Current semantic CSS variables and dark theme',
    ],
    carryForward: [
      'Warm canvas with lighter raised content surfaces',
      'Semantic roles for surfaces, text, interaction, and intent',
      'Reserve blue as identity and primary-action anchor',
    ],
    adapt: [
      'Reduce the previous token count before implementation',
      'Separate financial data colors from generic success and error roles',
      'Design light and dark palettes together rather than mirroring values',
    ],
    leaveBehind: [
      'Legacy aliases as the long-term public vocabulary',
      'A fixed five-hue claim that conflicts with real chart needs',
      'Beige applied indiscriminately to every nested surface',
    ],
    validateNext: [
      'Contrast and hierarchy on dense tables',
      'Chart series, gains, losses, warnings, and disabled states',
      'Dark-theme surface separation without heavy borders',
    ],
  },
  typography: {
    summary:
      'Keep Lausanne and define a small role-led hierarchy for expressive product moments, dense application UI, long content, and numeric data.',
    sources: [
      'Current Home, Discover, and Index DTF overview',
      'Previous typography v2.2 standard and role matrix',
      'Available Lausanne 300, 500, and 700 font files',
    ],
    carryForward: [
      'Lausanne 300 and 500 as the everyday weights',
      'Role names such as page, section, card, body, label, and metadata',
      'Tabular numeric treatment and a restricted smallest text role',
    ],
    adapt: [
      'Re-test the exact ten-step scale against current screens',
      'Add explicit display, data, and long-form behavior without wrapper sprawl',
      'Let compact tables and marketing moments share roles, not identical sizing',
    ],
    leaveBehind: [
      'A component wrapper for every typographic combination',
      'Coverage targets that reward migration before visual approval',
      '700 weight as a routine substitute for hierarchy',
    ],
    validateNext: [
      'Homepage hero and feature-card hierarchy',
      'Discover and overview table density',
      'Governance proposals, addresses, and extreme numeric values',
    ],
  },
  spacing: {
    summary:
      'Use one intentional spacing scale with two product density modes: generous discovery and reading surfaces, and compact transactional or data surfaces.',
    sources: [
      'Current Home and Discover rhythm',
      'Current Index DTF overview composition',
      'Existing Tailwind spacing utilities',
    ],
    carryForward: [
      'Strong grouping through repeated gaps and surface gutters',
      'More breathing room around high-level product narrative',
      'Compact rows where comparison speed matters',
    ],
    adapt: [
      'Name density and rhythm roles instead of exposing every utility as a decision',
      'Align control heights, row padding, and adjacent component spacing',
      'Treat responsive compression as a rule, not per-screen improvisation',
    ],
    leaveBehind: [
      'A single sparse density applied to the whole product',
      'One-off arbitrary gaps without a compositional reason',
      'Page templates that force complex flows into identical spacing',
    ],
    validateNext: [
      'Table scanning at desktop and phone widths',
      'Swap, automated mint, and governance form density',
      'Long labels, errors, and expanded disclosure states',
    ],
  },
  layout: {
    summary:
      'Use one stable outer frame and a few role-based page templates so routes align without forcing every product composition into the same grid.',
    sources: [
      'Current 1400px application container and 220px Index navigation rail',
      'Index overview, governance, settings, manage, deploy, and proposal layouts',
      'Current 408–480px focused workflow and supporting-region widths',
    ],
    carryForward: [
      'One centered application frame shared by header and route content',
      'A persistent, stable Index navigation rail at desktop widths',
      'Asymmetry when a supporting region has a genuinely different job',
    ],
    adapt: [
      'Collapse competing 1.5:1 and 2:1 splits into named layout roles',
      'Align support-rail and standard-modal geometry where the content supports it',
      'Define reading-order stacking rather than shrinking desktop columns',
    ],
    leaveBehind: [
      'New page ratios selected by what happens to fit locally',
      'Route-specific outer gutters that shift navigation and content alignment',
      'Treating grids as component-internal spacing rules',
    ],
    validateNext: [
      'Index overview, governance, settings, and deploy at the same viewport',
      'Supporting rails containing short, long, and action-heavy content',
      'Narrow-screen order for preview, navigation, and primary task regions',
    ],
  },
  radius: {
    summary:
      'Collapse the broad current radius usage into a few semantic roles for controls, containers, overlays, and true pill or circular exceptions.',
    sources: [
      'Current rounded Home and overview compositions',
      'Current Tailwind radius extensions and CSS radius variable',
      'Previous tabs, buttons, and surface-standard work',
    ],
    carryForward: [
      'Friendly rounded geometry as part of the Reserve character',
      'Pills for bounded selections and compact status',
      'Larger corners for major containers than for nested controls',
    ],
    adapt: [
      'Reduce near-duplicate 20px, 24px, 3xl, and 4xl choices',
      'Pair radius with component size and nesting depth',
      'Give overlays an explicit role instead of inheriting card rounding',
    ],
    leaveBehind: [
      'Rounded-full as a default for unrelated controls',
      'Per-component radius values with no semantic relationship',
      'Nested large radii that visually compete with their parent',
    ],
    validateNext: [
      'Buttons, fields, tabs, cards, dialogs, and tooltips together',
      'Nested cards on the Index overview',
      'Touch targets and compact controls on mobile',
    ],
  },
  elevation: {
    summary:
      'Let surface contrast, borders, and spacing establish most hierarchy; reserve shadows and blur for genuinely floating, overlapping, or temporary UI.',
    sources: [
      'Current Home floating metrics treatment',
      'Current Discover table and Index DTF overview surfaces',
      'Previous surface and border standard work',
    ],
    carryForward: [
      'Canvas, raised, and inset surface relationships',
      'Borders and gutters as the default separation tools',
      'Selective floating treatment for overlays and anchored utilities',
    ],
    adapt: [
      'Define elevation by purpose rather than shadow size alone',
      'Reduce ring, border, and shadow stacking on the same object',
      'Tune dark theme independently so layers remain visible',
    ],
    leaveBehind: [
      'Decorative shadows on every card',
      'Hardcoded one-off shadow recipes in product screens',
      'Using elevation to compensate for unclear surface roles',
    ],
    validateNext: [
      'Dropdowns, dialogs, sticky actions, and mobile overlays',
      'Home metrics overlap and Index overview side rail',
      'Focus visibility alongside borders and elevation',
    ],
  },
}

export const getFoundationCandidateDirection = (id: string) =>
  FOUNDATION_CANDIDATE_DIRECTIONS[id]
