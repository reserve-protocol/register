export type V1SurfaceRole = 'canvas' | 'content' | 'structural'

export const v1SemanticRoles = {
  surface: {
    canvas: 'bg-background',
    content: 'bg-card',
    structural: 'bg-secondary',
    neutralControl: 'bg-muted',
    recessedContent: 'bg-surface-recessed-content',
    subtleSubstrate: 'bg-substrate-subtle',
    selected: 'bg-accent/60',
    floating: 'bg-popover',
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
    staticOnContent: 'ring-2 ring-ring ring-offset-2 ring-offset-card',
    visibleOnContent:
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
    visibleInset:
      'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
    withinGroup:
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
      'data-[state=unchecked]:!bg-muted data-[state=checked]:!bg-disabled-structure',
    statefulIndicator:
      'data-[state=unchecked]:bg-disabled-structure data-[state=checked]:bg-card',
  },
  line: {
    divider: 'bg-border',
    control: 'border-input',
  },
  lifecycle: {
    neutral: {
      surface: 'bg-status-neutral-surface',
      foreground: 'text-muted-foreground',
      border: 'ring-status-neutral-border',
    },
  },
  feedback: {
    information: {
      surface: 'bg-feedback-information-surface',
      foreground: 'text-feedback-information-foreground',
      border: 'ring-feedback-information-border',
    },
    success: {
      surface: 'bg-feedback-success-surface',
      foreground: 'text-feedback-success-foreground',
      border: 'ring-feedback-success-border',
    },
    warning: {
      surface: 'bg-feedback-warning-surface',
      foreground: 'text-feedback-warning-foreground',
      border: 'ring-feedback-warning-border',
    },
    danger: {
      surface: 'bg-feedback-danger-surface',
      foreground: 'text-feedback-danger-foreground',
      border: 'ring-feedback-danger-border',
    },
  },
} as const
