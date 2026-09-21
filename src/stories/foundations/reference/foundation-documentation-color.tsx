import { Check, CircleDashed } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  PERFORMANCE_COLORS,
  PERFORMANCE_TEXT_CLASSES,
} from '@/utils/chart-performance-colors'

export const FOUNDATION_COLOR_GROUPS = [
  {
    id: 'surfaces',
    title: `Surfaces`,
    roles: [
      {
        role: `Page canvas`,
        variable: '--background',
        light: '24 71% 99%',
        dark: '212 20% 6%',
        className: 'bg-background',
        use: `Application backdrop behind navigation, content regions, and page-level tools.`,
      },
      {
        role: `Content surface`,
        variable: '--card',
        light: '0 0% 100%',
        dark: '212 25% 9%',
        className: 'bg-card',
        use: `Readable sections, table bodies, form regions, and tool panels.`,
      },
      {
        role: `Structural substrate`,
        variable: '--secondary',
        light: '34 70% 92%',
        dark: '212 20% 1%',
        className: 'bg-secondary',
        use: `Narrow reveals between near-white navigation, table, or page regions; never a general card fill.`,
      },
      {
        role: `Inset surface`,
        variable: '--muted',
        light: '30 12% 94%',
        dark: '210 20% 1%',
        className: 'bg-muted',
        use: `Recessed controls, wells, and quiet unavailable or selected-state fills.`,
      },
      {
        role: `Floating surface`,
        variable: '--popover',
        light: '0 0% 100%',
        dark: '218 33% 10%',
        className: 'bg-popover',
        use: `Menus, tooltips, and other temporary anchored surfaces. Dialogs currently use the content-surface owner instead.`,
      },
      {
        role: `Selected surface`,
        variable: '--accent',
        light: '212 90% 92%',
        dark: '212 99% 7.5%',
        className: 'bg-accent',
        use: `Selected navigation, tabs, and other quiet brand emphasis without elevation.`,
      },
    ],
  },
  {
    id: 'paired-foregrounds',
    title: `Paired foregrounds`,
    roles: [
      {
        role: `Content foreground`,
        variable: '--card-foreground',
        light: '222.2 84% 4.9%',
        dark: '216 67% 94%',
        className: 'bg-card-foreground',
        use: `Readable text and icons when a component explicitly consumes the content-surface pair.`,
      },
      {
        role: `Floating foreground`,
        variable: '--popover-foreground',
        light: '222.2 84% 4.9%',
        dark: '0 0% 90%',
        className: 'bg-popover-foreground',
        use: `Menu, Select, and other anchored-overlay content.`,
      },
      {
        role: `Primary-action foreground`,
        variable: '--primary-foreground',
        light: '0 0% 100%',
        dark: '0 0% 100%',
        className: 'bg-primary-foreground',
        use: `Labels and icons on primary buttons and other filled brand actions.`,
      },
      {
        role: `Structural-substrate foreground`,
        variable: '--secondary-foreground',
        light: '222.2 47.4% 11.2%',
        dark: '0 0% 85%',
        className: 'bg-secondary-foreground',
        use: `Readable content explicitly paired with the structural substrate; not permission to use beige as component chrome.`,
      },
      {
        role: `Muted foreground`,
        variable: '--muted-foreground',
        light: '215.4 16.3% 46.9%',
        dark: '220 15% 60%',
        className: 'bg-muted-foreground',
        use: `Metadata, placeholders, helper text, and unavailable content.`,
      },
      {
        role: `Selected-surface foreground`,
        variable: '--accent-foreground',
        light: '222.2 47.4% 11.2%',
        dark: '0 0% 95%',
        className: 'bg-accent-foreground',
        use: `Text and icons inside quiet selected navigation and control states.`,
      },
      {
        role: `Danger foreground`,
        variable: '--destructive-foreground',
        light: '210 40% 98%',
        dark: '210 40% 98%',
        className: 'bg-destructive-foreground',
        use: `Labels and icons on destructive or critical filled actions.`,
      },
      {
        role: `Success foreground`,
        variable: '--success-foreground',
        light: '0 0% 100%',
        dark: '0 0% 98%',
        className: 'bg-success-foreground',
        use: `Readable labels and icons on filled success treatments.`,
      },
    ],
  },
  {
    id: 'structure-controls',
    title: `Structure and controls`,
    roles: [
      {
        role: `Border`,
        variable: '--border',
        light: '0 0% 90%',
        dark: '220 20% 16%',
        className: 'bg-border',
        use: `Ordinary dividers between related rows and structural boundaries inside white regions.`,
      },
      {
        role: `Input boundary`,
        variable: '--input',
        light: '214.3 31.8% 91.4%',
        dark: '218 25% 14%',
        className: 'bg-input',
        use: `Text fields, Select triggers, and other controls whose boundary must remain visible.`,
      },
      {
        role: `Content hover`,
        variable: '--interactive-content-hover',
        light: 'derived from card + structural substrate',
        dark: 'derived from card + foreground',
        className: 'bg-interactive-content-hover',
        use: `Opaque hover for content surfaces without host-background mixing.`,
      },
      {
        role: `Recessed conten`,
        variable: '--surface-recessed-content',
        light: 'card 75% + structural substrate',
        dark: 'inherits the light-theme recipe',
        className: 'bg-surface-recessed-content',
        use: `Content visually recessed within a larger white region.`,
      },
      {
        role: `Subtle substrate`,
        variable: '--substrate-subtle',
        light: 'card 50% + structural substrate',
        dark: 'inherits the light-theme recipe',
        className: 'bg-substrate-subtle',
        use: `Shallow attached regions; never a general card or grouping fill.`,
      },
      {
        role: `Disabled structure`,
        variable: '--disabled-structure',
        light: 'muted foreground 60% + muted',
        dark: 'inherits the light-theme recipe',
        className: 'bg-disabled-structure',
        use: `Structure that remains perceivable when a stateful control is disabled.`,
      },
      {
        role: `Neutral lifecycle surface`,
        variable: '--status-neutral-surface',
        light: 'same as --muted',
        dark: 'same as --muted',
        className: 'bg-status-neutral-surface',
        use: `Lifecycle states with no success, warning, or danger meaning.`,
      },
      {
        role: `Neutral lifecycle border`,
        variable: '--status-neutral-border',
        light: 'muted foreground 20% + muted',
        dark: 'inherits the light-theme recipe',
        className: 'bg-status-neutral-border',
        use: `Quiet boundary for neutral lifecycle treatments.`,
      },
    ],
  },
  {
    id: 'text-interaction',
    title: `Text and interaction`,
    roles: [
      {
        role: `Primary foreground`,
        variable: '--foreground',
        light: '222.2 84% 4.9%',
        dark: '216 67% 94%',
        className: 'bg-foreground',
        use: `Headings, body copy, values, labels, and primary icons on ordinary surfaces.`,
      },
      {
        role: `Supporting foreground`,
        variable: '--supporting-foreground',
        light: 'derived from muted + foreground',
        dark: 'same as --muted-foreground',
        className: 'bg-supporting-foreground',
        use: `The calibrated supporting-text role used for metadata, helper copy, secondary labels, and unavailable content.`,
      },
      {
        role: `Primary action`,
        variable: '--primary',
        light: '212 99% 35%',
        dark: '212 99% 40%',
        className: 'bg-primary',
        use: `Primary actions, links, active emphasis, and brand identity.`,
      },
      {
        role: `Focus indicator`,
        variable: '--ring',
        light: '212 99% 35%',
        dark: '212 99% 35%',
        className:
          'bg-card ring-2 ring-ring ring-offset-2 ring-offset-background',
        use: `Visible keyboard focus around interactive components.`,
      },
    ],
  },
  {
    id: 'feedback',
    title: `Feedback`,
    roles: [
      {
        role: `Success`,
        variable: '--success',
        light: '164 83% 40%',
        dark: '164 70% 30%',
        className: 'bg-success',
        use: `Completed operations and healthy product states.`,
      },
      {
        role: `Warning`,
        variable: '--warning',
        light: '32 100% 50%',
        dark: '32 90% 45%',
        className: 'bg-warning',
        use: `Caution, pending work, and medium-risk states.`,
      },
      {
        role: `Danger`,
        variable: '--destructive',
        light: '0 84.2% 60.2%',
        dark: '0 70% 45%',
        className: 'bg-destructive',
        use: `Errors, destructive actions, and critical failures.`,
      },
      {
        role: `Destructive filled action`,
        variable: '--destructive-action',
        light: 'derived from danger + black',
        dark: 'derived from danger + black',
        className: 'bg-destructive-action',
        use: `Opaque filled destructive controls and their interaction states.`,
      },
    ],
  },
] as const

const FEEDBACK_ROLE_FAMILIES = [
  {
    role: `Information`,
    source: '--primary',
    surface: '--feedback-information-surface · primary 8% + card',
    border: '--feedback-information-border · primary 31% + card',
    foreground: '--feedback-information-foreground · primary 65% + foreground',
    className: 'bg-feedback-information-surface',
  },
  {
    role: `Success`,
    source: '--success',
    surface: '--feedback-success-surface · success 10% + card',
    border: '--feedback-success-border · success 32.5% + card',
    foreground: '--feedback-success-foreground · success 65% + foreground',
    className: 'bg-feedback-success-surface',
  },
  {
    role: `Warning`,
    source: '--warning',
    surface: '--feedback-warning-surface · warning 10% + card',
    border: '--feedback-warning-border · warning 32.5% + card',
    foreground: '--feedback-warning-foreground · warning 65% + foreground',
    className: 'bg-feedback-warning-surface',
  },
  {
    role: `Danger`,
    source: '--destructive',
    surface: '--feedback-danger-surface · danger 10% + card',
    border: '--feedback-danger-border · danger 32.5% + card',
    foreground: '--feedback-danger-foreground · danger 65% + foreground',
    className: 'bg-feedback-danger-surface',
  },
] as const

const FILLED_ACTION_FAMILIES = [
  {
    role: `Primary action`,
    defaultValue: '--primary',
    hover: '--primary-hover · primary 92% + black',
    pressed: '--primary-pressed · primary 84% + black',
  },
  {
    role: `Destructive action`,
    defaultValue: '--destructive-action · danger 88% + black',
    hover: '--destructive-action-hover · danger 80% + black',
    pressed: '--destructive-action-pressed · danger 72% + black',
  },
] as const

const PERFORMANCE_ROLES = [
  {
    role: `Positive movemen`,
    variable: 'performance.positive',
    light: `${PERFORMANCE_COLORS.positive.start} → ${PERFORMANCE_COLORS.positive.end}`,
    dark: `${PERFORMANCE_COLORS.darkSurface.positive.start} → ${PERFORMANCE_COLORS.darkSurface.positive.end}`,
    className: cn(PERFORMANCE_TEXT_CLASSES.positive, 'bg-current'),
    use: `Positive price, yield, or portfolio movement; never task success.`,
  },
  {
    role: `Negative movemen`,
    variable: 'performance.negative',
    light: `${PERFORMANCE_COLORS.negative.start} → ${PERFORMANCE_COLORS.negative.end}`,
    dark: `${PERFORMANCE_COLORS.darkSurface.negative.start} → ${PERFORMANCE_COLORS.darkSurface.negative.end}`,
    className: cn(PERFORMANCE_TEXT_CLASSES.negative, 'bg-current'),
    use: `Negative price, yield, or portfolio movement; never an error state.`,
  },
  {
    role: `Neutral movemen`,
    variable: 'performance.neutral',
    light: `${PERFORMANCE_COLORS.neutral.stroke} · ${PERFORMANCE_COLORS.neutral.dot}`,
    dark: `${PERFORMANCE_COLORS.darkSurface.neutral.stroke} · ${PERFORMANCE_COLORS.darkSurface.neutral.dot}`,
    className: 'bg-primary',
    use: `Flat movement and the reference series.`,
  },
  {
    role: `Pre-launch history`,
    variable: 'performance.preLaunch',
    light: `${PERFORMANCE_COLORS.preLaunch.stroke} · ${PERFORMANCE_COLORS.preLaunch.dot}`,
    dark: `${PERFORMANCE_COLORS.darkSurface.preLaunch.stroke} · ${PERFORMANCE_COLORS.darkSurface.preLaunch.dot}`,
    className: 'bg-muted-foreground/60',
    use: `Estimated or pre-launch history, distinct from missing data.`,
  },
] as const

const COLOR_BOUNDARIES = [
  {
    id: 'structural-substrate',
    message: `Beige is structural substrate, not general component chrome.`,
  },
  {
    id: 'contained-neutral-fills',
    message: `Neutral hover and inset fills remain contained within a content surface.`,
  },
  {
    id: 'task-success',
    message: `Task success is not price appreciation.`,
  },
  {
    id: 'transaction-error',
    message: `A transaction error is not negative financial performance.`,
  },
  {
    id: 'theme-owner',
    message: `Components use one semantic alias; the theme owns light and dark values.`,
  },
] as const

const OPEN_COLOR_EDGES = [
  {
    id: 'categorical-chart-roles',
    message: `Categorical chart roles wait for a real multi-series need.`,
  },
  {
    id: 'complex-screen-values',
    message: `Complex screens may still pressure-test exact brand, selection, and overlay values.`,
  },
  {
    id: 'production-migration',
    message: `Production migration and legacy raw-color cleanup are separate work.`,
  },
] as const

const FoundationDocumentationColor = () => {
  return (
    <div data-testid="color-semantic-reference" className="space-y-8">
      {FOUNDATION_COLOR_GROUPS.map((group) => (
        <section key={group.id} aria-labelledby={`color-${group.id}`}>
          <h3
            id={`color-${group.id}`}
            className="text-sm font-medium leading-5"
          >
            {group.title}
          </h3>
          <div className="mt-3 overflow-hidden border border-border bg-card">
            <div className="hidden grid-cols-[minmax(10rem,1fr)_8rem_9rem_9rem_minmax(14rem,1.5fr)] gap-4 border-b border-border px-4 py-3 text-xs text-muted-foreground xl:grid">
              <span>
                <>Semantic role</>
              </span>
              <span>
                <>Alias</>
              </span>
              <span>
                <>Light</>
              </span>
              <span>
                <>Dark</>
              </span>
              <span>
                <>Use</>
              </span>
            </div>
            {group.roles.map((role) => (
              <article
                key={role.variable}
                className="grid gap-3 border-b border-border p-4 last:border-b-0 xl:grid-cols-[minmax(10rem,1fr)_8rem_9rem_9rem_minmax(14rem,1.5fr)] xl:items-center xl:gap-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      'block size-8 shrink-0 border border-border',
                      role.className
                    )}
                  />
                  <h4 className="text-sm font-medium">{role.role}</h4>
                </div>
                <code className="text-xs text-muted-foreground">
                  {role.variable}
                </code>
                <Value label={<>Light</>} value={role.light} />
                <Value label={<>Dark</>} value={role.dark} />
                <p className="text-sm font-light leading-5 text-muted-foreground">
                  {role.use}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section aria-labelledby="color-feedback-families">
        <h3
          id="color-feedback-families"
          className="text-sm font-medium leading-5"
        >
          <>Feedback semantic families</>
        </h3>
        <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
          <>
            Each meaning exposes an opaque surface, border, and calibrated
            foreground. Components use these aliases rather than recoloring
            themselves per theme.
          </>
        </p>
        <div className="mt-3 overflow-hidden border border-border bg-card">
          {FEEDBACK_ROLE_FAMILIES.map((family) => (
            <article
              key={family.source}
              className="grid gap-3 border-b border-border p-4 last:border-b-0 lg:grid-cols-[9rem_11rem_minmax(0,1fr)] lg:items-start lg:gap-4"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={cn(
                    'block size-8 shrink-0 border border-border',
                    family.className
                  )}
                />
                <h4 className="text-sm font-medium">{family.role}</h4>
              </div>
              <code className="text-xs text-muted-foreground">
                <>Source</> {family.source}
              </code>
              <div className="space-y-1 text-xs leading-5">
                <code className="block break-words">{family.surface}</code>
                <code className="block break-words">{family.border}</code>
                <code className="block break-words">{family.foreground}</code>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="color-filled-action-families">
        <h3
          id="color-filled-action-families"
          className="text-sm font-medium leading-5"
        >
          <>Filled action states</>
        </h3>
        <div className="mt-3 overflow-hidden border border-border bg-card">
          {FILLED_ACTION_FAMILIES.map((family) => (
            <article
              key={family.defaultValue}
              className="grid gap-2 border-b border-border p-4 last:border-b-0 lg:grid-cols-[10rem_repeat(3,minmax(0,1fr))] lg:gap-4"
            >
              <h4 className="text-sm font-medium">{family.role}</h4>
              <code className="text-xs">{family.defaultValue}</code>
              <code className="text-xs">{family.hover}</code>
              <code className="text-xs">{family.pressed}</code>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="color-performance-data">
        <h3
          id="color-performance-data"
          className="text-sm font-medium leading-5"
        >
          <>Performance data</>
        </h3>
        <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
          <>
            This accepted implementation-owned palette stays separate from
            generic feedback meaning.
          </>
        </p>
        <div className="mt-3 overflow-hidden border border-border bg-card">
          {PERFORMANCE_ROLES.map((role) => (
            <article
              key={role.variable}
              className="grid gap-3 border-b border-border p-4 last:border-b-0 xl:grid-cols-[minmax(9rem,1fr)_9rem_10rem_10rem_minmax(12rem,1.5fr)] xl:items-center xl:gap-4"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={cn(
                    'block size-8 shrink-0 border border-border',
                    role.className
                  )}
                />
                <h4 className="text-sm font-medium">{role.role}</h4>
              </div>
              <code className="text-xs text-muted-foreground">
                {role.variable}
              </code>
              <Value label={<>Light</>} value={role.light} />
              <Value label={<>Dark</>} value={role.dark} />
              <p className="text-sm font-light leading-5 text-muted-foreground">
                {role.use}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 border-y border-border py-6 lg:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Check className="size-4 text-primary" /> <>Meaning boundaries</>
          </h3>
          <ul className="mt-3 space-y-2 text-sm font-light leading-5">
            {COLOR_BOUNDARIES.map((boundary) => (
              <li key={boundary.id}>{boundary.message}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <CircleDashed className="size-4 text-muted-foreground" />{' '}
            <>Open edges</>
          </h3>
          <ul className="mt-3 space-y-2 text-sm font-light leading-5 text-muted-foreground">
            {OPEN_COLOR_EDGES.map((edge) => (
              <li key={edge.id}>{edge.message}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

const Value = ({ label, value }: { label: React.ReactNode; value: string }) => (
  <div className="min-w-0">
    <span className="text-xs text-muted-foreground xl:hidden">{label} </span>
    <code className="break-words text-xs">{value}</code>
  </div>
)

export default FoundationDocumentationColor
