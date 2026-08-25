import { containedSelectionRecipe } from './contained-selection'

export const tabPresentationRecipe = {
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
} as const
