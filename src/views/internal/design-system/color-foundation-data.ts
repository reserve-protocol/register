export type ColorPreviewTone =
  | 'canvas'
  | 'content'
  | 'grouping'
  | 'inset'
  | 'floating'
  | 'selected'
  | 'primary'
  | 'focus'
  | 'success'
  | 'warning'
  | 'danger'
  | 'information'
  | 'performance-positive'
  | 'performance-negative'
  | 'performance-neutral'
  | 'categorical'
  | 'primary-foreground'
  | 'supporting-foreground'

export interface CurrentColorEvidence {
  name: string
  variable: string
  className: string
  usageCount: number
  observedRole: string
  finding?: string
}

export interface CandidateColorRole {
  role: string
  previewTone: ColorPreviewTone
  startingPoint: string
  usage: string
  roleStatus: 'provisional' | 'open'
  valueStatus: 'open' | 'needs-token'
}

export const CURRENT_SURFACE_EVIDENCE: CurrentColorEvidence[] = [
  {
    name: 'Card',
    variable: '--card',
    className: 'bg-card',
    usageCount: 266,
    observedRole: 'Raised content, controls, tables, and overlays',
  },
  {
    name: 'Muted',
    variable: '--muted',
    className: 'bg-muted',
    usageCount: 191,
    observedRole: 'Inset controls, quiet fills, hover, and disabled states',
  },
  {
    name: 'Background',
    variable: '--background',
    className: 'bg-background',
    usageCount: 153,
    observedRole: 'Page canvas plus many nested content surfaces',
  },
  {
    name: 'Secondary',
    variable: '--secondary',
    className: 'bg-secondary',
    usageCount: 110,
    observedRole: 'Warm beige grouping wrappers and section shells',
    finding: 'This is the familiar beige wrapper used across recent screens.',
  },
  {
    name: 'Accent',
    variable: '--accent',
    className: 'bg-accent',
    usageCount: 20,
    observedRole: 'Selected or brand-tinted emphasis',
  },
  {
    name: 'Popover',
    variable: '--popover',
    className: 'bg-popover',
    usageCount: 9,
    observedRole: 'Menus and floating surfaces',
  },
  {
    name: 'Container',
    variable: '--container',
    className: 'bg-container',
    usageCount: 0,
    observedRole: 'Defined theme alias with no exact product TSX usage',
    finding:
      'It matches the light page background; its name does not describe the product’s common wrapper surface.',
  },
]

export const COLOR_SURFACE_ROLES: CandidateColorRole[] = [
  {
    role: 'Page canvas',
    previewTone: 'canvas',
    startingPoint: 'White · replace current --background value',
    usage: 'White application backdrop behind major regions',
    roleStatus: 'provisional',
    valueStatus: 'open',
  },
  {
    role: 'Grouping surface',
    previewTone: 'grouping',
    startingPoint: '--secondary',
    usage: 'Beige substrate revealed as structural seams between white regions',
    roleStatus: 'provisional',
    valueStatus: 'open',
  },
  {
    role: 'Content surface',
    previewTone: 'content',
    startingPoint: '--card',
    usage: 'White readable sections, rows, tables, and framed tools',
    roleStatus: 'provisional',
    valueStatus: 'open',
  },
  {
    role: 'Inset surface',
    previewTone: 'inset',
    startingPoint: '--muted',
    usage: 'Recessed controls, wells, and quiet state fills',
    roleStatus: 'provisional',
    valueStatus: 'open',
  },
  {
    role: 'Floating surface',
    previewTone: 'floating',
    startingPoint: '--popover',
    usage: 'Menus, tooltips, dialogs, and temporary overlays',
    roleStatus: 'provisional',
    valueStatus: 'open',
  },
  {
    role: 'Selected surface',
    previewTone: 'selected',
    startingPoint: '--accent',
    usage: 'Selection or subtle brand emphasis without elevation',
    roleStatus: 'open',
    valueStatus: 'open',
  },
]

export const COLOR_FOREGROUND_ROLES: CandidateColorRole[] = [
  {
    role: 'Primary foreground',
    previewTone: 'primary-foreground',
    startingPoint: '--foreground',
    usage: 'Headings, body copy, values, labels, and primary icons',
    roleStatus: 'provisional',
    valueStatus: 'open',
  },
  {
    role: 'Supporting foreground',
    previewTone: 'supporting-foreground',
    startingPoint: '--muted-foreground',
    usage: 'Metadata, helper copy, secondary labels, and unavailable content',
    roleStatus: 'provisional',
    valueStatus: 'open',
  },
]

export const COLOR_MEANING_ROLES: CandidateColorRole[] = [
  {
    role: 'Primary action',
    previewTone: 'primary',
    startingPoint: '--primary',
    usage: 'Primary controls, links, and active emphasis',
    roleStatus: 'provisional',
    valueStatus: 'open',
  },
  {
    role: 'Focus indicator',
    previewTone: 'focus',
    startingPoint: '--ring',
    usage: 'Keyboard focus across interactive components',
    roleStatus: 'provisional',
    valueStatus: 'open',
  },
  {
    role: 'Success feedback',
    previewTone: 'success',
    startingPoint: '--success',
    usage: 'An operation completed or a healthy product state',
    roleStatus: 'provisional',
    valueStatus: 'open',
  },
  {
    role: 'Warning feedback',
    previewTone: 'warning',
    startingPoint: '--warning',
    usage: 'Caution, pending work, and medium-risk states',
    roleStatus: 'provisional',
    valueStatus: 'open',
  },
  {
    role: 'Information feedback',
    previewTone: 'information',
    startingPoint: 'Brighter relative of --primary',
    usage:
      'Informational, active, and in-progress states without success or warning meaning',
    roleStatus: 'provisional',
    valueStatus: 'needs-token',
  },
  {
    role: 'Danger feedback',
    previewTone: 'danger',
    startingPoint: '--destructive',
    usage: 'Errors, destructive actions, and critical failures',
    roleStatus: 'provisional',
    valueStatus: 'open',
  },
  {
    role: 'Performance positive',
    previewTone: 'performance-positive',
    startingPoint: 'Current performance palette',
    usage: 'Positive price or portfolio movement; not task success',
    roleStatus: 'provisional',
    valueStatus: 'needs-token',
  },
  {
    role: 'Performance negative',
    previewTone: 'performance-negative',
    startingPoint: 'Current performance palette',
    usage: 'Negative price or portfolio movement; not an error',
    roleStatus: 'provisional',
    valueStatus: 'needs-token',
  },
  {
    role: 'Performance neutral',
    previewTone: 'performance-neutral',
    startingPoint: 'Current performance palette',
    usage: 'Flat or unavailable movement and reference series',
    roleStatus: 'open',
    valueStatus: 'needs-token',
  },
  {
    role: 'Categorical data',
    previewTone: 'categorical',
    startingPoint: '--chart-1…5',
    usage:
      'Deferred until a real multi-series product need defines the required distinctions',
    roleStatus: 'open',
    valueStatus: 'open',
  },
]
