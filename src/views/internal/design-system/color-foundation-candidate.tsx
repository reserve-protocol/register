import { ArrowDown, ArrowUp, Check, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'
import {
  COLOR_FOREGROUND_ROLES,
  COLOR_MEANING_ROLES,
  COLOR_SURFACE_ROLES,
  type CandidateColorRole,
  type ColorPreviewTone,
} from './color-foundation-data'
import ColorPerformanceCandidate from './color-performance-candidate'

const ColorFoundationCandidate = () => (
  <div className="space-y-6">
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="font-semibold">Surface hierarchy specimen</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            A first structural mapping rendered with today’s tokens. The roles
            are proposed; the final light and dark values are still open.
          </p>
        </div>
        <CandidateStatus />
      </div>
      <div className="mt-5 bg-card py-5">
        <div className="mx-auto max-w-3xl bg-card">
          <div className="border-b-2 border-secondary px-5 py-4">
            <SpecimenLabel
              label="White page canvas and top region"
              token="page + content roles"
            />
          </div>
          <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-0.5 bg-secondary">
            <div className="bg-card p-4">
              <SpecimenLabel label="Navigation" token="content" />
            </div>
            <div className="grid gap-px bg-secondary">
              <div className="bg-card p-4">
                <SpecimenLabel label="Content section" token="content" />
              </div>
              <div className="bg-card p-4">
                <SpecimenLabel label="Content subsection" token="1px reveal" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ColorRoleTable title="Surface roles" rows={COLOR_SURFACE_ROLES} />

    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold">Feedback versus data movement</h3>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
        These roles remain technically separate even if design review chooses
        the same hue or exact value. A completed action is not the same meaning
        as a price increase; an error is not the same meaning as a loss.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MeaningExample
          icon={<Check className="h-4 w-4" />}
          label="Task completed"
          swatchClassName="bg-success"
        />
        <MeaningExample
          icon={<ArrowUp className="h-4 w-4" />}
          label="Price up +3.24%"
          swatchClassName={cn(PERFORMANCE_TEXT_CLASSES.positive, 'bg-current')}
        />
        <MeaningExample
          icon={<TriangleAlert className="h-4 w-4" />}
          label="Transaction failed"
          swatchClassName="bg-destructive"
        />
        <MeaningExample
          icon={<ArrowDown className="h-4 w-4" />}
          label="Price down −2.18%"
          swatchClassName={cn(PERFORMANCE_TEXT_CLASSES.negative, 'bg-current')}
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        Color chips preview today’s nearest values. Labels use accessible
        foreground text because the current success and destructive values do
        not yet pass normal-text contrast in both themes.
      </p>
    </div>

    <ColorPerformanceCandidate />

    <ColorRoleTable
      title="Foreground hierarchy"
      rows={COLOR_FOREGROUND_ROLES}
    />

    <ColorRoleTable
      title="Interaction, feedback, and data roles"
      rows={COLOR_MEANING_ROLES}
    />
  </div>
)

const ColorRoleTable = ({
  title,
  rows,
}: {
  title: string
  rows: CandidateColorRole[]
}) => (
  <div className="overflow-hidden rounded-2xl border border-border bg-card">
    <div className="border-b border-border p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Starting points show today’s nearest source, not accepted V1 values.
      </p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-[760px] w-full text-left text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-5 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Preview</th>
            <th className="px-4 py-3 font-medium">Starting point</th>
            <th className="px-4 py-3 font-medium">Intended use</th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.role} className="border-t border-border align-top">
              <th className="px-5 py-4 font-medium">{row.role}</th>
              <td className="px-4 py-4">
                <ColorPreview tone={row.previewTone} />
              </td>
              <td className="px-4 py-4">
                <code className="text-xs text-muted-foreground">
                  {row.startingPoint}
                </code>
              </td>
              <td className="max-w-sm px-4 py-4 leading-6 text-muted-foreground">
                {row.usage}
              </td>
              <td className="px-5 py-4">
                <RoleStatus row={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const ColorPreview = ({ tone }: { tone: ColorPreviewTone }) => {
  const className = previewClassNames[tone]

  if (tone === 'categorical') {
    return (
      <span className="flex h-8 w-14 items-center justify-center rounded-lg border border-dashed border-border text-[10px] text-muted-foreground">
        Open
      </span>
    )
  }

  return (
    <span
      aria-label={`${tone} preview`}
      className={cn(
        'block h-8 w-14 rounded-lg border border-border',
        className
      )}
    />
  )
}

const previewClassNames: Record<ColorPreviewTone, string> = {
  canvas: 'bg-card',
  content: 'bg-card',
  grouping: 'bg-secondary',
  inset: 'bg-muted',
  floating: 'bg-popover shadow-sm',
  selected: 'bg-accent',
  primary: 'bg-primary',
  focus: 'bg-card ring-2 ring-ring ring-offset-2 ring-offset-background',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  information: 'bg-primary/65',
  'performance-positive': cn(PERFORMANCE_TEXT_CLASSES.positive, 'bg-current'),
  'performance-negative': cn(PERFORMANCE_TEXT_CLASSES.negative, 'bg-current'),
  'performance-neutral': 'bg-muted-foreground',
  categorical: '',
  'primary-foreground': 'bg-foreground',
  'supporting-foreground': 'bg-muted-foreground',
}

const RoleStatus = ({ row }: { row: CandidateColorRole }) => (
  <span className="flex min-w-32 flex-col gap-1.5">
    <span
      className={cn(
        'w-fit rounded-full px-2 py-1 text-xs',
        row.roleStatus === 'provisional'
          ? 'bg-warning/10 text-foreground ring-1 ring-inset ring-warning/30'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {row.roleStatus === 'provisional' ? 'Role proposed' : 'Role open'}
    </span>
    <span className="text-xs text-muted-foreground">
      {row.valueStatus === 'needs-token' ? 'Token needed' : 'Values open'}
    </span>
  </span>
)

const CandidateStatus = () => (
  <span className="w-fit rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-warning/30">
    Role proposal · values open
  </span>
)

const SpecimenLabel = ({ label, token }: { label: string; token: string }) => (
  <div className="flex flex-wrap items-center justify-between gap-2">
    <span className="text-xs font-medium">{label}</span>
    <code className="text-xs text-muted-foreground">{token}</code>
  </div>
)

const MeaningExample = ({
  icon,
  label,
  swatchClassName,
}: {
  icon: React.ReactNode
  label: string
  swatchClassName: string
}) => (
  <div className="rounded-xl border border-border bg-background p-4">
    <span className="flex items-center gap-3 text-sm font-medium text-foreground">
      <span
        aria-hidden="true"
        className={cn(
          'block h-4 w-4 shrink-0 rounded-sm ring-1 ring-inset ring-foreground/20',
          swatchClassName
        )}
      />
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
    </span>
  </div>
)

export default ColorFoundationCandidate
