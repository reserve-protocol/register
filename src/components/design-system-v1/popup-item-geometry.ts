export const popupItemGeometry = {
  // Shared balanced-inset candidate. The popup and each hover-revealed item use
  // equal x/y padding; final row height remains content-driven.
  popupInset: 'p-2',
  itemInset: 'p-3',
  rowCheckboxCompensation: '-m-1',
} as const

export const popupItemTypography = {
  singleLine: 'text-sm font-light leading-4',
} as const
