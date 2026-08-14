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
} as const
