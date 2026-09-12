export const v1Typography = {
  display:
    'text-[40px] font-light leading-[46px] tracking-[-0.015em] sm:text-5xl sm:leading-[54px]',
  pageTitle: 'text-[32px] font-light leading-[38px] tracking-[-0.01em]',
  sectionTitle: 'text-2xl font-light leading-[30px]',
  lead: 'text-xl font-light leading-7',
  panelTitle: 'text-xl font-medium leading-[26px]',
  body: 'text-base font-light leading-6',
  itemTitle: 'text-base font-medium leading-6',
  supporting: 'text-sm font-light leading-5',
  label: 'text-sm font-medium leading-5',
  auxiliary: 'text-xs font-light leading-4',
} as const

export const v1TypographyVariants = {
  compactItemTitle: 'text-base font-medium leading-5',
} as const

export const v1TypographyUsage = {
  display:
    'Rare homepage or major product moment. Never routine application chrome.',
  pageTitle: 'One top-level title for an application view or focused workflow.',
  sectionTitle: 'A major region inside the page hierarchy.',
  lead: 'Prominent supporting copy below a display or page title.',
  panelTitle: 'A contained, subordinate panel—not another page section.',
  itemTitle:
    'Repeated records, assets, proposals, and emphasized compact values.',
  body: 'Default reading copy, entered values, and ordinary financial values.',
  label:
    'Field labels, actions, selected controls, and compact structural emphasis.',
  supporting:
    'Descriptions, metadata, secondary values, and multiline supporting copy.',
  auxiliary:
    'Only space-constrained chart or truly auxiliary metadata. Never body copy.',
} as const satisfies Record<keyof typeof v1Typography, string>
