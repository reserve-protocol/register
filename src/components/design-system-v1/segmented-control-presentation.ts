import { containedSelectionRecipe } from './contained-selection'

export const segmentedControlPresentationRecipe = {
  'text-only': {
    compact: {
      track:
        'h-8 items-center justify-start gap-4 rounded-none bg-transparent p-0',
      item: 'h-8 rounded-none bg-transparent p-0 text-sm font-light',
    },
    default: {
      track:
        'h-11 items-center justify-start gap-5 rounded-none bg-transparent p-0',
      item: 'h-11 rounded-none bg-transparent p-0 text-base font-light',
    },
    layout: containedSelectionRecipe.layout,
    state:
      'outline-none text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=on]:bg-transparent data-[state=on]:text-foreground data-[state=on]:shadow-none disabled:pointer-events-none disabled:opacity-50',
  },
  contained: {
    compact: {
      track: containedSelectionRecipe.compact.track,
      item: containedSelectionRecipe.compact.item,
    },
    default: {
      track: containedSelectionRecipe.default.track,
      item: containedSelectionRecipe.default.item,
    },
    layout: containedSelectionRecipe.layout,
    state:
      'outline-none text-muted-foreground hover:bg-foreground/5 hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm data-[state=on]:hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted disabled:pointer-events-none disabled:opacity-50',
  },
} as const

export const compactTextOnlySegmentedControlRecipe = {
  compact: {
    track: 'h-5',
    item: "relative h-5 before:absolute before:-inset-x-1 before:-inset-y-3 before:content-['']",
  },
  default: {
    track: 'h-6',
    item: "relative h-6 before:absolute before:-inset-x-1 before:-inset-y-2.5 before:content-['']",
  },
} as const
