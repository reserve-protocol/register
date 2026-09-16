import type { FoundationItem } from './catalog-types'

export const FOUNDATION_ITEMS: FoundationItem[] = [
  {
    id: 'color',
    name: 'Color',
    description:
      'Semantic roles for surfaces, text, controls, intent, and data.',
    why: 'Color establishes hierarchy and meaning across themes without tying components to raw values.',
    status: 'defined',
    outputStatus: 'rendered',
    designAuthority: 'current-baseline',
    statusDetail:
      'The reviewed semantic structure and cross-theme contrast calibration are the current working baseline; complex screens may still expose evidence-based refinements.',
    expectedDecisions: [
      {
        name: 'Brand and accent roles',
        status: 'defined',
        detail:
          'Primary remains the deep brand/action blue and information derives from its hue; later real-screen tuning must preserve those semantic roles.',
      },
      {
        name: 'Surface and text hierarchy',
        status: 'defined',
        detail:
          'White canvas/content, beige structural reveals, the opaque subtle substrate for shallow attached regions, and primary/supporting foreground roles define the working hierarchy.',
      },
      {
        name: 'Intent and interaction colors',
        status: 'defined',
        detail:
          'Feedback, performance, selection, focus, hover, and disabled roles have reviewed working rules.',
      },
      {
        name: 'Dark theme and contrast rules',
        status: 'defined',
        detail:
          'Components consume one semantic alias in both themes; the theme boundary owns tuned values, with full-screen pressure testing deferred to adoption.',
      },
    ],
  },
  {
    id: 'typography',
    name: 'Typography',
    description:
      'Font families, hierarchy, weights, sizing, and data treatment.',
    why: 'A deliberate type system makes dense financial information readable and product hierarchy predictable.',
    status: 'defined',
    outputStatus: 'rendered',
    designAuthority: 'current-baseline',
    statusDetail:
      'The reviewed role scale, 300/500 weight strategy, multiline rhythm, responsive display and opt-in page title, numeric treatment, and wrapping rules are the current baseline. Real product usage may still expose evidence-based refinements.',
    expectedDecisions: [
      {
        name: 'Font roles and available weights',
        status: 'defined',
        detail:
          'Use 300 for reading and ordinary hierarchy, 500 for structure and emphasis, and no routine role for the installed 700 weight.',
      },
      {
        name: 'Heading and body hierarchy',
        status: 'defined',
        detail:
          'Use the reviewed display, page, section, lead, panel, item, and body relationships according to their semantic jobs.',
      },
      {
        name: 'Labels, captions, and numeric data',
        status: 'defined',
        detail:
          'Use the 14px label/supporting roles, restricted 12px auxiliary exception, tabular financial numbers, and monospace identifiers.',
      },
      {
        name: 'Responsive and long-content behavior',
        status: 'defined',
        detail:
          'Keep application role defaults stable; responsive display and the opt-in responsivePageTitle use reviewed breakpoint steps. Preserve natural wrapping, readable measures, and narrow truncation boundaries.',
      },
    ],
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
    status: 'defined',
    outputStatus: 'rendered',
    designAuthority: 'current-baseline',
    statusDetail:
      'The semantic roles are accepted: structural surfaces, contained objects, atomic controls, and layout-owned reveals. The current 0 / 8 / full mapping is a working baseline that complex screens may refine without reopening the taxonomy.',
    expectedDecisions: [
      {
        name: 'Control radius',
        status: 'defined',
        detail:
          'Atomic one-row controls use full rounding. Multiline controls and transaction amount input/output regions use the restrained 8px contained-object role, including state layers that replace amount content.',
      },
      {
        name: 'Container and card radius',
        status: 'defined',
        detail:
          'Structural surfaces are square by default in the working mapping. Complex screens may justify tuning the value; the earlier 16px substrate reveal remains a separate layout-owned question.',
      },
      {
        name: 'Overlay radius',
        status: 'defined',
        detail:
          'Anchored floating content uses the 8px contained-object role, while modal task structure remains square.',
      },
      {
        name: 'Pill and circular exceptions',
        status: 'defined',
        detail:
          'Pills, bounded selections, switches, status, and circular icon or identity objects use full rounding.',
      },
    ],
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
      'Historical 1400px-shell and 220px-rail measurements inform the studies, not a V1 width contract. Current V1 Product navigation is 72px collapsed / 256px expanded. Page proportions, support widths, and responsive composition still require real-content validation.',
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
        name: 'Directional and disclosure semantics',
        status: 'defined',
        detail:
          'Ordinary routes omit icons by default; arrows express forward, return, or external direction, chevrons express row drill-in or in-place disclosure, and a more specific outcome icon such as Download may replace the generic external indicator.',
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
