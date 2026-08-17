export type V1SurfaceRole = 'canvas' | 'content' | 'structural'

export const v1SemanticRecipes = {
  surface: {
    canvas: 'bg-background',
    content: 'bg-card',
    structural: 'bg-secondary',
  },
  text: {
    primary: 'text-foreground',
    supporting: 'text-muted-foreground',
  },
  surfaceSeparation: {
    canvas: 'border-background bg-background',
    content: 'border-card bg-card',
    structural: 'border-secondary bg-secondary',
  },
  focus: {
    onContent:
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
    onContentWithinGroup:
      'group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-card',
  },
  disabled: {
    control: 'border border-border bg-muted text-muted-foreground',
  },
} as const
