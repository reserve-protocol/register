import { Trans, useLingui } from '@lingui/react/macro'
import { ArrowLeft, ArrowRight, ArrowUpRight, Combine, Info } from 'lucide-react'

import { Button } from '@/components/button'
import { ActionGroup } from '@/components/design-system-v1/action-group'
import {
  InlineMessage,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { candidateSemanticRoles as semanticRoles } from '@/components/design-system-v1/semantic-roles'
import {
  transactionAttachedRegionGeometry,
  transactionTaskGeometry,
} from '@/components/design-system-v1/transaction-task-geometry'
import { v1Typography } from '@/components/design-system-v1/typography'
import { IconButton } from '@/components/icon-button'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { getFolioRoute } from '@/utils'
import { CMC20_ADDRESS } from '@/utils/addresses'
import { ChainId } from '@/utils/chains'
import { ROUTES } from '@/utils/constants'

import type { AutomatedMintReviewState } from './transaction-composition-staged-fixtures'
import { AutomatedIssuanceManualLink } from './transaction-composition-staged-manual-link'

export type AutomatedMintEntryState = Extract<
  AutomatedMintReviewState,
  'Incompatible wallet' | 'Introduction' | 'Wallet required'
>

const LEARN_MORE_URL = 'https://docs.safe.global/home/what-is-safe'
const SWAP_ROUTE = getFolioRoute(
  CMC20_ADDRESS[ChainId.Base],
  ChainId.Base,
  ROUTES.ISSUANCE
)
const ENTRY_SURFACE_HEIGHT = 'sm:min-h-[32rem]'

export const isAutomatedMintEntryState = (
  state: AutomatedMintReviewState
): state is AutomatedMintEntryState =>
  state === 'Introduction' ||
  state === 'Wallet required' ||
  state === 'Incompatible wallet'

export const AutomatedMintEntry = ({
  setState,
  state,
}: {
  setState: (state: AutomatedMintReviewState) => void
  state: AutomatedMintEntryState
}) => {
  if (state === 'Introduction') {
    return <AutomatedMintIntroduction setState={setState} />
  }

  return (
    <AutomatedMintWalletRequirement
      incompatible={state === 'Incompatible wallet'}
      setState={setState}
    />
  )
}

const AutomatedMintIntroduction = ({
  setState,
}: {
  setState: (state: AutomatedMintReviewState) => void
}) => {
  return (
    <section
      aria-labelledby="automated-mint-introduction-title"
      data-testid="automated-mint-introduction"
      className={cn(
        'flex min-w-0 w-full flex-1 flex-col max-sm:ring-inset',
        ENTRY_SURFACE_HEIGHT,
        transactionAttachedRegionGeometry.frame,
        semanticRoles.surface.recessedContent
      )}
    >
      <div
        data-testid="automated-mint-swap-guidance"
        className={transactionTaskGeometry.shellInset}
      >
        <InlineMessage
          className={cn(
            semanticRoles.surface.content,
            'ring-border [--inline-message-icon-surface:hsl(var(--muted))]'
          )}
          icon={<Info className="text-muted-foreground" />}
          iconPresentation="contained"
          tone="information"
          presentation="summary"
        >
          <InlineMessageTitle>
            <Trans>Most users should use Swap</Trans>
          </InlineMessageTitle>
          <Button
            className="ml-auto shrink-0"
            size="compact"
            tone="secondary"
            asChild
          >
            <a href={SWAP_ROUTE}>
              <Trans>Use Swap</Trans>
            </a>
          </Button>
        </InlineMessage>
        <div
          className={cn(
            transactionTaskGeometry.contentInsetWithinShell,
            'pb-3 pt-4'
          )}
        >
          <p className={v1Typography.label}>
            <Trans>Before using automated minting</Trans>
          </p>
          <p className={cn(v1Typography.supporting, roles.text.supporting)}>
            <Trans>
              Automated minting is an advanced feature. For most people, simple
              swaps are recommended.
            </Trans>
          </p>
        </div>
      </div>
      <div
        data-testid="automated-mint-introduction-content"
        className={cn(
          transactionAttachedRegionGeometry.content,
          transactionTaskGeometry.shellInset,
          'flex flex-1 flex-col shadow-sm'
        )}
      >
        <div
          data-testid="automated-mint-introduction-body"
          className={cn(
            transactionTaskGeometry.contentInsetWithinShell,
            'pt-4 max-sm:mt-auto'
          )}
        >
          <div className="flex items-center gap-2">
            <Combine aria-hidden="true" className="size-4 stroke-[1.5]" />
            <p className={v1Typography.label}>
              <Trans>Advanced</Trans>
            </p>
          </div>
          <h4
            id="automated-mint-introduction-title"
            className="mt-6 text-xl font-medium leading-7"
          >
            <Trans>Automated Mint / Redeem</Trans>
          </h4>
          <p className={cn('mt-1', v1Typography.body, roles.text.supporting)}>
            <Trans>
              Mint large USDC amounts through batched CoW Swap orders, or redeem
              DTFs into the underlying assets. Recommended for market makers or
              transactions over 50,000 USDC.
            </Trans>
          </p>
          <AutomatedMintProcess />
        </div>
        <ActionGroup
          direction="vertical"
          className={cn(transactionTaskGeometry.actionFooter, 'mt-auto pt-5')}
        >
          <Button onClick={() => setState('Wallet required')}>
            <Trans>Continue</Trans>
          </Button>
          <AutomatedIssuanceManualLink
            chain={ChainId.Base}
            operation="mint"
            presentation="button"
          />
        </ActionGroup>
      </div>
    </section>
  )
}

const AutomatedMintProcess = () => (
  <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 gap-y-1 sm:flex sm:justify-between sm:gap-2">
    <span
      className={cn(
        'min-w-0 justify-self-end whitespace-nowrap sm:shrink-0',
        v1Typography.label
      )}
    >
      <Trans>You fund</Trans>
    </span>
    <ProcessArrow />
    <span
      className={cn(
        'min-w-0 justify-self-start whitespace-nowrap sm:shrink-0',
        v1Typography.label
      )}
    >
      <Trans>CoW routes</Trans>
    </span>
    <ProcessArrow className="hidden sm:block" />
    <span
      className={cn(
        'min-w-0 justify-self-end whitespace-nowrap sm:shrink-0',
        v1Typography.label
      )}
    >
      <Trans>Assets arrive</Trans>
    </span>
    <ProcessArrow />
    <span
      className={cn(
        'min-w-0 justify-self-start whitespace-nowrap sm:shrink-0',
        v1Typography.label
      )}
    >
      <Trans>You mint</Trans>
    </span>
  </div>
)

const ProcessArrow = ({ className }: { className?: string }) => (
  <ArrowRight
    aria-hidden="true"
    className={cn(
      'size-4 shrink-0 text-muted-foreground stroke-[1.5]',
      className
    )}
  />
)

const AutomatedMintWalletRequirement = ({
  incompatible,
  setState,
}: {
  incompatible: boolean
  setState: (state: AutomatedMintReviewState) => void
}) => {
  const { t } = useLingui()

  return (
    <section
      aria-labelledby="automated-mint-wallet-requirement-title"
      data-testid="automated-mint-wallet-requirement"
      className={cn(
        'flex min-w-0 w-full flex-1 flex-col max-sm:ring-inset',
        ENTRY_SURFACE_HEIGHT,
        transactionAttachedRegionGeometry.frame,
        semanticRoles.surface.recessedContent
      )}
    >
      <div
        data-testid="automated-mint-wallet-requirement-content"
        className={cn(
          transactionAttachedRegionGeometry.content,
          transactionTaskGeometry.shellInset,
          'flex flex-1 flex-col shadow-sm'
        )}
      >
        <header
          className={cn(
            transactionTaskGeometry.contentInsetWithinShell,
            'flex min-h-8 items-center justify-between gap-3 pt-4'
          )}
        >
          <IconButton
            label={t`Back to automated minting introduction`}
            icon={<ArrowLeft />}
            size="compact"
            onClick={() => setState('Introduction')}
          />
          {incompatible && (
            <LifecycleStatusPill role="actionable" indicator="warning">
              <Trans>Incompatible wallet</Trans>
            </LifecycleStatusPill>
          )}
        </header>
        <div
          data-testid="automated-mint-wallet-requirement-body"
          className="mt-auto flex flex-col"
        >
          <div
            className={cn(
              transactionTaskGeometry.contentInsetWithinShell,
              'pb-5 pt-8'
            )}
          >
            <h4
              id="automated-mint-wallet-requirement-title"
              className="text-xl font-medium leading-7"
            >
              <Trans>Smart Account Required</Trans>
            </h4>
            <p className={cn('mt-1', v1Typography.body, roles.text.supporting)}>
              <Trans>
                Automated minting and redemption require a wallet with smart
                account support. Hardware Wallets are not supported.
              </Trans>
            </p>
          </div>
          <div
            className={cn(
              transactionTaskGeometry.contentInsetWithinShell,
              'pb-5'
            )}
          >
            <p className={v1Typography.label}>
              <Trans>Known supported wallets</Trans>
            </p>
            <div className="mt-3 flex items-center gap-2">
              <SupportedWallet
                href="https://metamask.io/"
                image="/svgs/Metamask.svg"
                label={t`Open MetaMask website`}
              />
              <SupportedWallet
                href="https://www.ambire.com/"
                image="/svgs/Ambire.svg"
                label={t`Open Ambire website`}
              />
              <SupportedWallet
                href="https://safe.global/"
                image="/svgs/Safe.svg"
                label={t`Open Safe website`}
              />
            </div>
            <p
              className={cn(
                'mt-4',
                v1Typography.supporting,
                roles.text.supporting
              )}
            >
              <Trans>
                <strong className="font-medium text-foreground">Note:</strong>{' '}
                Some wallets, like MetaMask, need smart accounts enabled.
              </Trans>
            </p>
          </div>
          <ActionGroup
            direction="horizontal"
            className={cn(
              transactionTaskGeometry.actionFooter,
              'flex-col sm:flex-row [&>*]:w-full sm:[&>*:first-child]:flex-[2] sm:[&>*:last-child]:flex-1'
            )}
          >
            <Button onClick={() => setState('Initial configuration')}>
              {incompatible ? (
                <Trans>Switch wallet</Trans>
              ) : (
                <Trans>Connect Wallet</Trans>
              )}
            </Button>
            <Button asChild tone="secondary" trailingIcon={<ArrowUpRight />}>
              <a
                href={LEARN_MORE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Trans>Learn More</Trans>
              </a>
            </Button>
          </ActionGroup>
        </div>
      </div>
    </section>
  )
}

const SupportedWallet = ({
  href,
  image,
  label,
}: {
  href: string
  image: string
  label: string
}) => (
  <Button asChild className="size-11 px-0" tone="secondary">
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      <img src={image} alt="" className="size-6 rounded-md" />
    </a>
  </Button>
)
