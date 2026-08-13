import {
  ArrowRight,
  ChevronDown,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from 'lucide-react'

const ControlGeometryMatrix = () => (
  <article className="overflow-hidden border border-border bg-card">
    <div className="border-b border-border p-5">
      <h3 className="font-medium">Size-category reference grid</h3>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        Equivalent controls grouped by visible height. Use this to compare
        padding, icon placement, text centering, and radius without composition
        differences obscuring the geometry.
      </p>
    </div>

    <div className="space-y-px bg-secondary">
      <GeometryRow size="micro" label="Micro" value="28px" />
      <GeometryRow size="compact" label="Compact" value="32px" />
      <GeometryRow size="default" label="Default" value="44px" />
    </div>
  </article>
)

type GeometrySize = 'micro' | 'compact' | 'default'

const GeometryRow = ({
  size,
  label,
  value,
}: {
  size: GeometrySize
  label: string
  value: string
}) => {
  const isMicro = size === 'micro'

  return (
    <section className="bg-card p-5" aria-label={`${label} control geometry`}>
      <div className="mb-4 flex items-baseline gap-2">
        <h4 className="text-sm font-medium">{label}</h4>
        <code className="text-xs text-muted-foreground">{value}</code>
        {isMicro && (
          <span className="text-xs font-light text-muted-foreground">
            Embedded controls only
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Specimen label="Text button">
          <button type="button" className={textButtonClassNames[size]}>
            Action
          </button>
        </Specimen>
        <Specimen label="Leading icon">
          <button type="button" className={leadingButtonClassNames[size]}>
            <SlidersHorizontal className={iconClassNames[size]} />
            Filters
          </button>
        </Specimen>
        <Specimen label="Trailing icon">
          <button type="button" className={trailingButtonClassNames[size]}>
            Continue
            <ArrowRight className={iconClassNames[size]} />
          </button>
        </Specimen>
        <Specimen label="Icon only">
          <button
            type="button"
            aria-label={`${label} more actions`}
            className={iconButtonClassNames[size]}
          >
            <MoreHorizontal className={iconClassNames[size]} />
          </button>
        </Specimen>

        {!isMicro && (
          <>
            <Specimen label="Input">
              <div className={inputClassNames[size]}>Field value</div>
            </Specimen>
            <Specimen label="Search input">
              <div className={`relative ${fieldWidthClassNames[size]}`}>
                <Search className={searchIconClassNames[size]} />
                <div className={searchClassNames[size]}>Search</div>
              </div>
            </Specimen>
            <Specimen label="Select trigger">
              <button type="button" className={selectClassNames[size]}>
                3 days
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </Specimen>
            <Specimen label="Segmented control">
              <div className={segmentClassNames[size]}>
                <span className={segmentActiveClassNames[size]}>All</span>
                <span className="px-3 text-muted-foreground">Watchlist</span>
              </div>
            </Specimen>
          </>
        )}
      </div>
    </section>
  )
}

const Specimen = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="min-w-0">
    <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
    <div className="flex min-h-11 items-center">{children}</div>
  </div>
)

const baseButton =
  'flex items-center justify-center rounded-full border border-border bg-card font-medium'
const baseField =
  'flex items-center rounded-full border border-input bg-card text-sm font-light'

const iconClassNames: Record<GeometrySize, string> = {
  micro: 'h-3.5 w-3.5',
  compact: 'h-4 w-4',
  default: 'h-4 w-4',
}

const textButtonClassNames: Record<GeometrySize, string> = {
  micro: `${baseButton} h-7 px-2.5 text-xs`,
  compact: `${baseButton} h-8 px-3 text-sm`,
  default: `${baseButton} h-11 px-5 text-sm`,
}

const leadingButtonClassNames: Record<GeometrySize, string> = {
  micro: `${baseButton} h-7 gap-1.5 pl-2 pr-2.5 text-xs`,
  compact: `${baseButton} h-8 gap-2 pl-2.5 pr-3 text-sm`,
  default: `${baseButton} h-11 gap-2 pl-[18px] pr-5 text-sm`,
}

const trailingButtonClassNames: Record<GeometrySize, string> = {
  micro: `${baseButton} h-7 gap-1.5 pl-2.5 pr-2 text-xs`,
  compact: `${baseButton} h-8 gap-2 pl-3 pr-2.5 text-sm`,
  default: `${baseButton} h-11 gap-2 bg-primary pl-5 pr-[18px] text-sm text-primary-foreground`,
}

const iconButtonClassNames: Record<GeometrySize, string> = {
  micro: `${baseButton} h-7 w-7`,
  compact: `${baseButton} h-8 w-8`,
  default: `${baseButton} h-11 w-11`,
}

const inputClassNames: Record<GeometrySize, string> = {
  micro: '',
  compact: `${baseField} h-8 w-36 px-3`,
  default: `${baseField} h-11 w-44 px-5`,
}

const fieldWidthClassNames: Record<GeometrySize, string> = {
  micro: '',
  compact: 'w-36',
  default: 'w-44',
}

const searchIconClassNames: Record<GeometrySize, string> = {
  micro: '',
  compact:
    'absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
  default:
    'absolute left-[18px] top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
}

const searchClassNames: Record<GeometrySize, string> = {
  micro: '',
  compact: `${baseField} h-8 pl-[34px] pr-3`,
  default: `${baseField} h-11 pl-[42px] pr-5`,
}

const selectClassNames: Record<GeometrySize, string> = {
  micro: '',
  compact: `${baseField} h-8 w-36 justify-between pl-3 pr-2.5`,
  default: `${baseField} h-11 w-44 justify-between pl-5 pr-[18px]`,
}

const segmentClassNames: Record<GeometrySize, string> = {
  micro: '',
  compact: 'flex h-8 items-center rounded-full bg-muted p-0.5 text-sm font-medium',
  default: 'flex h-11 items-center rounded-full bg-muted p-0.5 text-sm font-medium',
}

const segmentActiveClassNames: Record<GeometrySize, string> = {
  micro: '',
  compact: 'flex h-7 items-center rounded-full bg-card px-3 shadow-sm',
  default: 'flex h-10 items-center rounded-full bg-card px-5 shadow-sm',
}

export default ControlGeometryMatrix
