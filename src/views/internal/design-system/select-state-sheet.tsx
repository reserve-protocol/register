import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import { ChainLogoStack } from '@/components/entity-identity'
import { Field, FieldLabel } from '@/components/design-system-v1/field'
import ChainLogo from '@/components/icons/ChainLogo'
import { ChainId } from '@/utils/chains'

const SelectStateSheet = () => (
  <section
    data-testid="select-state-sheet"
    className="space-y-4"
    aria-labelledby="select-state-sheet-title"
  >
    <div>
      <p className="text-sm font-medium text-primary">
        Accepted current baseline
      </p>
      <h2 id="select-state-sheet-title" className="mt-1 text-2xl font-light">
        Bounded-value Select
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        The trigger inherits the accepted Field geometry: 44px and 16px light
        values for ordinary forms, plus an evidenced 32px and 14px compact
        option for pagination or dense toolbars. The accepted popup uses an 8px
        surface, nested 4px option radius, shared trigger/option content axes,
        subtle interaction treatment, persistent right-side selected check, and
        canonical leading chain-identity support. Its rows currently render the
        shared provisional balanced-inset candidate: 8px around the popup list
        and 12px inside each item pair with the provisional 14px/16px
        single-line role to produce a 40px ordinary row. A 20px leading visual
        may expand its row to 44px. Search, rich entity results, action menus,
        native-select policy, and production adoption remain separate.
      </p>
    </div>

    <div className="grid gap-0.5 bg-secondary p-0.5 xl:grid-cols-3">
      <Specimen label="Placeholder · ordinary field">
        <Field className="w-full">
          <FieldLabel htmlFor="select-chain">Chain</FieldLabel>
          <Select>
            <SelectTrigger id="select-chain">
              <SelectValue placeholder="Choose a chain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="base">Base</SelectItem>
              <SelectItem value="bsc">BSC</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Specimen>

      <Specimen label="Filled · ordinary field">
        <Field className="w-full">
          <FieldLabel htmlFor="select-created">Created</FieldLabel>
          <Select defaultValue="all">
            <SelectTrigger id="select-created">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Specimen>

      <Specimen label="Disabled · value retained">
        <Field className="w-full">
          <FieldLabel htmlFor="select-disabled">Created</FieldLabel>
          <Select defaultValue="7d" disabled>
            <SelectTrigger id="select-disabled">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Specimen>

      <Specimen label="Compact · dense utility">
        <div className="flex w-full items-center justify-between gap-4 text-sm font-light text-muted-foreground">
          <span>Rows per page</span>
          <Select defaultValue="25">
            <SelectTrigger
              size="compact"
              aria-label="Rows per page"
              className="w-[70px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['10', '25', '50', '100'].map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Specimen>

      <Specimen label="Leading identity · bounded filter">
        <Field className="w-full">
          <FieldLabel htmlFor="select-chain-filter">Chain</FieldLabel>
          <Select defaultValue="all">
            <SelectTrigger id="select-chain-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHAIN_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  textValue={option.label}
                  leadingVisual={option.visual}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Specimen>

      <Specimen label="Interactive popup · accepted anatomy" align="start">
        <Field className="w-full max-w-72">
          <FieldLabel htmlFor="select-open-created">Created</FieldLabel>
          <Select defaultValue="7d">
            <SelectTrigger id="select-open-created">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {DATE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              <SelectItem value="unavailable" disabled>
                Unavailable range
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Specimen>
    </div>
  </section>
)

const DATE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '15d', label: 'Last 15 days' },
  { value: '30d', label: 'Last 30 days' },
] as const

const REVIEW_CHAINS = [ChainId.Mainnet, ChainId.Base, ChainId.BSC]

const CHAIN_OPTIONS = [
  {
    value: 'all',
    label: 'All chains',
    visual: <ChainLogoStack chains={REVIEW_CHAINS} />,
  },
  {
    value: ChainId.Mainnet.toString(),
    label: 'Ethereum',
    visual: <ChainLogo chain={ChainId.Mainnet} />,
  },
  {
    value: ChainId.Base.toString(),
    label: 'Base',
    visual: <ChainLogo chain={ChainId.Base} />,
  },
  {
    value: ChainId.BSC.toString(),
    label: 'BSC',
    visual: <ChainLogo chain={ChainId.BSC} />,
  },
] as const

const Specimen = ({
  align = 'center',
  children,
  className,
  label,
}: {
  align?: 'center' | 'start'
  children: React.ReactNode
  className?: string
  label: string
}) => (
  <div className={`min-w-0 bg-card ${className ?? ''}`}>
    <p className="border-b border-border px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div
      className={`flex min-h-36 p-6 ${align === 'center' ? 'items-center' : 'items-start'}`}
    >
      {children}
    </div>
  </div>
)

export default SelectStateSheet
