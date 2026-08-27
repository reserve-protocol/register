import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/button'
import {
  InlineMessage,
  InlineMessageDescription,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { SearchField } from '@/components/design-system-v1/search-field'
import {
  TransactionAssetPickerList,
  TransactionAssetPickerOption,
} from '@/components/design-system-v1/transaction-asset-picker'
import {
  TransactionAmountObject,
  TransactionAmountPair,
  TransactionAmountRelation,
} from '@/components/design-system-v1/transaction-amount-object'
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

import {
  TransactionAmountAsset,
  TransactionAssetIdentity,
} from './transaction-system-assets'
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
        These are not two more transaction families. They exercise canonical
        task hierarchy and the local asset-selection job that the four families
        depend on. Viewport attachment remains a separate Dialog behavior check.
      </p>
    </header>
    <div className="grid gap-px bg-border xl:grid-cols-2">
      <PressureTest
        label="Vote unlock task"
        description="Static task surface for judging canonical Dialog header, body, and action hierarchy."
        parts={[
          { label: 'Dialog and Button', status: 'Current baseline' },
          { label: 'Vote-lock task content', status: 'Retained current' },
          {
            label: 'Amount and delayed explanation',
            status: 'Proposed candidate',
          },
        ]}
      >
        <VoteUnlockDialog />
      </PressureTest>
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

const VoteUnlockDialog = () => {
  return (
    <DialogSurface width="standard">
      <DialogHeader
        leading={
          <DialogTitle className={v1Typography.itemTitle}>
            Unlock voting power
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
      <DialogBody className="space-y-3 px-0 pb-0">
        <TransactionAmountPair>
          <TransactionAmountObject
            label="You unlock"
            amount="1,250"
            readOnly
            presentation="input"
            asset={
              <TransactionAmountAsset chain={ChainId.Mainnet} symbol="RSR" />
            }
            supporting="3,820 RSR locked"
          />
          <TransactionAmountObject
            label="You can withdraw later"
            amount="1,250"
            presentation="output"
            asset={
              <TransactionAmountAsset chain={ChainId.Mainnet} symbol="RSR" />
            }
            supporting="After governance delay"
            readOnly
          />
          <TransactionAmountRelation />
        </TransactionAmountPair>
        <InlineMessage tone="warning" density="compact">
          <InlineMessageTitle>
            Rewards stop during the unlock period
          </InlineMessageTitle>
          <InlineMessageDescription className="mt-1">
            The confirmed initiation starts a delay; it is not the final
            withdrawal.
          </InlineMessageDescription>
        </InlineMessage>
      </DialogBody>
      <DialogFooter className="px-0 pb-0 pt-2">
        <Button className="w-full">Begin unlock</Button>
      </DialogFooter>
    </DialogSurface>
  )
}

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
          identity={
            <TransactionAssetIdentity
              chain={ChainId.Base}
              symbol="USDC"
              name="USD Coin"
              supporting="Base · 0x8335…2913"
              size="default"
            />
          }
          balance="4,280.16 USDC"
          selected
        />
        <TransactionAssetPickerOption
          identity={
            <TransactionAssetIdentity
              chain={ChainId.Base}
              symbol="WETH"
              name="Wrapped Ether"
              supporting="Base · 0x4200…0006"
              size="default"
            />
          }
          balance="1.804 WETH"
        />
        <TransactionAssetPickerOption
          identity={
            <TransactionAssetIdentity
              chain={ChainId.Base}
              symbol="WBTC"
              name="Wrapped Bitcoin"
              supporting="Base · 0x0555…A7B8"
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
