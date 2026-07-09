import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CurrentDtfVoteLock } from '@/components/vote-lock'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getFolioRoute } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useAtomValue } from 'jotai'
import { ArrowRight, Minus, Plus } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { InnerGovernanceInfo } from '../../settings/components/index-settings-governance'
import RSRBNBHelp from '../../governance/components/rsr-bnb-help'
import { useVoteLockAPR } from '../hooks/use-staking-vault-apy'
import { ChainId } from '@/utils/chains'
import SectionAnchor from '@/components/section-anchor'
import { Trans } from '@lingui/react/macro'

const Container = ({ children }: { children: React.ReactNode }) => {
  const dtf = useAtomValue(indexDTFAtom)

  if (!dtf) return null

  const isOptimistic = !!dtf.ownerGovernance?.isOptimistic

  return (
    <Card className="p-0 group/section" id="governance">
      <div>
        <div className="flex items-center gap-1 px-5 pt-5 sm:px-6 sm:pt-6">
          <h2 className="text-2xl font-light">
            {isOptimistic ? (
              <Trans>Governance</Trans>
            ) : (
              <Trans>Basket Governance</Trans>
            )}
          </h2>
          <SectionAnchor id="governance" />
        </div>
        {children}
      </div>
    </Card>
  )
}

const OpenLockDrawerButton = forwardRef<
  HTMLButtonElement,
  { onClick?: () => void }
>(({ onClick }, ref) => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const apr = useVoteLockAPR()

  if (!dtf) return

  return (
    <Button
      ref={ref}
      variant="outline"
      className="mt-4 h-11 w-full gap-1.5 rounded-2xl"
      onClick={onClick}
    >
      <div className="rounded-full border border-card">
        <TokenLogo
          size="sm"
          symbol={dtf.stToken?.underlying?.symbol ?? ''}
          address={dtf.stToken?.underlying?.address ?? 'Unknown'}
          chain={chainId}
        />
      </div>
      <span>
        <Trans>
          Lock ${dtf.stToken?.underlying.symbol ?? 'Unknown'} to Govern
        </Trans>{' '}
        {Number(apr?.toFixed(2)) > 0 && (
          <Trans>& Earn {apr?.toFixed(2)}% APR</Trans>
        )}
      </span>
    </Button>
  )
})

const ViewNonBasketGovernanceButton = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (!dtf) return null

  return (
    <div className="relative -mx-4 -mb-3 px-1 pt-4 sm:-mx-5 sm:-mb-4">
      <Button variant="outline" asChild className="w-full rounded-2xl">
        <Link
          to={getFolioRoute(
            dtf.id,
            chainId,
            ROUTES.SETTINGS + '#non-basket-governance'
          )}
        >
          <span>
            {dtf.ownerGovernance?.isOptimistic ? (
              <Trans>View governance settings</Trans>
            ) : (
              <Trans>View non-basket governance settings</Trans>
            )}
          </span>
          <ArrowRight size={14} />
        </Link>
      </Button>
    </div>
  )
}

const IndexGovernanceOverview = () => {
  const account = useAtomValue(walletAtom)
  const { openConnectModal } = useConnectModal()
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const [settingsExpanded, setSettingsExpanded] = useState(false)
  const hasSharedGovernance =
    !!dtf?.ownerGovernance?.id &&
    !!dtf?.tradingGovernance?.id &&
    dtf.ownerGovernance.id.toLowerCase() ===
      dtf.tradingGovernance.id.toLowerCase()

  if (!dtf) {
    return (
      <Container>
        <Skeleton className="w-full h-80 rounded-3xl" />
      </Container>
    )
  }

  return (
    <Container>
      <div
        className={`px-5 pt-3 sm:px-6 ${chainId === ChainId.BSC ? '' : 'pb-5 sm:pb-6'}`}
      >
        <p className="max-w-xl text-legend">
          <Trans>
            ${dtf.token.symbol} is governed by the $
            {dtf.stToken?.underlying?.symbol} token.{' '}
            {dtf.stToken?.underlying?.symbol} holders must vote-lock their
            tokens to become a governor of the ${dtf.token.symbol}. Governors
            can propose changes to the basket and vote on proposal by other
            governors. In exchange for locking their tokens and participating in
            governance, governors earn a portion of the TVL fee charged by the
            DTF.
          </Trans>
        </p>
        <div className="-mx-5 px-2 sm:-mx-5 sm:px-1">
          {account ? (
            <CurrentDtfVoteLock>
              <OpenLockDrawerButton />
            </CurrentDtfVoteLock>
          ) : (
            <OpenLockDrawerButton onClick={openConnectModal} />
          )}
        </div>
      </div>
      {chainId === ChainId.BSC && (
        <div className="px-5 sm:px-6">
          <div className="-mx-5 px-2 sm:-mx-5 sm:px-1">
            <div>
              <RSRBNBHelp className="px-3 py-4 sm:px-4 sm:py-6" />
            </div>
          </div>
        </div>
      )}
      <div className="border-t border-secondary" />
      <div
        className={
          settingsExpanded
            ? 'px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6'
            : 'px-5 py-5 sm:px-6 sm:py-6'
        }
      >
        <button
          type="button"
          className={`group flex w-full items-center justify-between gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${settingsExpanded ? 'mb-4' : ''}`}
          aria-expanded={settingsExpanded}
          onClick={() => setSettingsExpanded((expanded) => !expanded)}
        >
          <h3
            className={`text-base font-medium transition-colors group-hover:text-primary ${
              settingsExpanded
                ? 'dark:text-foreground'
                : 'dark:text-muted-foreground'
            }`}
          >
            {hasSharedGovernance ? (
              <Trans>Governance settings</Trans>
            ) : (
              <Trans>Basket governance settings</Trans>
            )}
          </h3>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-border px-2 text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            {settingsExpanded ? <Minus size={16} /> : <Plus size={16} />}
          </span>
        </button>
        {settingsExpanded && (
          <>
            <InnerGovernanceInfo
              kind="trading"
              layout="inline"
              className="[&>*]:border-t-0 [&>*]:px-0 [&>*]:py-3"
            />
            <ViewNonBasketGovernanceButton />
          </>
        )}
      </div>
    </Container>
  )
}

export default IndexGovernanceOverview
