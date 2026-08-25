export type V1SurfaceRole = 'canvas' | 'content' | 'structural'

export const v1SemanticRecipes = {
  surface: {
    canvas: 'bg-background',
    content: 'bg-card',
    structural: 'bg-secondary',
    neutralControl: 'bg-muted',
  },
  text: {
    primary: 'text-foreground',
    supporting: 'text-supporting-foreground',
  },
  surfaceSeparation: {
    canvas: 'border-background bg-background',
    content: 'border-card bg-card',
    structural: 'border-secondary bg-secondary',
  },
  focus: {
    onContent:
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
    onContentInset:
      'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
    onContentWithinGroup:
      'group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-card',
  },
  interaction: {
    subtleHover: 'hover:bg-foreground/5',
    subtleFocus: 'focus:bg-foreground/5',
    subtleHighlight: 'data-[highlighted]:bg-foreground/5',
    filledPrimary:
      'bg-primary hover:bg-primary-hover active:bg-primary-pressed',
    filledDestructive:
      'bg-destructive-action hover:bg-destructive-action-hover active:bg-destructive-action-pressed',
  },
  disabled: {
    control: 'border border-border bg-muted text-muted-foreground',
    quietAction: 'bg-transparent text-muted-foreground/50',
    statefulTrack:
      'data-[state=unchecked]:!bg-muted data-[state=checked]:!bg-[var(--disabled-structure)]',
    statefulIndicator:
      'data-[state=unchecked]:bg-[var(--disabled-structure)] data-[state=checked]:bg-card',
  },
} as const
