import {
  Check,
  Circle,
  Focus,
  MoveRight,
  Search,
  TriangleAlert,
} from 'lucide-react'
import { Trans } from '@lingui/react/macro'

import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { cn } from '@/lib/utils'
import { TYPOGRAPHY_REVIEW_ROLES } from './typography-review-contract'
import FoundationDocumentationColor from './foundation-documentation-color'

export const FoundationPrimaryResult = ({
  foundationId,
}: {
  foundationId: string
}) => {
  if (foundationId === 'color') return <FoundationDocumentationColor />
  if (foundationId === 'typography') return <TypographyResult />
  if (foundationId === 'spacing') return <SpacingResult />
  if (foundationId === 'radius') return <RadiusResult />
  if (foundationId === 'layout') return <LayoutResult />
  if (foundationId === 'elevation') return <ElevationResult />
  if (foundationId === 'motion') return <MotionResult />
  if (foundationId === 'iconography') return <IconographyResult />
  return <AccessibilityResult />
}

const TypographyResult = () => (
  <div className="overflow-hidden border border-border bg-card">
    {TYPOGRAPHY_REVIEW_ROLES.map((role) => (
      <div
        key={role.id}
        className="grid gap-3 border-b border-border p-4 last:border-b-0 xl:grid-cols-[10rem_minmax(0,1fr)] xl:gap-x-6"
      >
        <div>
          <p className="text-sm font-medium">{role.role}</p>
          <code className="text-xs text-muted-foreground">{role.spec}</code>
        </div>
        <div className="min-w-0">
          <p className={cn(role.className, 'min-w-0')}>{role.sample}</p>
          <p className="mt-3 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
            {role.use}
          </p>
        </div>
      </div>
    ))}
  </div>
)

const SpacingResult = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-5 gap-3 border-y border-border py-5">
      {SPACING_STEPS.map(({ className, value }) => (
        <div key={value} className="min-w-0">
          <div className={cn('bg-primary/15', className)} />
          <code className="mt-2 block text-xs text-muted-foreground">
            {value}px
          </code>
        </div>
      ))}
    </div>
    <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
      <RuleValue label={<Trans>Tight text</Trans>} value="4px" />
      <RuleValue label={<Trans>Related content</Trans>} value="8px" />
      <RuleValue label={<Trans>Nested inset</Trans>} value="16px" />
      <RuleValue label={<Trans>Section / group</Trans>} value="24px" />
    </div>
    <p className="text-sm font-light leading-5 text-muted-foreground">
      <Trans>
        The 48px single-line row is a density rule, not a general spacing-ladder
        promotion. Dense-data rows may use 40px; rich rows grow from their
        content.
      </Trans>
    </p>
  </div>
)

const RadiusResult = () => (
  <div className="grid gap-px bg-border sm:grid-cols-3">
    <RadiusRole
      label={<Trans>Structural region</Trans>}
      value="0px"
      className="rounded-none"
    >
      <Trans>Page sections, table regions, and modal task structure.</Trans>
    </RadiusRole>
    <RadiusRole
      label={<Trans>Contained object</Trans>}
      value="8px"
      className="rounded-lg"
    >
      <Trans>Multiline fields, menus, popovers, and amount regions.</Trans>
    </RadiusRole>
    <RadiusRole
      label={<Trans>Atomic control</Trans>}
      value={<Trans>Full</Trans>}
      className="rounded-full"
    >
      <Trans>Buttons, tabs, one-row fields, switches, and status.</Trans>
    </RadiusRole>
  </div>
)

const LayoutResult = () => (
  <div className="space-y-4">
    <div className="divide-y divide-border border-y border-border">
      <LayoutRole
        label={<Trans>Table-led content + support</Trans>}
        detail={
          <Trans>
            A data-dense primary region absorbs available width while a
            genuinely different support job remains stable.
          </Trans>
        }
      />
      <LayoutRole
        label={<Trans>Balanced split</Trans>}
        detail={
          <Trans>
            Two peer regions may share a page when neither is structurally
            subordinate.
          </Trans>
        }
      />
      <LayoutRole
        label={<Trans>Focused column</Trans>}
        detail={
          <Trans>
            A reading or task flow may use one bounded column when a wider
            composition adds no useful context.
          </Trans>
        }
      />
    </div>
    <p className="border-l-2 border-warning pl-4 text-sm font-light leading-5 text-muted-foreground">
      <Trans>
        These are exploratory composition roles. Exact outer width, gutters,
        support-rail width, and responsive proportions remain open and must be
        validated with real content.
      </Trans>
    </p>
  </div>
)

const ElevationResult = () => (
  <div className="grid gap-px bg-border sm:grid-cols-3">
    <LayerRole
      label={<Trans>Level 0</Trans>}
      value={<Trans>Flat structure</Trans>}
    >
      <Trans>Surface contrast and seams carry ordinary hierarchy.</Trans>
    </LayerRole>
    <LayerRole label={<Trans>Level 1</Trans>} value={<Trans>Floating</Trans>}>
      <Trans>Menus, popovers, tooltips, and overlapping wrappers.</Trans>
    </LayerRole>
    <LayerRole label={<Trans>Level 2</Trans>} value={<Trans>Overlay</Trans>}>
      <Trans>Dialogs and temporary task layers use stronger separation.</Trans>
    </LayerRole>
    <p className="bg-card p-4 text-sm font-light leading-5 text-muted-foreground sm:col-span-3">
      <Trans>
        The three roles are current; exact shadow recipes remain provisional.
        Dark mode relies more on surface contrast because shadows weaken.
      </Trans>
    </p>
  </div>
)

const MotionResult = () => (
  <div className="grid gap-px bg-border sm:grid-cols-3">
    <MotionRole value="120ms" label={<Trans>Immediate</Trans>}>
      <Trans>Hover, press, color, opacity</Trans>
    </MotionRole>
    <MotionRole value="180ms" label={<Trans>Standard</Trans>}>
      <Trans>Disclosure, tabs, small surfaces</Trans>
    </MotionRole>
    <MotionRole value="240ms" label={<Trans>Spatial</Trans>}>
      <Trans>Dialog, drawer, meaningful entrance</Trans>
    </MotionRole>
    <p className="flex items-center gap-2 bg-card p-4 text-sm font-light leading-5 text-muted-foreground sm:col-span-3">
      <MoveRight className="size-4" strokeWidth={1.5} />{' '}
      <Trans>
        Enter with ease-out, leave with ease-in, use linear only for continuous
        progress, and remove non-essential spatial motion when reduced motion is
        requested.
      </Trans>
    </p>
  </div>
)

const IconographyResult = () => (
  <div className="grid gap-px bg-border sm:grid-cols-3">
    <IconRole label={<Trans>Micro</Trans>} value="14px">
      <Search className="size-3.5" strokeWidth={1.5} />
    </IconRole>
    <IconRole label={<Trans>Control</Trans>} value="16px">
      <Focus className="size-4" strokeWidth={1.5} />
    </IconRole>
    <IconRole label={<Trans>Content</Trans>} value="20px">
      <Circle className="size-5" strokeWidth={1.5} />
    </IconRole>
    <p className="bg-card p-4 text-sm font-light leading-5 text-muted-foreground sm:col-span-3">
      <Trans>
        Lucide is the current reversible source for ordinary UI icons. Use a
        1.5px stroke, fixed slots for alignment, and text labels unless the
        metaphor is universally familiar. Brand, token, chain, and product
        diagrams remain explicit exceptions.
      </Trans>
    </p>
  </div>
)

const AccessibilityResult = () => (
  <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
    <Guardrail icon={<Focus />} label={<Trans>Visible focus</Trans>}>
      <Trans>
        Keyboard-operated primitives expose a clear focus indicator.
      </Trans>
    </Guardrail>
    <Guardrail icon={<Check />} label={<Trans>44px target</Trans>}>
      <Trans>
        Compact visuals retain an adequate touch and pointer hit area.
      </Trans>
    </Guardrail>
    <Guardrail
      icon={<TriangleAlert />}
      label={<Trans>Meaning beyond color</Trans>}
    >
      <Trans>
        Status combines readable text, structure, or a recognizable symbol.
      </Trans>
    </Guardrail>
    <Guardrail icon={<Search />} label={<Trans>Accessible names</Trans>}>
      <Trans>Visible and announced labels describe the same action.</Trans>
    </Guardrail>
    <Guardrail icon={<Circle />} label={<Trans>Dialog focus</Trans>}>
      <Trans>
        Focus enters, stays inside, dismisses, and returns predictably.
      </Trans>
    </Guardrail>
    <Guardrail icon={<MoveRight />} label={<Trans>Reduced motion</Trans>}>
      <Trans>
        State meaning remains when translation, scale, sweep, or pulse is
        removed.
      </Trans>
    </Guardrail>
  </div>
)

const RuleValue = ({
  label,
  value,
}: {
  label: React.ReactNode
  value: string
}) => (
  <div className="bg-card p-4">
    <code className="text-lg text-primary">{value}</code>
    <p className="mt-1 text-sm font-medium">{label}</p>
  </div>
)

const RadiusRole = ({
  children,
  className,
  label,
  value,
}: {
  children: React.ReactNode
  className: string
  label: React.ReactNode
  value: React.ReactNode
}) => (
  <div className="bg-card p-5">
    <div
      className={cn('h-20 border border-primary bg-primary/10', className)}
    />
    <p className="mt-3 text-sm font-medium">{label}</p>
    <code className="text-xs text-muted-foreground">{value}</code>
    <p className="mt-2 text-sm font-light leading-5 text-muted-foreground">
      {children}
    </p>
  </div>
)

const LayoutRole = ({
  label,
  detail,
}: {
  label: React.ReactNode
  detail: React.ReactNode
}) => (
  <div className="grid gap-2 py-4 md:grid-cols-[minmax(12rem,0.7fr)_minmax(0,1.3fr)] md:gap-6">
    <p className="text-sm font-medium">{label}</p>
    <p className="text-sm font-light leading-5 text-muted-foreground">
      {detail}
    </p>
  </div>
)

const LayerRole = ({
  children,
  label,
  value,
}: {
  children: React.ReactNode
  label: React.ReactNode
  value: React.ReactNode
}) => (
  <div className="bg-card p-5">
    <p className="text-sm font-medium">{label}</p>
    <p className="mt-1 text-lg font-light">{value}</p>
    <p className="mt-2 text-sm font-light leading-5 text-muted-foreground">
      {children}
    </p>
  </div>
)

const IconRole = ({
  children,
  label,
  value,
}: {
  children: React.ReactNode
  label: React.ReactNode
  value: string
}) => (
  <div className="flex items-center gap-4 bg-card p-5">
    <span className="flex size-11 items-center justify-center">{children}</span>
    <span>
      <p className="text-sm font-medium">{label}</p>
      <code className="text-xs text-muted-foreground">{value} · 1.5px</code>
    </span>
  </div>
)

const Guardrail = ({
  children,
  icon,
  label,
}: {
  children: React.ReactNode
  icon: React.ReactElement
  label: React.ReactNode
}) => (
  <div className={cn('bg-card p-5', v1LayoutRecipes.stack.relatedContent)}>
    <span className="block [&>svg]:size-4 [&>svg]:stroke-[1.5]">{icon}</span>
    <p className="text-sm font-medium">{label}</p>
    <p className="text-sm font-light leading-5 text-muted-foreground">
      {children}
    </p>
  </div>
)

const MotionRole = ({
  children,
  label,
  value,
}: {
  children: React.ReactNode
  label: React.ReactNode
  value: string
}) => (
  <div className="bg-card p-5">
    <p className="text-2xl font-light text-primary">{value}</p>
    <p className="mt-2 text-sm font-medium">{label}</p>
    <p className="mt-1 text-sm font-light text-muted-foreground">{children}</p>
  </div>
)

const SPACING_STEPS = [
  { value: 4, className: 'h-1' },
  { value: 8, className: 'h-2' },
  { value: 16, className: 'h-4' },
  { value: 24, className: 'h-6' },
  { value: 32, className: 'h-8' },
] as const
