import { useState, type ReactNode } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerSurface,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/design-system-v1/drawer'
import { SearchField } from '@/components/design-system-v1/search-field'
import { IconButton } from '@/components/icon-button'

const DrawerStateSheet = () => (
  <section
    data-testid="drawer-state-sheet"
    className="space-y-6"
    aria-labelledby="drawer-state-sheet-title"
  >
    <div>
      <p className="text-sm font-medium text-primary">
        Exploration only · retained product evidence
      </p>
      <h2 id="drawer-state-sheet-title" className="mt-1 text-2xl font-light">
        Drawer behavior evidence
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        Existing task and selector flows still use a right-side desktop Drawer,
        so this page preserves that behavior as migration evidence. It is not a
        V1 direction to approve for new work. Each flow should first be fitted
        to the accepted centered-desktop Dialog that becomes bottom-attached on
        phones. Drawer should return to review only if a concrete flow cannot
        migrate without meaningful loss.
      </p>
    </div>

    <div className="grid gap-0.5 bg-secondary p-0.5 xl:grid-cols-2">
      <Specimen label="Task body · shared shell only">
        <DrawerSurface>
          <TaskComposition />
        </DrawerSurface>
      </Specimen>
      <Specimen label="Selector body · shared shell only">
        <DrawerSurface>
          <SelectorComposition />
        </DrawerSurface>
      </Specimen>
    </div>

    <div className="border border-border bg-card p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Retained interaction evidence
      </p>
      <p className="mt-2 max-w-2xl text-sm font-light leading-5 text-muted-foreground">
        Open either existing-use specimen to inspect focus, dismissal, body
        scrolling, anchored actions, and focus return. Neither the right-side
        placement nor the fixture-specific composition is approved for new
        product work.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <InteractiveTaskDrawer />
        <InteractiveSelectorDrawer />
      </div>
    </div>
  </section>
)

const Specimen = ({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) => (
  <div className="min-w-0 bg-background p-4 sm:p-6">
    <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    {children}
  </div>
)

const CloseAction = ({ interactive = false }: { interactive?: boolean }) => {
  const action = (
    <IconButton
      label="Close drawer"
      icon={<X />}
      size="compact"
      tone="secondary"
    />
  )

  return interactive ? <DrawerClose asChild>{action}</DrawerClose> : action
}

const TaskComposition = ({
  interactive = false,
}: {
  interactive?: boolean
}) => (
  <>
    <DrawerHeader action={<CloseAction interactive={interactive} />}>
      <DrawerTitle>Review staking</DrawerTitle>
      <DrawerDescription>
        Confirm the amount and destination before continuing.
      </DrawerDescription>
    </DrawerHeader>
    <DrawerBody className="px-4">
      <div className="space-y-4 py-4">
        <DataRow label="Amount" value="1,000 RSR" />
        <DataRow label="Destination" value="Governance vault" />
        <DataRow label="Network" value="Ethereum" />
        <div className="bg-secondary p-4 text-sm font-light leading-5 text-muted-foreground">
          Longer task content scrolls within this region. The header and action
          footer stay anchored to the shell.
        </div>
      </div>
    </DrawerBody>
    <DrawerFooter>
      <Button className="w-full">Continue</Button>
    </DrawerFooter>
  </>
)

const DataRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 text-sm leading-5">
    <span className="font-light text-muted-foreground">{label}</span>
    <span className="text-right font-medium text-foreground">{value}</span>
  </div>
)

const SelectorComposition = ({
  interactive = false,
}: {
  interactive?: boolean
}) => {
  const [query, setQuery] = useState('')

  return (
    <>
      <DrawerHeader action={<CloseAction interactive={interactive} />}>
        <DrawerTitle>Select assets</DrawerTitle>
        <DrawerDescription>
          Choose the assets to include in this composition.
        </DrawerDescription>
      </DrawerHeader>
      <DrawerBody>
        <SearchField
          aria-label="Search assets"
          placeholder="Search assets"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery('')}
          className="mx-4 my-4"
        />
        <div className="space-y-1">
          <SelectorRow label="RSR" defaultChecked />
          <SelectorRow label="USDC" />
          <SelectorRow label="ETH" defaultChecked />
        </div>
      </DrawerBody>
      <DrawerFooter>
        <Button className="w-full">Add selected</Button>
      </DrawerFooter>
    </>
  )
}

const SelectorRow = ({
  defaultChecked = false,
  label,
}: {
  defaultChecked?: boolean
  label: string
}) => (
  <label className="flex min-h-11 cursor-pointer items-center gap-2 px-4 text-sm font-light hover:bg-foreground/5">
    <Checkbox defaultChecked={defaultChecked} aria-label={`Select ${label}`} />
    <span>{label}</span>
  </label>
)

const InteractiveTaskDrawer = () => (
  <Drawer>
    <DrawerTrigger asChild>
      <Button>Open task drawer</Button>
    </DrawerTrigger>
    <DrawerContent>
      <TaskComposition interactive />
    </DrawerContent>
  </Drawer>
)

const InteractiveSelectorDrawer = () => (
  <Drawer>
    <DrawerTrigger asChild>
      <Button tone="secondary">Open selector drawer</Button>
    </DrawerTrigger>
    <DrawerContent>
      <SelectorComposition interactive />
    </DrawerContent>
  </Drawer>
)

export default DrawerStateSheet
