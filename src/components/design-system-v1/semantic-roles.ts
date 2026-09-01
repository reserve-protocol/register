export const candidateSemanticRoles = {
  surface: {
    content: 'bg-card',
    recessedContent: 'bg-[var(--surface-recessed-content)]',
    subtleSubstrate: 'bg-substrate-subtle',
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
  lifecycle: {
    neutral: {
      surface: 'bg-[var(--status-neutral-surface)]',
      foreground: 'text-muted-foreground',
      border: 'ring-[var(--status-neutral-border)]',
    },
  },
  feedback: {
    information: {
      surface: 'bg-[var(--feedback-information-surface)]',
      foreground: 'text-feedback-information-foreground',
      border: 'ring-[var(--feedback-information-border)]',
    },
    success: {
      surface: 'bg-[var(--feedback-success-surface)]',
      foreground: 'text-feedback-success-foreground',
      border: 'ring-[var(--feedback-success-border)]',
    },
    warning: {
      surface: 'bg-[var(--feedback-warning-surface)]',
      foreground: 'text-feedback-warning-foreground',
      border: 'ring-[var(--feedback-warning-border)]',
    },
    danger: {
      surface: 'bg-[var(--feedback-danger-surface)]',
      foreground: 'text-feedback-danger-foreground',
      border: 'ring-[var(--feedback-danger-border)]',
    },
  },
} as const
