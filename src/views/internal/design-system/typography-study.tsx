import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'

const TYPE_ROLES = [
  {
    role: 'Display',
    spec: '48 / 54 · 300',
    className: 'text-5xl font-light leading-[1.125] tracking-[-0.015em]',
    sample: 'Build a durable portfolio',
    use: 'Rare homepage or major product moment',
  },
  {
    role: 'Page title',
    spec: '32 / 38 · 300',
    className: 'text-[32px] font-light leading-[38px] tracking-[-0.01em]',
    sample: 'Index DTF overview',
    use: 'Top-level application view',
  },
  {
    role: 'Section title',
    spec: '24 / 30 · 300',
    className: 'text-2xl font-light leading-[30px]',
    sample: 'Portfolio exposure',
    use: 'Major region within a page',
  },
  {
    role: 'Lead',
    spec: '20 / 28 · 300',
    className: 'text-xl font-light leading-7',
    sample: 'A new way to discover and build diversified portfolios.',
    use: 'Prominent supporting copy beneath a hero or major page introduction',
  },
  {
    role: 'Panel title',
    spec: '20 / 26 · 500',
    className: 'text-xl font-medium leading-[26px]',
    sample: 'Governance activity',
    use: 'Contained supporting panel, often in a secondary column',
  },
  {
    role: 'Body',
    spec: '16 / 24 · 300',
    className: 'text-base font-light leading-6',
    sample:
      'A diversified basket of onchain assets managed by transparent rules.',
    use: 'Default readable copy and ordinary values',
  },
  {
    role: 'Supporting',
    spec: '14 / 20 · 300',
    className: 'text-sm font-light leading-5 text-muted-foreground',
    sample: 'Updated a few seconds ago',
    use: 'Metadata, descriptions, and dense supporting lines',
  },
] as const

const TypographyStudy = () => (
  <section className="space-y-4" aria-labelledby="typography-study">
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="typography-study" className="text-xl font-semibold">
          Typography hierarchy
        </h2>
        <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
          First candidate
        </span>
      </div>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
        Six core sizes and two working weights. A size can serve more than one
        semantic role: line height and weight distinguish readable lead copy
        from compact structure without expanding the scale.
      </p>
    </div>

    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
      <StudyPanel
        title="Core scale"
        description="A role is a usage contract, not a wrapper component requirement."
      >
        <div className="divide-y divide-border">
          {TYPE_ROLES.map((role) => (
            <div
              key={role.role}
              className="grid gap-3 py-5 first:pt-0 last:pb-0 lg:grid-cols-[8rem_minmax(0,1fr)]"
            >
              <div>
                <p className="text-xs font-medium">{role.role}</p>
                <code className="mt-1 block text-[11px] text-muted-foreground">
                  {role.spec}
                </code>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {role.use}
                </p>
              </div>
              <p className={role.className}>{role.sample}</p>
            </div>
          ))}
        </div>
      </StudyPanel>

      <StudyPanel
        title="Weight strategy"
        description="Do not buy or add a weight until the two-weight system fails in a real composition."
      >
        <div className="space-y-5">
          <WeightExample
            weight="300"
            label="Reading and spacious hierarchy"
            className="font-light"
            copy="Display, page and section titles, lead copy, body copy, ordinary values, and supporting text."
          />
          <WeightExample
            weight="500"
            label="Structure and emphasis"
            className="font-medium"
            copy="Panel titles, labels, actions, selected tabs, item titles, and emphasized values."
          />
          <WeightExample
            weight="700"
            label="Parked"
            className="font-bold"
            copy="No proposed V1 role. Keep the file available while we test whether any rare brand moment truly earns it."
            parked
          />
        </div>
        <p className="mt-5 text-xs leading-5 text-muted-foreground">
          `font-normal` currently resolves to 300 and `font-semibold` to 500. V1
          should eventually express the intended weights directly so source
          terminology does not imply nonexistent 400 or 600 files.
        </p>
      </StudyPanel>
    </div>

    <div className="grid gap-5 xl:grid-cols-2">
      <StudyPanel
        title="Application hierarchy"
        description="A compact product region using type, neutral color, and spacing together."
      >
        <div className="bg-card p-5">
          <p className="text-2xl font-light leading-[30px]">Exposure</p>
          <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
            Assets currently represented in this portfolio
          </p>

          <div className="mt-6 grid grid-cols-[minmax(0,1fr)_5.5rem_6rem] items-end pb-2 text-sm font-light leading-5 text-muted-foreground">
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
        </div>
      </StudyPanel>

      <StudyPanel
        title="Reading hierarchy"
        description="Longer product content stays light and readable without adding extra levels."
      >
        <article className="max-w-[65ch] bg-card p-5">
          <p className="text-2xl font-light leading-[30px]">About this DTF</p>
          <p className="mt-4 text-base font-light leading-6 text-foreground">
            This portfolio provides diversified exposure to established onchain
            assets. Its mandate defines what can enter the basket and how the
            portfolio changes over time.
          </p>
          <p className="mt-3 text-base font-light leading-6 text-muted-foreground">
            Governance can propose changes while transparent rules make the
            current composition and execution process visible to participants.
          </p>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-primary"
          >
            Read the full mandate
          </button>
        </article>
      </StudyPanel>
    </div>

    <StudyPanel
      title="Edge and usage rules"
      description="A small scale still needs explicit rules for data, labels, and exceptionally dense metadata."
    >
      <div className="grid gap-3 md:grid-cols-3">
        <CandidateRule
          title="24px names major regions"
          copy="Use a section title for primary page regions such as Transactions, Governance, or Recent proposals when it owns the main content area."
        />
        <CandidateRule
          title="20px names supporting panels"
          copy="Use a panel title for self-contained, subordinate cards—especially secondary-column modules on governance and overview layouts."
        />
        <CandidateRule
          title="16px names repeated items"
          copy="Use 16px/500 for proposal names, assets, transactions, and other repeated row or list titles inside a section or panel."
        />
        <CandidateRule
          title="Labels share 14px"
          copy="Labels use 500 while supporting copy uses 300. Their job and line height differ without adding another size."
        />
        <CandidateRule
          title="Numbers inherit context"
          copy="Metrics use the appropriate role and tabular numerals; they do not require a separate font family or universal size."
        />
        <CandidateRule
          title="12px is restricted"
          copy="Allow only genuinely auxiliary chart or metadata text when 14px cannot fit. It is an exception, not a core tier."
        />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="bg-card p-4 ring-1 ring-inset ring-border">
          <p className="text-sm font-medium">Long-content behavior</p>
          <p className="mt-2 max-w-[65ch] text-sm font-light leading-5 text-muted-foreground">
            Decentralized Token Fund with an intentionally long descriptive
            title wraps naturally; only dense identifiers and known fixed-width
            cells truncate.
          </p>
        </div>
        <div className="bg-card p-4 ring-1 ring-inset ring-border">
          <p className="text-sm font-medium">Numeric behavior</p>
          <p className="mt-2 text-[32px] font-light leading-[38px] tabular-nums">
            $12,345,678.90
          </p>
          <p className="mt-1 text-sm font-light leading-5 text-muted-foreground tabular-nums">
            0x1294…6D45 · 2026-08-12 14:23
          </p>
        </div>
      </div>
    </StudyPanel>
  </section>
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
  <div className="grid min-h-14 grid-cols-[minmax(0,1fr)_5.5rem_6rem] items-center">
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

const WeightExample = ({
  weight,
  label,
  className,
  copy,
  parked = false,
}: {
  weight: string
  label: string
  className: string
  copy: string
  parked?: boolean
}) => (
  <div className={parked ? 'text-muted-foreground' : ''}>
    <div className="flex items-baseline justify-between gap-3">
      <p className={`text-xl ${className}`}>{label}</p>
      <code className="text-xs text-muted-foreground">{weight}</code>
    </div>
    <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
      {copy}
    </p>
  </div>
)

const StudyPanel = ({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) => (
  <article className="overflow-hidden rounded-2xl border border-border bg-card">
    <div className="border-b border-border p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
    <div className="bg-background p-5">{children}</div>
  </article>
)

const CandidateRule = ({ title, copy }: { title: string; copy: string }) => (
  <div className="bg-muted/40 p-4">
    <h4 className="text-sm font-medium">{title}</h4>
    <p className="mt-2 text-xs font-light leading-5 text-muted-foreground">
      {copy}
    </p>
  </div>
)

export default TypographyStudy
