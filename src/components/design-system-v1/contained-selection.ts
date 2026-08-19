import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'

export const containedSelectionRecipe = {
  compact: {
    track: `flex h-8 max-w-full gap-0 overflow-x-auto rounded-full p-0.5 ${roles.surface.neutralControl}`,
    item: 'flex h-7 items-center rounded-full px-3 text-sm font-medium transition-colors duration-120',
  },
  default: {
    track: `flex h-11 max-w-full gap-0 overflow-x-auto rounded-full p-0.5 ${roles.surface.neutralControl}`,
    item: 'flex h-10 items-center rounded-full px-5 text-sm font-medium transition-colors duration-120',
  },
  state: {
    resting:
      'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
    selected: 'bg-card text-foreground shadow-sm',
    disabled: 'pointer-events-none opacity-50',
    focusOnTrack: 'ring-2 ring-ring ring-offset-2 ring-offset-muted',
  },
  radioItemState:
    'text-muted-foreground hover:bg-foreground/5 hover:text-foreground peer-checked:bg-card peer-checked:text-foreground peer-checked:shadow-sm peer-checked:hover:bg-card peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-muted peer-disabled:pointer-events-none peer-disabled:opacity-50',
} as const
