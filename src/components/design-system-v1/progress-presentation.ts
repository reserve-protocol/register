import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'

export type ProgressTone = 'neutral' | 'information' | 'success' | 'danger'

// Fills keep the approved tones; text uses feedback foregrounds to clear 4.5:1.
export const progressTones = {
  neutral: { text: 'text-muted-foreground', fill: 'bg-muted-foreground' },
  information: {
    text: roles.feedback.information.foreground,
    fill: 'bg-primary',
  },
  success: { text: roles.feedback.success.foreground, fill: 'bg-success' },
  danger: { text: roles.feedback.danger.foreground, fill: 'bg-destructive' },
} satisfies Record<ProgressTone, { text: string; fill: string }>

export const quorumTone = ({
  reached,
  final,
}: {
  reached: boolean
  final: boolean
}): ProgressTone => (reached ? 'success' : final ? 'danger' : 'information')
