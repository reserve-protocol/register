import type { ReactNode } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/button'
import { SearchField } from '@/components/design-system-v1/search-field'
import {
  TransactionAssetPickerList,
  TransactionAssetPickerOption,
} from '@/components/design-system-v1/transaction-asset-picker'
import { v1Typography } from '@/components/design-system-v1/typography'
import {
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogSurface,
  DialogTitle,
} from '@/components/dialog'
import { IconButton } from '@/components/icon-button'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import { TransactionAssetIdentity } from './transaction-system-assets'
import {
  TransactionSystemPart,
  type TransactionSystemPartStatus,
} from './transaction-system-status'

export const TransactionSystemPressureTests = () => (
  <section
    id="transaction-pressure-tests"
    data-testid="transaction-pressure-tests"
    className={v1LayoutRecipes.stack.completeGroups}
    aria-labelledby="transaction-pressure-tests-title"
  >
    <header className={v1LayoutRecipes.stack.tightText}>
      <p className={cn(v1Typography.label, 'text-primary')}>
        Bounded pressure tests
      </p>
      <h3 id="transaction-pressure-tests-title" className="text-xl font-medium">
        Task shell and local selection
      </h3>
      <p
        className={cn(
          'max-w-3xl',
          v1Typography.supporting,
          roles.text.supporting
        )}
      >
        Unreviewed static specimen, not another transaction family or an
        approved selector flow. Search and confirmation are not wired here.
        Working selection inside a transaction does not approve this separate
        layout.
      </p>
    </header>
    <div className="bg-border">
      <PressureTest
        label="Select an input asset"
        description="One bounded selector composition for local flows; the upstream Zapper selector remains excluded."
        parts={[
          { label: 'Dialog, Search, identity', status: 'Current baseline' },
          {
            label: 'Trigger, option, list composition',
            status: 'Proposed candidate',
          },
          { label: 'Package selector', status: 'Upstream-owned' },
        ]}
      >
        <AssetSelectorDialog />
      </PressureTest>
    </div>
  </section>
)

const PressureTest = ({
  children,
  description,
  label,
  parts,
}: {
  children: ReactNode
  description: string
  label: string
  parts: { label: string; status: TransactionSystemPartStatus }[]
}) => (
  <article className="min-w-0 bg-secondary p-4 sm:p-6">
    <div className="mb-4">
      <h4 className={v1Typography.itemTitle}>{label}</h4>
      <p className={cn('mt-1', v1Typography.supporting, roles.text.supporting)}>
        {description}
      </p>
    </div>
    <div className="flex justify-center">{children}</div>
    <footer className="mt-4 space-y-2">
      {parts.map((part) => (
        <TransactionSystemPart key={part.label} {...part} />
      ))}
    </footer>
  </article>
)

const AssetSelectorDialog = () => (
  <DialogSurface width="standard">
    <DialogHeader
      leading={
        <DialogTitle className={v1Typography.itemTitle}>
          Select an input asset
        </DialogTitle>
      }
      action={
        <IconButton
          label="Close preview"
          icon={<X />}
          size="compact"
          tone="secondary"
        />
      }
    />
    <DialogBody className="space-y-2 px-0 pb-0">
      <SearchField
        value=""
        readOnly
        placeholder="Search assets"
        aria-label="Search assets"
      />
      <TransactionAssetPickerList aria-label="Available input assets">
        <TransactionAssetPickerOption
          aria-label="USD Coin on Base, token address 0x8335…2913, balance 4,280.16 USDC"
          identity={
            <TransactionAssetIdentity
              chain={ChainId.Base}
              symbol="USDC"
              name="USD Coin"
              supporting="0x8335…2913"
              size="default"
            />
          }
          balance="4,280.16 USDC"
          selected
        />
        <TransactionAssetPickerOption
          aria-label="Wrapped Ether on Base, token address 0x4200…0006, balance 1.804 WETH"
          identity={
            <TransactionAssetIdentity
              chain={ChainId.Base}
              symbol="WETH"
              name="Wrapped Ether"
              supporting="0x4200…0006"
              size="default"
            />
          }
          balance="1.804 WETH"
        />
        <TransactionAssetPickerOption
          aria-label="Wrapped Bitcoin on Base, token address 0x0555…A7B8, balance 0.0041 WBTC"
          identity={
            <TransactionAssetIdentity
              chain={ChainId.Base}
              symbol="WBTC"
              name="Wrapped Bitcoin"
              supporting="0x0555…A7B8"
              size="default"
            />
          }
          balance="0.0041 WBTC"
        />
      </TransactionAssetPickerList>
    </DialogBody>
    <DialogFooter className="px-0 pb-0 pt-2">
      <Button className="w-full">Use USD Coin</Button>
    </DialogFooter>
  </DialogSurface>
)
