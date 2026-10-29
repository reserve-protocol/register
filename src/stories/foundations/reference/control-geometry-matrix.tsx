import { useState, type ReactNode } from 'react'
import { ArrowRight, MoreHorizontal, SlidersHorizontal } from 'lucide-react'
import { Button, type ButtonSize } from '@/components/button'
import { IconButton } from '@/components/icon-button'
import { TextInput } from '@/components/design-system-v1/field'
import { SearchField } from '@/components/design-system-v1/search-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'

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

const GeometryRow = ({
  size,
  label,
  value,
}: {
  size: ButtonSize
  label: string
  value: string
}) => {
  const [segment, setSegment] = useState('all')

  return (
    <section className="bg-card p-5" aria-label={`${label} control geometry`}>
      <div className="mb-4 flex items-baseline gap-2">
        <h4 className="text-sm font-medium">{label}</h4>
        <code className="text-xs text-muted-foreground">{value}</code>
        {size === 'micro' && (
          <span className="text-xs font-light text-muted-foreground">
            Embedded controls only
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Specimen label="Text button">
          <Button size={size} tone="secondary">
            Action
          </Button>
        </Specimen>
        <Specimen label="Leading icon">
          <Button
            size={size}
            tone="secondary"
            leadingIcon={<SlidersHorizontal />}
          >
            Filters
          </Button>
        </Specimen>
        <Specimen label="Trailing icon">
          <Button size={size} trailingIcon={<ArrowRight />}>
            Continue
          </Button>
        </Specimen>
        <Specimen label="Icon only">
          <IconButton
            size={size}
            label={`${label} more actions`}
            icon={<MoreHorizontal />}
          />
        </Specimen>

        {size === 'default' && (
          <>
            <Specimen label="Input">
              <TextInput
                aria-label="Input"
                className="w-44"
                defaultValue="Field value"
              />
            </Specimen>
            <Specimen label="Search input">
              <SearchField
                aria-label="Search input"
                className="w-44"
                defaultValue="Search"
              />
            </Specimen>
          </>
        )}
        {size !== 'micro' && (
          <>
            <Specimen label="Select trigger">
              <Select defaultValue="3-days">
                <SelectTrigger
                  size={size}
                  aria-label={`${label} select`}
                  className={size === 'compact' ? 'w-36' : 'w-44'}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3-days">3 days</SelectItem>
                </SelectContent>
              </Select>
            </Specimen>
            <Specimen label="Segmented control">
              <SegmentedControl
                aria-label={`${label} segmented control`}
                presentation="contained"
                size={size}
                value={segment}
                onValueChange={setSegment}
              >
                <SegmentedControlItem value="all">All</SegmentedControlItem>
                <SegmentedControlItem value="watchlist">
                  Watchlist
                </SegmentedControlItem>
              </SegmentedControl>
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
  children: ReactNode
}) => (
  <div className="min-w-0">
    <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
    <div className="flex min-h-11 items-center">{children}</div>
  </div>
)

export default ControlGeometryMatrix
