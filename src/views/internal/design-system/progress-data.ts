export const PROGRESS_GATES = [
  'inventoried',
  'defined',
  'lab',
  'applied',
  'design-reviewed',
  'in-use',
  'verified',
] as const

export type ProgressGate = (typeof PROGRESS_GATES)[number]

export interface ProgressItem {
  id: string
  name: string
  source: 'provisional' | 'audited'
  gates: ProgressGate[]
  note: string
}

export interface ProgressGroup {
  id: string
  name: string
  items: ProgressItem[]
}

export const PROGRESS_GROUPS: ProgressGroup[] = [
  {
    id: 'foundations',
    name: 'Foundations',
    items: [
      progressItem(
        'color',
        'Color',
        'Reviewed direction in the lab; exact token values remain open',
        ['inventoried', 'defined', 'lab', 'design-reviewed']
      ),
      progressItem(
        'typography',
        'Typography',
        'Source review and role-led candidate in the lab',
        ['inventoried', 'lab']
      ),
      progressItem(
        'spacing',
        'Spacing & density',
        'Provisional spacing grammar defined and design-reviewed in the lab',
        ['inventoried', 'defined', 'lab', 'design-reviewed']
      ),
      progressItem(
        'radius',
        'Radius',
        'Smaller semantic role candidate in the lab',
        ['inventoried', 'lab']
      ),
      progressItem(
        'layout',
        'Layout & responsive structure',
        'Current route geometry audited and candidate page templates prepared',
        ['inventoried', 'lab']
      ),
      progressItem(
        'elevation',
        'Elevation',
        'Provisional three-role elevation grammar design-reviewed in the lab',
        ['inventoried', 'defined', 'lab', 'design-reviewed']
      ),
      progressItem(
        'motion',
        'Motion',
        'Restrained three-duration motion grammar design-reviewed in the lab',
        ['inventoried', 'defined', 'lab', 'design-reviewed']
      ),
      progressItem(
        'iconography',
        'Iconography',
        'Provisional icon usage and geometry rules design-reviewed in the lab',
        ['inventoried', 'defined', 'lab', 'design-reviewed']
      ),
      progressItem(
        'accessibility',
        'Accessibility',
        'Pragmatic shared-primitive baseline defined and design-reviewed',
        ['inventoried', 'defined', 'lab', 'design-reviewed']
      ),
    ],
  },
  {
    id: 'components',
    name: 'Component families',
    items: [
      progressItem(
        'actions',
        'Actions',
        'Current Button surface mapped in the lab',
        ['inventoried']
      ),
      progressItem('fields', 'Fields', 'Inventory pending'),
      progressItem('selection', 'Selection', 'Inventory pending'),
      progressItem('overlays', 'Overlays', 'Inventory pending'),
      progressItem('navigation', 'Navigation', 'Inventory pending'),
      progressItem('feedback', 'Feedback', 'Inventory pending'),
      progressItem('data-display', 'Data display', 'Inventory pending'),
    ],
  },
  {
    id: 'screens',
    name: 'Representative screens',
    items: GOLDEN_SCREEN_CANDIDATES.map((screen) =>
      progressItem(screen.id, screen.name, screen.note, ['inventoried'])
    ),
  },
]

export const NEXT_QUEUE = [
  {
    name: 'Review outcome metric emphasis',
    detail:
      'Use real Rebalance outcomes to decide icon treatment and emphasis before adding an outcome role to the canonical Metric API.',
  },
  {
    name: 'Review rich navigable records',
    detail:
      'Use real Governance proposals and Rebalance history to judge hierarchy without treating them as dense table-row variants.',
  },
  {
    name: 'Inspect Index navigation alignment',
    detail:
      'Use the faithful collapsed and hover-expanded baseline to identify specific spacing, color, icon, shape, or motion conflicts before asking for visual direction; do not treat unused generic subitem support as a product requirement.',
  },
]

function progressItem(
  id: string,
  name: string,
  note: string,
  gates: ProgressGate[] = []
): ProgressItem {
  return {
    id,
    name,
    source: 'provisional',
    gates,
    note,
  }
}
import { GOLDEN_SCREEN_CANDIDATES } from './golden-screen-candidates'
