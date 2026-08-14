import { ChevronDown, MoreHorizontal, Search } from 'lucide-react'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { IconButton } from '@/components/icon-button'
import { cn } from '@/lib/utils'
import { candidateSemanticRoles as roles } from './candidate-semantic-roles'

type ControlSize = 'micro' | 'compact' | 'default'

const sizeClasses: Record<ControlSize, string> = {
  micro: 'h-7 px-2.5',
  compact: 'h-8 px-3',
  default: 'h-11 px-5',
}

const valueTextClasses = {
  compact: 'text-sm',
  default: 'text-base',
} as const

const CoreComponentScaleBoard = () => (
  <section className="overflow-hidden border border-border bg-card">
    <BoardHeader title="Shared control scale" detail="28 / 32 / 44" />
    <div
      data-testid="core-control-scale"
      className="grid grid-cols-[9rem_repeat(3,minmax(0,1fr))] bg-border"
    >
      <div className="bg-muted p-3" />
      <ColumnHeader label="Micro" value="28px" />
      <ColumnHeader label="Compact" value="32px" />
      <ColumnHeader label="Default" value="44px" />

      <RowLabel label="Button" />
      <Cell>
        <Button size="micro" tone="secondary">
          Filter
        </Button>
      </Cell>
      <Cell>
        <Button size="compact" tone="secondary">
          Filter
        </Button>
      </Cell>
      <Cell>
        <Button size="default" tone="secondary">
          Continue
        </Button>
      </Cell>

      <RowLabel label="Primary" />
      <NotApplicable />
      <Cell>
        <Button size="compact">Apply</Button>
      </Cell>
      <Cell>
        <Button size="default">Continue</Button>
      </Cell>

      <RowLabel label="Icon action" />
      <Cell>
        <CandidateIconButton size="micro" />
      </Cell>
      <Cell>
        <CandidateIconButton size="compact" />
      </Cell>
      <Cell>
        <CandidateIconButton size="default" />
      </Cell>

      <RowLabel label="Text field" />
      <NotApplicable />
      <Cell>
        <CandidateInput size="compact" />
      </Cell>
      <Cell>
        <CandidateInput size="default" />
      </Cell>

      <RowLabel label="Search" />
      <NotApplicable />
      <Cell>
        <CandidateSearch size="compact" />
      </Cell>
      <Cell>
        <CandidateSearch size="default" />
      </Cell>

      <RowLabel label="Select" />
      <NotApplicable />
      <Cell>
        <CandidateSelect size="compact" />
      </Cell>
      <Cell>
        <CandidateSelect size="default" />
      </Cell>

      <RowLabel label="Checkbox row" />
      <NotApplicable />
      <Cell>
        <CandidateCheckboxRow size="compact" />
      </Cell>
      <Cell>
        <CandidateCheckboxRow size="default" />
      </Cell>

      <RowLabel label="Segmented tabs" />
      <Cell>
        <CandidateSegmented size="micro" />
      </Cell>
      <Cell>
        <CandidateSegmented size="compact" />
      </Cell>
      <Cell>
        <CandidateSegmented size="default" />
      </Cell>

      <RowLabel label="Text tabs" />
      <NotApplicable />
      <Cell>
        <CandidateTextTabs size="compact" />
      </Cell>
      <Cell>
        <CandidateTextTabs size="default" />
      </Cell>
    </div>
  </section>
)

const BoardHeader = ({ title, detail }: { title: string; detail: string }) => (
  <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
    <h3 className="font-medium">{title}</h3>
    <code className="text-xs text-muted-foreground">{detail}</code>
  </div>
)

const ColumnHeader = ({ label, value }: { label: string; value: string }) => (
  <div className="ml-px bg-muted px-4 py-3">
    <p className="text-xs font-medium">{label}</p>
    <code className="text-[10px] text-muted-foreground">{value}</code>
  </div>
)

const RowLabel = ({ label }: { label: string }) => (
  <div className="mt-px flex min-h-20 items-center bg-muted px-4 text-xs font-medium">
    {label}
  </div>
)

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div className="ml-px mt-px flex min-h-20 items-center justify-center overflow-hidden bg-card p-3">
    {children}
  </div>
)

const NotApplicable = () => (
  <div className="ml-px mt-px flex min-h-20 items-center justify-center bg-card text-xs text-muted-foreground/60">
    —
  </div>
)

const CandidateIconButton = ({ size }: { size: ControlSize }) => (
  <IconButton
    label={`${size} more actions`}
    icon={<MoreHorizontal />}
    size={size}
  />
)

const CandidateInput = ({ size }: { size: 'compact' | 'default' }) => (
  <input
    readOnly
    value="Proposal name"
    aria-label={`${size} text field`}
    className={cn(
      sizeClasses[size],
      valueTextClasses[size],
      roles.line.control,
      roles.surface.content,
      'w-full max-w-52 rounded-full border font-light outline-none'
    )}
  />
)

const CandidateSearch = ({ size }: { size: 'compact' | 'default' }) => (
  <label className="relative block w-full max-w-52">
    <span className="sr-only">Search DTFs</span>
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <input
      readOnly
      placeholder="Search DTFs"
      className={cn(
        sizeClasses[size],
        valueTextClasses[size],
        roles.line.control,
        roles.surface.content,
        'w-full rounded-full border pl-9 pr-4 font-light outline-none'
      )}
    />
  </label>
)

const CandidateSelect = ({ size }: { size: 'compact' | 'default' }) => (
  <button
    type="button"
    className={cn(
      sizeClasses[size],
      valueTextClasses[size],
      roles.line.control,
      roles.surface.content,
      'flex w-full max-w-52 items-center justify-between rounded-full border font-light'
    )}
  >
    All chains
    <ChevronDown className="h-4 w-4 text-muted-foreground" />
  </button>
)

const CandidateSegmented = ({ size }: { size: ControlSize }) => {
  const trackClass =
    size === 'micro' ? 'h-7' : size === 'compact' ? 'h-8' : 'h-11'
  const itemClass =
    size === 'micro'
      ? 'h-6 px-2 text-xs'
      : size === 'compact'
        ? 'h-7 px-2.5 text-sm'
        : 'h-10 px-4 text-sm'

  return (
    <div
      className={cn(
        trackClass,
        roles.surface.neutralControl,
        'inline-flex items-center rounded-full p-0.5'
      )}
    >
      <button
        type="button"
        className={`${itemClass} rounded-full bg-card font-medium shadow-sm`}
      >
        All
      </button>
      <button
        type="button"
        className={`${itemClass} rounded-full font-medium text-muted-foreground`}
      >
        Active
      </button>
    </div>
  )
}

const CandidateCheckboxRow = ({ size }: { size: 'compact' | 'default' }) => (
  <label
    className={`${size === 'compact' ? 'min-h-8 text-sm' : 'min-h-11 text-base'} flex items-center gap-3 font-light`}
  >
    <Checkbox aria-label="Include asset" />
    Include asset
  </label>
)

const CandidateTextTabs = ({ size }: { size: 'compact' | 'default' }) => (
  <div
    className={`${size === 'compact' ? 'h-8 gap-4 text-sm' : 'h-11 gap-5 text-base'} flex items-center font-light`}
  >
    {['1D', '1W', '1M', '3M'].map((label) => (
      <button
        key={label}
        type="button"
        className={label === '1M' ? 'text-foreground' : 'text-muted-foreground'}
      >
        {label}
      </button>
    ))}
  </div>
)

export default CoreComponentScaleBoard
