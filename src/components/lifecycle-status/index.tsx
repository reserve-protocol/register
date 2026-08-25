import { Spinner } from '@/components/design-system-v1/loading'
import { candidateSemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  Check,
  Clock3,
  ShieldAlert,
  Vote,
  X,
  type LucideIcon,
} from 'lucide-react'

export type LifecycleStatusRole =
  | 'waiting'
  | 'active'
  | 'actionable'
  | 'processing'
  | 'success'
  | 'unsuccessful'
  | 'closed'

export type LifecycleStatusIndicator = 'role' | 'voting' | 'challenge'

const ROLE_PRESENTATION = {
  waiting: {
    Icon: Clock3,
    iconName: 'clock',
    className: cn(
      roles.lifecycle.neutral.surface,
      roles.lifecycle.neutral.foreground,
      roles.lifecycle.neutral.border
    ),
  },
  active: {
    Icon: null,
    iconName: 'active-dot',
    className: cn(
      roles.feedback.information.surface,
      roles.feedback.information.foreground,
      roles.feedback.information.border
    ),
  },
  actionable: {
    Icon: ArrowRight,
    iconName: 'arrow-right',
    className: cn(
      roles.feedback.warning.surface,
      roles.feedback.warning.foreground,
      roles.feedback.warning.border
    ),
  },
  processing: {
    Icon: null,
    iconName: 'spinner',
    className: cn(
      roles.feedback.information.surface,
      roles.feedback.information.foreground,
      roles.feedback.information.border
    ),
  },
  success: {
    Icon: Check,
    iconName: 'check',
    className: cn(
      roles.feedback.success.surface,
      roles.feedback.success.foreground,
      roles.feedback.success.border
    ),
  },
  unsuccessful: {
    Icon: X,
    iconName: 'x',
    className: cn(
      roles.feedback.danger.surface,
      roles.feedback.danger.foreground,
      roles.feedback.danger.border
    ),
  },
  closed: {
    Icon: null,
    iconName: null,
    className: cn(
      roles.lifecycle.neutral.surface,
      roles.lifecycle.neutral.foreground,
      roles.lifecycle.neutral.border
    ),
  },
} satisfies Record<
  LifecycleStatusRole,
  {
    Icon: LucideIcon | null
    iconName: string | null
    className: string
  }
>

const SEMANTIC_INDICATORS = {
  voting: { Icon: Vote, iconName: 'vote' },
  challenge: { Icon: ShieldAlert, iconName: 'shield-alert' },
} satisfies Record<
  Exclude<LifecycleStatusIndicator, 'role'>,
  { Icon: LucideIcon; iconName: string }
>

export const LifecycleStatusPill = ({
  role,
  indicator = 'role',
  children,
}: {
  role: LifecycleStatusRole
  indicator?: LifecycleStatusIndicator
  children: React.ReactNode
}) => {
  const rolePresentation = ROLE_PRESENTATION[role]
  const semanticIndicator =
    indicator === 'role' ? null : SEMANTIC_INDICATORS[indicator]
  const Icon = semanticIndicator?.Icon ?? rolePresentation.Icon
  const iconName = semanticIndicator?.iconName ?? rolePresentation.iconName
  const { className } = rolePresentation

  return (
    <span
      data-testid="lifecycle-status-pill"
      data-status-role={role}
      className={cn(
        'inline-flex h-6 shrink-0 items-center gap-1 rounded-full text-xs font-medium ring-1 ring-inset',
        iconName ? 'pl-2 pr-2.5' : 'px-2.5',
        className
      )}
    >
      {iconName === 'spinner' ? (
        <Spinner data-status-icon={iconName} className="shrink-0" size={14} />
      ) : Icon ? (
        <Icon
          aria-hidden="true"
          data-status-icon={iconName}
          className={cn('size-3.5 shrink-0 stroke-[1.5]')}
        />
      ) : iconName ? (
        <span
          aria-hidden="true"
          data-status-icon={iconName}
          className="size-2 shrink-0 rounded-full bg-current"
        />
      ) : null}
      {children}
    </span>
  )
}
