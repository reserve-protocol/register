import { v1Typography } from '@/components/design-system-v1/typography'

export const TYPOGRAPHY_REVIEW_ROLES = [
  {
    id: 'display',
    role: 'Display',
    spec: '40 / 46 phone · 48 / 54 otherwise · 300',
    className:
      'text-[40px] font-light leading-[46px] tracking-[-0.015em] sm:text-5xl sm:leading-[54px]',
    sample: 'Build a durable portfolio',
    use: 'Rare homepage or major product moment. Never routine application chrome.',
  },
  {
    id: 'page-title',
    role: 'Page title',
    spec: '32 / 38 · 300',
    className: 'text-[32px] font-light leading-[38px] tracking-[-0.01em]',
    sample: 'Index DTF overview',
    use: 'One top-level title for an application view or focused workflow.',
  },
  {
    id: 'section-title',
    role: 'Section title',
    spec: '24 / 30 · 300',
    className: 'text-2xl font-light leading-[30px]',
    sample: 'Portfolio exposure',
    use: 'A major region inside the page hierarchy.',
  },
  {
    id: 'lead',
    role: 'Lead',
    spec: '20 / 28 · 300',
    className: 'text-xl font-light leading-7',
    sample: 'Diversified exposure through transparent onchain portfolios.',
    use: 'Prominent supporting copy below a display or page title.',
  },
  {
    id: 'panel-title',
    role: 'Panel title',
    spec: '20 / 26 · 500',
    className: 'text-xl font-medium leading-[26px]',
    sample: 'Governance activity',
    use: 'A contained, subordinate panel—not another page section.',
  },
  {
    id: 'item-title',
    role: 'Item title',
    spec: '16 / 24 · 500',
    className: v1Typography.itemTitle,
    sample: 'Update the DTF basket',
    use: 'Repeated records, assets, proposals, and emphasized compact values.',
  },
  {
    id: 'body',
    role: 'Body and ordinary value',
    spec: '16 / 24 · 300',
    className: v1Typography.body,
    sample: 'The basket follows transparent rules that governance can update.',
    use: 'Default reading copy, entered values, and ordinary financial values.',
  },
  {
    id: 'label',
    role: 'Label and action',
    spec: '14 / 20 · 500',
    className: v1Typography.label,
    sample: 'Voting period',
    use: 'Field labels, actions, selected controls, and compact structural emphasis.',
  },
  {
    id: 'supporting',
    role: 'Supporting',
    spec: '14 / 20 · 300',
    className: v1Typography.supporting,
    sample: 'Changes take effect after the proposal executes.',
    use: 'Descriptions, metadata, secondary values, and multiline supporting copy.',
  },
  {
    id: 'auxiliary',
    role: 'Auxiliary · limited use',
    spec: '12 / 16 · 300',
    className: 'text-xs font-light leading-4',
    sample: 'Chart label · 14:23 UTC',
    use: 'Only space-constrained chart or truly auxiliary metadata. Never body copy.',
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
