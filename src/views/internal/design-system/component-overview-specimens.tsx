import { MoreHorizontal, Search } from 'lucide-react'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import {
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSurface,
  DialogTitle,
} from '@/components/dialog'
import { EmptyState } from '@/components/empty-state'
import { ChainBadgedLogo, EntityIdentity } from '@/components/entity-identity'
import { IconButton } from '@/components/icon-button'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { Metric } from '@/components/metric'
import {
  Field,
  FieldLabel,
  TextInput,
} from '@/components/design-system-v1/field'
import { SingleChoiceGroup } from '@/components/design-system-v1/single-choice-group'
import { ChainId } from '@/utils/chains'
import { HomeFeatureCardOverviewSpecimen } from './card-content-region-review'
import InformationRowStateSheet from './information-row-state-sheet'
import { TabsOverviewSpecimen } from './tabs-state-sheet'

const ComponentOverviewSpecimen = ({ id }: { id: string }) => {
  if (id === 'button') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button>Primary</Button>
        <Button tone="secondary">Secondary</Button>
        <Button tone="quiet">Quiet</Button>
        <Button tone="destructive">Delete</Button>
      </div>
    )
  }

  if (id === 'icon-button') {
    return (
      <div className="flex items-center gap-3">
        <IconButton label="Search" icon={<Search />} />
        <IconButton
          label="More options"
          icon={<MoreHorizontal />}
          tone="quiet"
        />
      </div>
    )
  }

  if (id === 'checkbox') {
    return (
      <div className="flex items-center gap-6">
        <Checkbox aria-label="Unchecked specimen" />
        <Checkbox aria-label="Checked specimen" checked />
        <Checkbox aria-label="Disabled specimen" checked disabled />
      </div>
    )
  }

  if (id === 'dialog') {
    return (
      <DialogSurface
        width="compact"
        className="max-w-sm border border-border shadow-lg"
      >
        <DialogHeader>
          <DialogTitle>Review transaction</DialogTitle>
          <DialogDescription>
            Confirm the operation before continuing.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="h-12 bg-muted" />
        </DialogBody>
        <DialogFooter>
          <Button className="w-full">Confirm</Button>
        </DialogFooter>
      </DialogSurface>
    )
  }

  if (id === 'entity-identity') {
    return (
      <EntityIdentity
        className="max-w-full"
        mark={
          <ChainBadgedLogo
            src="/imgs/socials/cmc20.png"
            chain={ChainId.BSC}
            size="xl"
            alt="CMC20"
          />
        }
        name="CoinMarketCap 20 Index DTF"
        supporting="$CMC20 · BNB Chain"
      />
    )
  }

  if (id === 'metric') {
    return (
      <div className="grid w-full max-w-sm grid-cols-2 gap-px bg-secondary p-px">
        <Metric className="bg-card p-4" label="Market cap" value="$8.42M" />
        <Metric className="bg-card p-4" label="Basket" value="20 assets" />
        <Metric
          className="col-span-2 bg-card p-4"
          role="headline"
          label="TVL"
          value="$21.8M"
        />
      </div>
    )
  }

  if (id === 'input') {
    return (
      <Field className="w-full max-w-sm">
        <FieldLabel htmlFor="overview-token-name">Token Name</FieldLabel>
        <TextInput id="overview-token-name" placeholder="Enter token name" />
      </Field>
    )
  }

  if (id === 'radio-group') {
    return (
      <SingleChoiceGroup
        accessibleLabel="Voting delay"
        defaultValue="1"
        options={[
          { value: '0.5', label: '12 hours' },
          { value: '1', label: '1 day' },
          { value: '1.5', label: '1.5 days' },
        ]}
      />
    )
  }

  if (id === 'badge') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <LifecycleStatusPill role="active">Voting active</LifecycleStatusPill>
        <LifecycleStatusPill role="actionable">
          Ready to start
        </LifecycleStatusPill>
        <LifecycleStatusPill role="success">Executed</LifecycleStatusPill>
      </div>
    )
  }

  if (id === 'tabs') return <TabsOverviewSpecimen />

  if (id === 'card') {
    return (
      <div className="w-full max-w-md">
        <HomeFeatureCardOverviewSpecimen />
      </div>
    )
  }

  if (id === 'table') {
    return (
      <div className="min-w-[52rem] flex-1">
        <InformationRowStateSheet />
      </div>
    )
  }

  if (id === 'empty-state') {
    return (
      <EmptyState
        className="min-h-32"
        mode="actionable"
        title="No proposals found"
        description="New governance proposals will appear here."
        actions={<Button tone="secondary">Browse governance</Button>}
      />
    )
  }

  return (
    <p className="border border-dashed border-border p-4 text-sm text-destructive">
      This rendered catalog item is missing its overview specimen.
    </p>
  )
}

export default ComponentOverviewSpecimen
