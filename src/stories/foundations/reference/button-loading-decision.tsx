import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

import { Button } from '@/components/button'

const ButtonLoadingDecision = () => (
  <section
    id="button-loading-decision"
    aria-labelledby="button-loading-decision-heading"
    className="space-y-4"
  >
    <header className="border border-primary/20 bg-primary/5 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-primary">
          Decision 02 · Actions
        </p>
        <span className="rounded-full border border-primary/20 bg-card px-2.5 py-1 text-xs font-medium text-primary">
          Accepted
        </span>
      </div>
      <h2
        id="button-loading-decision-heading"
        className="mt-3 text-2xl font-light leading-8"
      >
        Busy controls communicate the current state
      </h2>
      <p className="mt-2 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        Ordinary asynchronous work uses a progress verb. A wallet-required state
        uses a direct instruction. Once submitted, a transaction-aware control
        names the lifecycle status rather than pretending it is still an
        ordinary Button loading state.
      </p>
    </header>

    <div className="grid gap-px bg-secondary p-0.5 md:grid-cols-3">
      <AcceptedState label="Ordinary work" detail="Progress verb">
        <StateButton label="Simulating…" />
      </AcceptedState>
      <AcceptedState label="User action required" detail="Direct instruction">
        <StateButton label="Confirm in wallet" />
      </AcceptedState>
      <AcceptedState label="Submitted transaction" detail="Lifecycle status">
        <StateButton label="Transaction pending" />
      </AcceptedState>
    </div>

    <div className="flex items-center gap-2 border border-border bg-card p-4 text-sm font-light text-muted-foreground">
      <Check className="size-4 shrink-0 text-primary" />
      Width, size, hierarchy role, and placement stay stable; repeat activation
      is disabled and a spinner remains visible.
    </div>
  </section>
)

const AcceptedState = ({
  label,
  detail,
  children,
}: {
  label: string
  detail: string
  children: ReactNode
}) => (
  <div className="bg-card p-4">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="mt-1 text-xs font-light text-muted-foreground">{detail}</p>
    <div className="mt-4">{children}</div>
  </div>
)

const StateButton = ({ label }: { label: string }) => (
  <Button loading className="w-full">
    {label}
  </Button>
)

export default ButtonLoadingDecision
