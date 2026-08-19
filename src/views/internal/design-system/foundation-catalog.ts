import { openDefinitionSlots, type FoundationItem } from './catalog-types'

export const FOUNDATION_ITEMS: FoundationItem[] = [
  {
    id: 'color',
    name: 'Color',
    description:
      'Semantic roles for surfaces, text, controls, intent, and data.',
    why: 'Color establishes hierarchy and meaning across themes without tying components to raw values.',
    status: 'evidence-found',
    outputStatus: 'rendered',
    designAuthority: 'exploratory',
    statusDetail:
      'Surface, interaction, feedback, performance, and foreground direction is reviewed; exact opaque token values and usage details remain open.',
    expectedDecisions: [
      {
        name: 'Brand and accent roles',
        status: 'open',
        detail:
          'Primary remains the deep brand/action blue and information derives from its hue; exact values remain open.',
      },
      {
        name: 'Surface and text hierarchy',
        status: 'defined',
        detail:
          'White canvas/content, beige structural reveals, and primary/supporting foreground roles define the working hierarchy.',
      },
      {
        name: 'Intent and interaction colors',
        status: 'defined',
        detail:
          'Feedback, performance, selection, focus, hover, and disabled roles have reviewed working rules.',
      },
      {
        name: 'Dark theme and contrast rules',
        status: 'open',
        detail:
          'Feedback foreground logic is established; final dark values and full component coverage remain open.',
      },
    ],
  },
  {
    id: 'typography',
    name: 'Typography',
    description:
      'Font families, hierarchy, weights, sizing, and data treatment.',
    why: 'A deliberate type system makes dense financial information readable and product hierarchy predictable.',
    status: 'evidence-found',
    outputStatus: 'rendered',
    designAuthority: 'exploratory',
    statusDetail:
      'Lausanne, recent product hierarchy, and the previous role matrix inform a structural proposal; the exact scale remains open.',
    expectedDecisions: openDefinitionSlots(
      'Font roles and available weights',
      'Heading and body hierarchy',
      'Labels, captions, and numeric data',
      'Responsive and long-content behavior'
    ),
  },
  {
    id: 'spacing',
    name: 'Spacing & density',
    description:
      'A spacing scale and rules for rhythm, grouping, and data density.',
    why: 'Spacing needs intent so screens feel related without forcing every product composition into one layout.',
    status: 'defined',
    outputStatus: 'rendered',
    designAuthority: 'current-baseline',
    statusDetail:
      'The provisional spacing grammar is design-reviewed; table-family and real-screen work may still pressure-test its application.',
    expectedDecisions: [
      {
        name: 'Base spacing scale',
        status: 'defined',
        detail:
          'Use 4px for tight text stacks, 8px within relationships, 16px for nested insets, 24px for ordinary content and groups, and 32px+ between regions; structural seams remain 1–2px.',
      },
      {
        name: 'Control and content density',
        status: 'defined',
        detail:
          '48px is the default single-line row, 40px is explicit dense-data mode, and rich rows expand from their content.',
      },
      {
        name: 'Section and page rhythm',
        status: 'defined',
        detail:
          'Ordinary sections and contained forms use a 24px edge; a focused tool may consistently use an 8px shell with 16px internal padding.',
      },
      {
        name: 'Responsive spacing rules',
        status: 'defined',
        detail:
          'Normal desktop sections use 24px and deliberately narrow compositions may step down to 16px without changing component geometry.',
      },
    ],
  },
  {
    id: 'radius',
    name: 'Radius',
    description:
      'Corner treatments for controls, containers, overlays, and emphasis.',
    why: 'A small semantic radius set creates coherence and prevents arbitrary component-by-component rounding.',
    status: 'evidence-found',
    outputStatus: 'rendered',
    designAuthority: 'exploratory',
    statusDetail:
      'Atomic one-row controls are fully rounded; composite amount panels, multiline fields, menus, popovers, and thumbnails use the restrained contained-object role. Exact values remain open.',
    expectedDecisions: openDefinitionSlots(
      'Control radius',
      'Container and card radius',
      'Overlay radius',
      'Pill and circular exceptions'
    ),
  },
  {
    id: 'layout',
    name: 'Layout & responsive structure',
    description:
      'Outer frames, page templates, column roles, gutters, and stacking behavior.',
    why: 'A small layout grammar prevents route-to-route shifting without making complex product compositions rigid.',
    status: 'evidence-found',
    outputStatus: 'rendered',
    designAuthority: 'exploratory',
    statusDetail:
      'The 1400px shell, 220px Index navigation, competing 1.5:1 and 2:1 splits, fixed overview rail, and workflow widths now inform three candidate page templates.',
    expectedDecisions: [
      {
        name: 'Outer frame and gutters',
        status: 'open',
        detail:
          'Keep one centered outer frame and stable desktop alignment; exact maximum width and gutters remain open.',
      },
      {
        name: 'Page column templates',
        status: 'open',
        detail:
          'Start with table-led content plus support, balanced split, and focused-column roles; exact proportions remain open.',
      },
      {
        name: 'Supporting rail behavior',
        status: 'open',
        detail:
          'Keep the Overview support rail stable while the data-dense primary region absorbs width; determine its final width with real content.',
      },
      {
        name: 'Responsive stacking',
        status: 'open',
        detail:
          'Supporting regions should follow the primary task before tables compress below their useful minimum width.',
      },
    ],
  },
  {
    id: 'elevation',
    name: 'Elevation',
    description:
      'Surface layering through borders, shadows, contrast, and overlap.',
    why: 'Elevation clarifies which surfaces are interactive, floating, nested, or temporarily above the page.',
    status: 'defined',
    outputStatus: 'rendered',
    designAuthority: 'current-baseline',
    statusDetail:
      'A restrained three-role elevation grammar is design-reviewed; exact recipes remain provisional until real application.',
    expectedDecisions: [
      {
        name: 'Base surface hierarchy',
        status: 'defined',
        detail:
          'Page regions, ordinary cards, and structural surfaces remain flat; surface contrast and seams carry hierarchy.',
      },
      {
        name: 'Raised and floating surfaces',
        status: 'defined',
        detail:
          'Menus, popovers, tooltips, and overlapping white wrappers share one quiet, soft floating treatment.',
      },
      {
        name: 'Overlay and modal treatment',
        status: 'defined',
        detail:
          'Dialogs and temporary task layers use a broader, stronger version of the same soft shadow character.',
      },
      {
        name: 'Light and dark theme behavior',
        status: 'defined',
        detail:
          'Light mode may rely on the shared shadows; dark mode increases surface contrast because shadows provide less separation.',
      },
    ],
  },
  {
    id: 'motion',
    name: 'Motion',
    description: 'Durations, easing, transitions, and reduced-motion behavior.',
    why: 'Purposeful motion explains state changes without making a financial product feel decorative or slow.',
    status: 'defined',
    outputStatus: 'rendered',
    designAuthority: 'current-baseline',
    statusDetail:
      'A restrained three-duration motion grammar is accepted provisionally; real use may tune shared recipes without adding local exceptions.',
    expectedDecisions: [
      {
        name: 'Duration scale',
        status: 'defined',
        detail:
          'Use 120ms for immediate feedback, 180ms for ordinary component transitions, and 240ms for meaningful entrances or larger spatial changes.',
      },
      {
        name: 'Easing roles',
        status: 'defined',
        detail:
          'Enter with ease-out, leave with ease-in, and reserve linear movement for continuous progress.',
      },
      {
        name: 'Entrance and state transitions',
        status: 'defined',
        detail:
          'Motion explains state, hierarchy, or spatial continuity and never delays navigation; decorative choreography is excluded.',
      },
      {
        name: 'Reduced-motion requirements',
        status: 'defined',
        detail:
          'Remove non-essential translation, scale, sweep, and pulse while preserving state meaning through opacity or an instant change.',
      },
    ],
  },
  {
    id: 'iconography',
    name: 'Iconography',
    description: 'Icon sources, sizing, stroke character, and semantic usage.',
    why: 'Consistent icon rules improve recognition while preventing visual noise and mismatched metaphors.',
    status: 'defined',
    outputStatus: 'rendered',
    designAuthority: 'current-baseline',
    statusDetail:
      'Icon sizing, placement, restraint, and exception rules are design-reviewed; Lucide remains a reversible working source.',
    expectedDecisions: [
      {
        name: 'Primary icon source',
        status: 'defined',
        detail:
          'Use one coherent ordinary UI icon source. Lucide is the current candidate, but real component and screen comparisons may justify switching libraries.',
      },
      {
        name: 'Size and stroke scale',
        status: 'defined',
        detail:
          'Use a 1.5px working stroke with 14px micro, 16px control, and 20px content icons; fixed slots control optical alignment.',
      },
      {
        name: 'Icon-only control rules',
        status: 'defined',
        detail:
          'Icon-only actions require a familiar metaphor, accessible name, sufficient hit target, and complete interaction states; item actions sit at the trailing edge.',
      },
      {
        name: 'Product and chain exceptions',
        status: 'defined',
        detail:
          'Brand marks, token and chain identity, and bespoke product diagrams remain explicit exceptions to the ordinary UI icon language.',
      },
    ],
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    description:
      'Cross-system requirements for input, perception, navigation, and content.',
    why: 'Accessibility criteria must shape foundations and components rather than being checked only at handoff.',
    status: 'defined',
    outputStatus: 'rendered',
    designAuthority: 'current-baseline',
    statusDetail:
      'A pragmatic V1 baseline is accepted: shared primitives own mechanics while product work supplies meaningful labels, messages, and reading order.',
    expectedDecisions: [
      {
        name: 'Contrast and non-color meaning',
        status: 'defined',
        detail:
          'Maintain readable ordinary content and pair status color with text, structure, or a recognizable symbol.',
      },
      {
        name: 'Keyboard and focus behavior',
        status: 'defined',
        detail:
          'Interactive primitives remain keyboard operable with visible focus; dialogs manage focus entry, containment, dismissal, and return.',
      },
      {
        name: 'Targets and accessible names',
        status: 'defined',
        detail:
          'Default controls target 44px, compact controls retain sufficient interaction area, and icon-only actions have meaningful names.',
      },
      {
        name: 'Motion and implementation burden',
        status: 'defined',
        detail:
          'Shared primitives honor reduced motion and are verified representatively; V1 does not add an exhaustive manual ritual to every screen.',
      },
    ],
  },
]

export const getFoundationItem = (id?: string) =>
  FOUNDATION_ITEMS.find((item) => item.id === id)
