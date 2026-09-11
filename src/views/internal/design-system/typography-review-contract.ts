import {
  v1Typography,
  v1TypographyUsage,
} from '@/components/design-system-v1/typography'

export const TYPOGRAPHY_REVIEW_ROLES = [
  {
    id: 'display',
    role: 'Display',
    spec: '40 / 46 phone · 48 / 54 otherwise · 300',
    className: v1Typography.display,
    sample: 'Build a durable portfolio',
    use: v1TypographyUsage.display,
  },
  {
    id: 'page-title',
    role: 'Page title',
    spec: '32 / 38 · 300',
    className: v1Typography.pageTitle,
    sample: 'Index DTF overview',
    use: v1TypographyUsage.pageTitle,
  },
  {
    id: 'section-title',
    role: 'Section title',
    spec: '24 / 30 · 300',
    className: v1Typography.sectionTitle,
    sample: 'Portfolio exposure',
    use: v1TypographyUsage.sectionTitle,
  },
  {
    id: 'lead',
    role: 'Lead',
    spec: '20 / 28 · 300',
    className: v1Typography.lead,
    sample: 'Diversified exposure through transparent onchain portfolios.',
    use: v1TypographyUsage.lead,
  },
  {
    id: 'panel-title',
    role: 'Panel title',
    spec: '20 / 26 · 500',
    className: v1Typography.panelTitle,
    sample: 'Governance activity',
    use: v1TypographyUsage.panelTitle,
  },
  {
    id: 'item-title',
    role: 'Item title',
    spec: '16 / 24 · 500',
    className: v1Typography.itemTitle,
    sample: 'Update the DTF basket',
    use: v1TypographyUsage.itemTitle,
  },
  {
    id: 'body',
    role: 'Body and ordinary value',
    spec: '16 / 24 · 300',
    className: v1Typography.body,
    sample: 'The basket follows transparent rules that governance can update.',
    use: v1TypographyUsage.body,
  },
  {
    id: 'label',
    role: 'Label and action',
    spec: '14 / 20 · 500',
    className: v1Typography.label,
    sample: 'Voting period',
    use: v1TypographyUsage.label,
  },
  {
    id: 'supporting',
    role: 'Supporting',
    spec: '14 / 20 · 300',
    className: v1Typography.supporting,
    sample: 'Changes take effect after the proposal executes.',
    use: v1TypographyUsage.supporting,
  },
  {
    id: 'auxiliary',
    role: 'Auxiliary · limited use',
    spec: '12 / 16 · 300',
    className: v1Typography.auxiliary,
    sample: 'Chart label · 14:23 UTC',
    use: v1TypographyUsage.auxiliary,
  },
] as const

export const TYPOGRAPHY_REVIEW_PRINCIPLES = [
  'Use 300 for reading, spacious hierarchy, and ordinary values.',
  'Use 500 for structure, selection, actions, and deliberate emphasis.',
  'Keep 700 parked until a real composition demonstrates a rare need.',
  'Use 20px line height for ordinary 14px text, including multiline copy.',
  'Let text wrap naturally; truncate only identifiers and measured fixed cells.',
  'Keep application typography stable across breakpoints; only the rare display role steps from 48px to 40px on narrow phones.',
] as const

export const TYPOGRAPHY_REVIEW_WEIGHTS = [
  {
    weight: '300',
    title: 'Reading and spacious hierarchy',
    className: 'font-light',
    use: 'Display, page and section titles, lead and body copy, ordinary values, and supporting text.',
  },
  {
    weight: '500',
    title: 'Structure and emphasis',
    className: 'font-medium',
    use: 'Panel and repeated-item titles, labels, actions, selection, and emphasized values.',
  },
  {
    weight: '700',
    title: 'Installed but parked',
    className: 'font-bold text-muted-foreground',
    use: 'No routine V1 role. A future real composition must demonstrate why 500 is insufficient.',
  },
] as const
