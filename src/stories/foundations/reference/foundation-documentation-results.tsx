import {
  Circle,
  CircleDashed,
  Focus,
  MoveRight,
  Search,
  TriangleAlert,
} from 'lucide-react'

import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { cn } from '@/lib/utils'
import {
  TYPOGRAPHY_REVIEW_ROLES,
  TYPOGRAPHY_REVIEW_VARIANTS,
} from './typography-review-contract'
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
  return <AccessibilityResult />
}

const TypographyResult = () => (
  <div className="overflow-hidden border border-border bg-card">
    <p className="border-b border-border p-4 text-sm leading-5">
      On one horizontal label/value row, match text size and line height. Use
      weight or color for emphasis; reserve different sizes for an explicitly
      supporting relationship. Financial values use tabular numerals; monospace
      is reserved for addresses, hashes and other machine identifiers.
    </p>
    {[...TYPOGRAPHY_REVIEW_ROLES, ...TYPOGRAPHY_REVIEW_VARIANTS].map((role) => (
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
    <div className="grid grid-cols-3 gap-3 border-y border-border py-5 sm:grid-cols-6">
      {SPACING_STEPS.map(({ className, value }) => (
        <div key={value} className="min-w-0">
          <div className={cn('bg-primary/15', className)} />
          <code className="mt-2 block text-xs text-muted-foreground">
            {value}px
          </code>
        </div>
      ))}
    </div>
    <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
      <RuleValue label={<>Tight text</>} value="4px" recipe="stack.tightText" />
      <RuleValue
        label={<>Related content</>}
        value="8px"
        recipe="stack.relatedContent"
      />
      <RuleValue
        label={<>Internal regions · nested inset</>}
        value="16px"
        recipe="stack.internalRegions · inset.nestedContent"
      />
      <RuleValue
        label={<>Mobile section inset</>}
        value="20px"
        recipe="pilot inset below 1024px"
      />
      <RuleValue
        label={<>Complete groups · desktop section</>}
        value="24px"
        recipe="stack.completeGroups · inset.ordinaryContent"
      />
      <RuleValue
        label={<>Major regions</>}
        value="32px"
        recipe="stack.majorRegions"
      />
    </div>
    <p className="text-sm font-light leading-5 text-muted-foreground">
      <>
        Ordinary mobile sections use 20px on all four sides; desktop sections
        retain 24px. Nested content keeps its own inset. The 48px single-line
        row is a density rule, not a general spacing-ladder promotion.
        Dense-data rows may use 40px; rich rows grow from their content.
        Component-owned geometry—the 12px checkbox label gap, the 12px gap after
        a 32px identity mark, and Button&apos;s 2px-reduced padding at an icon
        edge—belongs to its component and is not off-scale.
      </>
    </p>
  </div>
)

const RadiusResult = () => (
  <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
    <RadiusRole
      label={<>Structural region</>}
      value="0px"
      className="rounded-none"
    >
      <>Page sections, table regions, and modal task structure.</>
    </RadiusRole>
    <RadiusRole label={<>Nested item</>} value="4px" className="rounded">
      <>
        Menu items, select and multi-select options, the checkbox mark, and the
        chain badge.
      </>
    </RadiusRole>
    <RadiusRole
      label={<>Contained object</>}
      value="8px"
      className="rounded-lg"
    >
      <>
        Multiline fields, menus, popovers, tooltips, inline messages, and amount
        regions.
      </>
    </RadiusRole>
    <RadiusRole
      label={<>Atomic control</>}
      value={<>Full</>}
      className="rounded-full"
    >
      <>Buttons, tabs, one-row fields, switches, and status.</>
    </RadiusRole>
  </div>
)

const LayoutResult = () => (
  <div className="space-y-4">
    <div className="divide-y divide-border border-y border-border">
      <LayoutRole
        label={<>Table-led content + support</>}
        detail={
          <>
            A data-dense primary region absorbs available width while a
            genuinely different support job remains stable.
          </>
        }
      />
      <LayoutRole
        label={<>Balanced split</>}
        detail={
          <>
            Two peer regions may share a page when neither is structurally
            subordinate.
          </>
        }
      />
      <LayoutRole
        label={<>Focused column</>}
        detail={
          <>
            A reading or task flow may use one bounded column when a wider
            composition adds no useful context.
          </>
        }
      />
    </div>
    <p className="border-l-2 border-warning pl-4 text-sm font-light leading-5 text-muted-foreground">
      <>
        Section insets are accepted: 24px on desktop, 20px on mobile below
        1024px, and 16px for nested content. Exact outer width, gutters,
        support-rail width, and responsive proportions are still validated with
        real content.
      </>
    </p>
  </div>
)

const ElevationResult = () => (
  <div className="grid gap-px bg-border sm:grid-cols-3">
    <LayerRole
      label={<>Level 0</>}
      value={<>Flat structure</>}
      specimenClassName="border border-border"
    >
      <>Surface contrast and seams carry ordinary hierarchy.</>
    </LayerRole>
    <LayerRole
      label={<>Level 1</>}
      value={<>Floating</>}
      specimenClassName="shadow-sm"
    >
      <>Menus, popovers, select popups, tooltips, and toasts use shadow-sm.</>
    </LayerRole>
    <LayerRole
      label={<>Level 2</>}
      value={<>Overlay</>}
      specimenClassName="shadow-lg"
    >
      <>Dialogs and drawers use shadow-lg.</>
    </LayerRole>
    <p className="bg-card p-4 text-sm font-light leading-5 text-muted-foreground sm:col-span-3">
      <>
        Floating surfaces use shadow-sm and overlays use shadow-lg. Dark mode
        relies more on surface contrast because shadows weaken.
      </>
    </p>
  </div>
)

const AccessibilityResult = () => (
  <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
    <Guardrail icon={<Focus />} label={<>Visible focus</>}>
      <>Keyboard-operated primitives expose a clear focus indicator.</>
    </Guardrail>
    <Guardrail icon={<CircleDashed />} label={<>Target size</>}>
      <>
        Visible controls keep their 28, 32 and 44px geometry. Expanding hit
        areas to 44px is deferred work, verified in the real composition before
        production adoption.
      </>
    </Guardrail>
    <Guardrail icon={<TriangleAlert />} label={<>Meaning beyond color</>}>
      <>Status combines readable text, structure, or a recognizable symbol.</>
    </Guardrail>
    <Guardrail icon={<Search />} label={<>Accessible names</>}>
      <>Visible and announced labels describe the same action.</>
    </Guardrail>
    <Guardrail icon={<Circle />} label={<>Dialog focus</>}>
      <>Focus enters, stays inside, dismisses, and returns predictably.</>
    </Guardrail>
    <Guardrail icon={<MoveRight />} label={<>Reduced motion</>}>
      <>
        State meaning remains when translation, scale, sweep, or pulse is
        removed.
      </>
    </Guardrail>
  </div>
)

const RuleValue = ({
  label,
  recipe,
  value,
}: {
  label: React.ReactNode
  recipe: string
  value: string
}) => (
  <div className="bg-card p-4">
    <code className="text-lg text-primary">{value}</code>
    <p className="mt-1 text-sm font-medium">{label}</p>
    <code className="text-xs text-muted-foreground">{recipe}</code>
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
  specimenClassName,
  value,
}: {
  children: React.ReactNode
  label: React.ReactNode
  specimenClassName: string
  value: React.ReactNode
}) => (
  <div className="bg-card p-5">
    <div
      aria-hidden="true"
      className={cn('mb-4 h-12 rounded-lg bg-card', specimenClassName)}
    />
    <p className="text-sm font-medium">{label}</p>
    <p className="mt-1 text-lg font-light">{value}</p>
    <p className="mt-2 text-sm font-light leading-5 text-muted-foreground">
      {children}
    </p>
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

const SPACING_STEPS = [
  { value: 4, className: 'h-1' },
  { value: 8, className: 'h-2' },
  { value: 16, className: 'h-4' },
  { value: 20, className: 'h-5' },
  { value: 24, className: 'h-6' },
  { value: 32, className: 'h-8' },
] as const
