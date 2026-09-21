import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/button'
import {
  Field,
  FieldDescription,
  FieldLabel,
  TextInput,
} from '@/components/design-system-v1/field'
import { v1Typography } from '@/components/design-system-v1/typography'
import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'

export const TypographyReviewContexts = () => (
  <div className="grid gap-4 xl:grid-cols-2">
    <ContextPanel
      label="Page hierarchy"
      title="From page identity to contained content"
      description="Tests the large roles together instead of approving them as disconnected samples."
    >
      <section aria-label="Page hierarchy" className="bg-card p-6">
        <p className="text-[32px] font-light leading-[38px] tracking-[-0.01em]">
          Large Cap Index
        </p>
        <p className="mt-2 max-w-xl text-xl font-light leading-7 text-muted-foreground">
          Diversified exposure to established crypto assets in one onchain
          portfolio.
        </p>
        <div className="mt-8">
          <h3 className="text-2xl font-light leading-[30px]">Overview</h3>
          <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
            Current portfolio information and recent activity
          </p>
        </div>
        <div className="mt-6 border border-border bg-background p-4">
          <h4 className="text-xl font-medium leading-[26px]">
            Governance activity
          </h4>
          <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
            Review active proposals and recent outcomes.
          </p>
        </div>
      </section>
    </ContextPanel>

    <ContextPanel
      label="Form hierarchy"
      title="Labels, values, help, and actions"
      description="Uses the accepted Field and Button implementations so typography is judged inside real control geometry."
    >
      <section aria-label="Form hierarchy" className="bg-card p-6">
        <h3 className="text-2xl font-light leading-[30px]">
          Governance parameters
        </h3>
        <p className="mt-1 max-w-lg text-sm font-light leading-5 text-muted-foreground">
          Choose how long voting remains open after a proposal becomes active.
        </p>
        <Field className="mt-6 max-w-md">
          <FieldLabel htmlFor="typography-voting-period">
            Voting period
          </FieldLabel>
          <TextInput
            id="typography-voting-period"
            defaultValue="3"
            trailing="days"
            readOnly
          />
          <FieldDescription>
            Token holders can vote throughout this period. The value can be
            changed before the proposal is submitted.
          </FieldDescription>
        </Field>
        <div className="mt-6 flex justify-end">
          <Button trailingIcon={<ArrowRight />}>Continue</Button>
        </div>
      </section>
    </ContextPanel>

    <ContextPanel
      label="Dense data hierarchy"
      title="Repeated identity and comparable values"
      description="Checks that medium weight creates structure while ordinary numbers remain calm and equally readable."
    >
      <section aria-label="Dense data hierarchy" className="bg-card p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-light leading-[30px]">Holdings</h3>
            <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
              Current basket allocation
            </p>
          </div>
          <p className="text-right text-sm font-light leading-5 text-muted-foreground">
            3 assets
          </p>
        </div>
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_5.5rem_6rem] gap-4 pb-2 text-sm font-medium leading-5 text-muted-foreground">
          <span>Asset</span>
          <span className="text-right">Weight</span>
          <span className="text-right">30 day</span>
        </div>
        <DataRow
          name="Ethereum"
          symbol="WETH"
          weight="34.82%"
          movement="+8.42%"
          positive
        />
        <DataRow
          name="USD Coin"
          symbol="USDC"
          weight="21.15%"
          movement="+0.02%"
          positive
        />
        <DataRow
          name="Wrapped Bitcoin"
          symbol="WBTC"
          weight="18.63%"
          movement="−4.18%"
        />
      </section>
    </ContextPanel>

    <ContextPanel
      label="Reading hierarchy"
      title="Longer product explanation"
      description="Tests ordinary body copy, supporting text, measure, and paragraph rhythm over multiple lines."
    >
      <section aria-label="Reading hierarchy" className="bg-card p-6">
        <h3 className="text-2xl font-light leading-[30px]">About this DTF</h3>
        <div className="mt-4 max-w-[65ch] space-y-3">
          <p className={v1Typography.body}>
            This portfolio provides diversified exposure to established onchain
            assets. Its mandate defines what can enter the basket and how the
            portfolio changes over time.
          </p>
          <p className={`${v1Typography.body} text-muted-foreground`}>
            Governance can propose changes while transparent rules make the
            current composition and execution process visible to participants.
          </p>
        </div>
        <button
          type="button"
          className="mt-4 text-sm font-medium leading-5 text-primary underline-offset-2 hover:underline"
        >
          Read the full mandate
        </button>
      </section>
    </ContextPanel>
  </div>
)

const ContextPanel = ({
  label,
  title,
  description,
  children,
}: {
  label: string
  title: string
  description: string
  children: React.ReactNode
}) => (
  <article className="border border-border bg-card">
    <div className="p-4">
      <p className="text-sm font-medium leading-5 text-primary">{label}</p>
      <h3 className="mt-1 text-xl font-medium leading-[26px]">{title}</h3>
      <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
    <div className="border-t border-border bg-background p-2">{children}</div>
  </article>
)

const DataRow = ({
  name,
  symbol,
  weight,
  movement,
  positive = false,
}: {
  name: string
  symbol: string
  weight: string
  movement: string
  positive?: boolean
}) => (
  <div className="grid min-h-14 grid-cols-[minmax(0,1fr)_5.5rem_6rem] items-center gap-4">
    <span className="min-w-0">
      <span className="block truncate text-base font-medium leading-6">
        {name}
      </span>
      <span className="block text-sm font-light leading-5 text-muted-foreground">
        {symbol}
      </span>
    </span>
    <span className="text-right text-base font-light leading-6 tabular-nums">
      {weight}
    </span>
    <span
      className={`text-right text-base font-light leading-6 tabular-nums ${positive ? PERFORMANCE_TEXT_CLASSES.positive : PERFORMANCE_TEXT_CLASSES.negative}`}
    >
      {movement}
    </span>
  </div>
)
