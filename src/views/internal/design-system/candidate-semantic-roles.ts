export const candidateSemanticRoles = {
  surface: {
    content: 'bg-card',
    structuralSubstrate: 'bg-secondary',
    neutralControl: 'bg-muted',
    selected: 'bg-accent/60',
    floating: 'bg-popover',
  },
  line: {
    divider: 'bg-border',
    control: 'border-input',
  },
  focus: {
    onContent: 'ring-2 ring-ring ring-offset-2 ring-offset-card',
  },
  disabled: {
    control: 'border border-border bg-muted text-muted-foreground',
  },
  feedback: {
    information: {
      surface: 'bg-primary/[0.08]',
      foreground: 'text-primary',
    },
    success: {
      surface: 'bg-success/10',
      foreground: 'text-success',
    },
    warning: {
      surface: 'bg-warning/10',
      foreground: 'text-warning',
    },
    danger: {
      surface: 'bg-destructive/10',
      foreground: 'text-destructive',
    },
  },
} as const
