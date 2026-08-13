import {
  AlertTriangle,
  Check,
  CircleCheck,
  Info,
} from 'lucide-react'

import Spinner from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { candidateSemanticRoles as roles } from './candidate-semantic-roles'

const CoreComponentStateBoard = () => (
  <div className="space-y-4">
    <ActionBoard />
    <StatusBoard />
    <div className="grid gap-4 xl:grid-cols-2">
      <SelectionBoard />
      <FieldStateBoard />
      <SupportBoard />
      <FeedbackBoard />
    </div>
  </div>
)

const ActionBoard = () => (
  <Board title="Action variants and states" detail="Default · 44px">
    <div className="grid grid-cols-2 gap-px bg-border xl:grid-cols-4">
      <ActionCell label="Primary"><ActionButton tone="primary">Continue</ActionButton></ActionCell>
      <ActionCell label="Secondary"><ActionButton tone="secondary">Save draft</ActionButton></ActionCell>
      <ActionCell label="Quiet"><ActionButton tone="quiet">Cancel</ActionButton></ActionCell>
      <ActionCell label="Destructive"><ActionButton tone="danger">Delete</ActionButton></ActionCell>
      <ActionCell label="Primary + loading"><ActionButton tone="primary"><Spinner size={14} strokeWidth={2} /> Saving</ActionButton></ActionCell>
      <ActionCell label="Destructive + loading"><ActionButton tone="danger"><Spinner size={14} strokeWidth={2} /> Deleting</ActionButton></ActionCell>
      <ActionCell label="Primary + disabled"><ActionButton tone="primary" disabled>Continue</ActionButton></ActionCell>
      <ActionCell label="Secondary + disabled"><ActionButton tone="secondary" disabled>Save draft</ActionButton></ActionCell>
    </div>
  </Board>
)

const SelectionBoard = () => (
  <Board title="Selection" detail="Important combinations · not every permutation">
    <StateGrid labels={['Default', 'Selected', 'Selected + focus', 'Selected + disabled']}>
      <SelectionCell label="Checkbox"><CheckboxMark /></SelectionCell>
      <SelectionCell label="Checkbox"><CheckboxMark checked /></SelectionCell>
      <SelectionCell label="Checkbox"><CheckboxMark checked focused /></SelectionCell>
      <SelectionCell label="Checkbox"><CheckboxMark checked disabled /></SelectionCell>

      <SelectionCell label="Radio"><RadioMark /></SelectionCell>
      <SelectionCell label="Radio"><RadioMark checked /></SelectionCell>
      <SelectionCell label="Radio"><RadioMark checked focused /></SelectionCell>
      <SelectionCell label="Radio"><RadioMark checked disabled /></SelectionCell>

      <SelectionCell label="Switch"><SwitchMark /></SelectionCell>
      <SelectionCell label="Switch"><SwitchMark checked /></SelectionCell>
      <SelectionCell label="Switch"><SwitchMark checked focused /></SelectionCell>
      <SelectionCell label="Switch"><SwitchMark checked disabled /></SelectionCell>
    </StateGrid>
  </Board>
)

const FieldStateBoard = () => (
  <Board title="Field states" detail="Default height · 44px">
    <StateGrid labels={['Default', 'Focus', 'Error', 'Disabled']}>
      <FieldCell><Field /></FieldCell>
      <FieldCell><Field focused /></FieldCell>
      <FieldCell><Field error /></FieldCell>
      <FieldCell><Field disabled /></FieldCell>

      <FieldCell span="full"><Textarea /></FieldCell>
    </StateGrid>
  </Board>
)

const SupportBoard = () => (
  <Board title="Support" detail="Value, loading, placeholder">
    <div className="grid grid-cols-2 gap-px bg-border">
      <SupportCell label="Slider">
        <CandidateSlider />
      </SupportCell>
      <SupportCell label="Progress">
        <div className="h-2 w-full max-w-56 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[62%] rounded-full bg-primary" />
        </div>
      </SupportCell>
      <SupportCell label="Spinner">
        <div className="flex items-center gap-3 text-sm font-light">
          <Spinner size={16} strokeWidth={2} /> Loading quote
        </div>
      </SupportCell>
      <SupportCell label="Skeleton">
        <div className="w-full max-w-56 space-y-2">
          <div className="h-3 w-2/3 rounded-full bg-muted" />
          <div className="h-3 w-full rounded-full bg-muted" />
        </div>
      </SupportCell>
      <SupportCell label="Disclosure">
        <button type="button" className="flex h-11 w-full max-w-56 items-center justify-between border-y border-border text-sm font-light">
          Show details <span className="text-muted-foreground">⌄</span>
        </button>
      </SupportCell>
    </div>
  </Board>
)

const FeedbackBoard = () => (
  <Board title="Feedback" detail="Same anatomy · semantic tone">
    <div className="grid gap-px bg-border sm:grid-cols-2">
      <Feedback tone="information" icon={<Info />} title="Information" />
      <Feedback tone="success" icon={<CircleCheck />} title="Completed" />
      <Feedback tone="warning" icon={<AlertTriangle />} title="Needs review" />
      <Feedback tone="danger" icon={<AlertTriangle />} title="Action failed" />
    </div>
  </Board>
)

const Board = ({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) => (
  <section className="overflow-hidden border border-border bg-card">
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
      <h3 className="font-medium">{title}</h3>
      <code className="text-xs text-muted-foreground">{detail}</code>
    </div>
    {children}
  </section>
)

const StateGrid = ({ labels, children }: { labels: string[]; children: React.ReactNode }) => (
  <div className="grid grid-cols-4 gap-px bg-border">
    {labels.map((label) => (
      <div key={label} className="bg-muted px-3 py-2 text-[10px] font-medium text-muted-foreground">
        {label}
      </div>
    ))}
    {children}
  </div>
)

const SelectionCell = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex min-h-20 flex-col items-center justify-center gap-2 bg-card p-3">
    {children}
    <span className="text-[10px] text-muted-foreground">{label}</span>
  </div>
)

const ActionCell = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex min-h-24 flex-col justify-between gap-3 bg-card p-4">
    <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    <div>{children}</div>
  </div>
)

const ActionButton = ({
  tone,
  children,
  disabled = false,
}: {
  tone: 'primary' | 'secondary' | 'quiet' | 'danger'
  children: React.ReactNode
  disabled?: boolean
}) => (
  <button
    type="button"
    disabled={disabled}
    className={cn(
      'inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium',
      disabled
        ? roles.disabled.control
        : tone === 'primary'
        ? 'bg-primary text-primary-foreground'
        : tone === 'secondary'
          ? 'border border-border bg-card'
          : tone === 'quiet'
            ? 'bg-transparent'
            : 'bg-destructive text-destructive-foreground'
    )}
  >
    {children}
  </button>
)

const CheckboxMark = ({ checked = false, focused = false, disabled = false }: MarkProps) => (
  <span className={cn(
    'flex h-5 w-5 items-center justify-center rounded-[4px] border',
    checked ? 'border-primary bg-primary text-primary-foreground' : `border-border ${roles.surface.content}`,
    focused && roles.focus.onContent,
    disabled && 'border-border bg-muted text-muted-foreground'
  )}>
    {checked && <Check className="h-3.5 w-3.5" />}
  </span>
)

const RadioMark = ({ checked = false, focused = false, disabled = false }: MarkProps) => (
  <span className={cn(
    'flex h-5 w-5 items-center justify-center rounded-full border',
    checked ? 'border-primary' : 'border-border',
    disabled ? 'bg-muted' : roles.surface.content,
    focused && roles.focus.onContent
  )}>
    {checked && <span className={cn('h-2.5 w-2.5 rounded-full', disabled ? 'bg-muted-foreground' : 'bg-primary')} />}
  </span>
)

const SwitchMark = ({ checked = false, focused = false, disabled = false }: MarkProps) => (
  <span className={cn(
    'flex h-5 w-9 items-center rounded-full p-0.5',
    checked ? 'justify-end' : 'justify-start',
    checked && !disabled ? 'bg-primary' : 'bg-muted',
    focused && roles.focus.onContent,
    disabled && 'ring-1 ring-inset ring-border'
  )}>
    <span className="h-4 w-4 rounded-full bg-card shadow-sm" />
  </span>
)

type MarkProps = { checked?: boolean; focused?: boolean; disabled?: boolean }

const FieldCell = ({ children, span }: { children: React.ReactNode; span?: 'full' }) => (
  <div className={`${span === 'full' ? 'col-span-4' : ''} flex min-h-24 items-center justify-center bg-card p-3`}>
    {children}
  </div>
)

const Field = ({ focused = false, error = false, disabled = false }: { focused?: boolean; error?: boolean; disabled?: boolean }) => (
  <div className="w-full max-w-44">
    <input readOnly disabled={disabled} value={disabled ? 'Unavailable' : 'Proposal title'} className={cn(
      'h-11 w-full rounded-full border px-5 text-base font-light outline-none',
      roles.surface.content,
      error ? 'border-destructive' : roles.line.control,
      focused && roles.focus.onContent,
      disabled && roles.disabled.control
    )} />
    {error && <p className="mt-1 text-[10px] text-destructive">Required field</p>}
  </div>
)

const Textarea = () => (
  <div className="grid w-full grid-cols-[7rem_1fr] items-center gap-3">
    <span className="text-xs font-medium">Textarea</span>
    <textarea readOnly value="Describe the proposal and its expected outcome." className="min-h-20 w-full resize-none rounded-lg border border-input bg-card px-4 py-3 text-base font-light outline-none" />
  </div>
)

const SupportCell = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex min-h-24 flex-col justify-between gap-3 bg-card p-4">
    <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    <div className="flex min-h-8 items-center">{children}</div>
  </div>
)

const CandidateSlider = () => (
  <div className="relative h-5 w-full max-w-56" role="img" aria-label="Slider at 62 percent">
    <div className={cn('absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full', roles.surface.neutralControl)}>
      <div className="h-full w-[62%] rounded-full bg-primary" />
    </div>
    <span className="absolute left-[62%] top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-card" />
  </div>
)

const StatusBoard = () => (
  <Board title="Status vocabulary" detail="24px pills · real governance states">
    <div className="grid grid-cols-[7rem_1fr] gap-px bg-border">
      <StatusRowLabel>Lifecycle</StatusRowLabel>
      <div className="flex flex-wrap items-center gap-2 bg-card p-4">
        <Status tone="neutral">Pending</Status>
        <Status tone="active">Voting</Status>
        <Status tone="attention">Ready to execute</Status>
        <Status tone="active">Pending execution</Status>
        <Status tone="success">Executed</Status>
        <Status tone="negative">Defeated</Status>
        <Status tone="neutral">Expired</Status>
        <Status tone="neutral">Canceled</Status>
        <Status tone="negative">Quorum not reached</Status>
      </div>
      <StatusRowLabel>Qualifiers</StatusRowLabel>
      <div className="flex flex-wrap items-center gap-2 bg-card p-4">
        <Status tone="active">Fast</Status>
        <Status tone="attention">Contested</Status>
      </div>
    </div>
  </Board>
)

const StatusRowLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center bg-muted px-4 text-xs font-medium">
    {children}
  </div>
)

type StatusTone = 'neutral' | 'active' | 'attention' | 'success' | 'negative'

const Status = ({ tone, children }: { tone: StatusTone; children: React.ReactNode }) => (
  <span className={cn(
    'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium',
    tone === 'active'
      ? [roles.feedback.information.surface, roles.feedback.information.foreground]
      : tone === 'attention'
        ? [roles.feedback.warning.surface, roles.feedback.warning.foreground]
        : tone === 'success'
          ? [roles.feedback.success.surface, roles.feedback.success.foreground]
          : tone === 'negative'
            ? [roles.feedback.danger.surface, roles.feedback.danger.foreground]
            : 'bg-muted text-muted-foreground'
  )}>
    {children}
  </span>
)

const Feedback = ({ tone, icon, title }: { tone: 'information' | 'success' | 'warning' | 'danger'; icon: React.ReactElement; title: string }) => {
  const toneClass = roles.feedback[tone].foreground
  return (
    <div className="flex min-h-24 gap-3 bg-card p-4">
      <span className={`${toneClass} mt-0.5 [&>svg]:h-4 [&>svg]:w-4`}>{icon}</span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs font-light leading-5 text-muted-foreground">Short supporting message belongs here.</p>
      </div>
    </div>
  )
}

export default CoreComponentStateBoard
