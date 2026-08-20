import { containedSelectionRecipe } from './contained-selection'

export const tabPresentationRecipe = {
  textOnly: {
    compact: {
      list: 'h-8 items-center justify-start gap-4 rounded-none bg-transparent p-0',
      item: 'h-8 rounded-none bg-transparent p-0 text-sm font-light',
    },
    default: {
      list: 'h-11 items-center justify-start gap-5 rounded-none bg-transparent p-0',
      item: 'h-11 rounded-none bg-transparent p-0 text-base font-light',
    },
    layout: containedSelectionRecipe.layout,
    state:
      'text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground focus-visible:ring-offset-background data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none disabled:opacity-50',
  },
  contained: {
    compact: {
      list: containedSelectionRecipe.compact.track,
      item: containedSelectionRecipe.compact.item,
    },
    default: {
      list: containedSelectionRecipe.default.track,
      item: containedSelectionRecipe.default.item,
    },
    layout: containedSelectionRecipe.layout,
    state:
      'text-muted-foreground hover:bg-foreground/5 hover:text-foreground focus-visible:ring-offset-muted data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:hover:bg-card disabled:opacity-50',
  },
} as const
