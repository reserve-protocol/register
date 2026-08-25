import { IconButton } from '@/components/icon-button'
import {
  Check,
  ChevronDown,
  LoaderCircle,
  Settings2,
  Trash2,
  X,
} from 'lucide-react'

const IconButtonStateSheet = () => (
  <section
    data-testid="icon-button-state-sheet"
    className="space-y-4"
    aria-labelledby="icon-button-state-sheet-title"
  >
    <div>
      <h2 id="icon-button-state-sheet-title" className="text-xl font-medium">
        Canonical candidate · compact shell action
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        The promoted slice is the 32px named action used by dialog headers and
        disclosures. Toggle, selected, tooltip, and expanded hit-target
        contracts remain intentionally open.
      </p>
    </div>
    <div className="grid gap-0.5 bg-secondary p-0.5 sm:grid-cols-3">
      <State label="Close · secondary">
        <IconButton label="Close" icon={<X />} />
      </State>
      <State label="Disclosure · quiet">
        <IconButton label="Show details" icon={<ChevronDown />} tone="quiet" />
      </State>
      <State label="Settings · secondary">
        <IconButton label="Settings" icon={<Settings2 />} />
      </State>
      <State label="Destructive">
        <IconButton label="Delete" icon={<Trash2 />} tone="destructive" />
      </State>
      <State label="Disabled">
        <IconButton label="Confirm" icon={<Check />} disabled />
      </State>
      <State label="Loading">
        <IconButton label="Loading" icon={<LoaderCircle />} loading />
      </State>
    </div>
  </section>
)

const State = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="bg-card p-4">
    <p className="mb-5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="flex min-h-12 items-center">{children}</div>
  </div>
)

export default IconButtonStateSheet
