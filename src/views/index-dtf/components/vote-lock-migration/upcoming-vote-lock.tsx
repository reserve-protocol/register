import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { ExternalVoteLockDrawer, type StTokenExtended } from '@/components/vote-lock'
import { trackClick } from '@/hooks/useTrackPage'
import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { erc20Abi, isAddressEqual } from 'viem'
import { useReadContracts } from 'wagmi'
import { optimisticStakingVaultAddress } from './governance-migration'
import { useOptimisticUpgradeEligibility } from './use-upgrade-eligibility'

const TOKEN_READS = ['name', 'symbol', 'decimals'] as const

// The vault this DTF moves to on its governance upgrade, while the DTF still runs on its old vote-lock.
const useUpcomingVoteLock = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const { target } = useOptimisticUpgradeEligibility()
  const vault = target?.stakingVault
  const { data } = useReadContracts({
    contracts: TOKEN_READS.map((functionName) => ({
      address: vault,
      abi: erc20Abi,
      functionName,
      chainId: dtf?.chainId,
    })),
    query: { enabled: !!vault },
  })
  const [name, symbol, decimals] = data?.map((read) => read.result) ?? []

  if (!dtf?.stToken || !vault || !symbol || decimals === undefined) return undefined

  const stToken: StTokenExtended = {
    id: vault,
    chainId: dtf.chainId,
    token: {
      address: vault,
      name: (name as string | undefined) ?? '',
      symbol: symbol as string,
      decimals: decimals as number,
    },
    underlying: dtf.stToken.underlying,
    governance: { isOptimistic: true },
  }
  const sharedVault = optimisticStakingVaultAddress[dtf.chainId]
  return { stToken, shared: !!sharedVault && isAddressEqual(vault, sharedVault) }
}

const UpcomingVoteLock = ({ page, className }: { page: string; className?: string }) => {
  const { t } = useLingui()
  const [open, setOpen] = useState(false)
  const upcoming = useUpcomingVoteLock()

  if (!upcoming) return null

  const { stToken, shared } = upcoming
  const vault = stToken.token.symbol
  const symbol = stToken.underlying.symbol

  return (
    <section
      data-testid="upcoming-vote-lock"
      aria-label={t`New vote-lock vault`}
      className={cn('rounded-3xl border border-primary/30 bg-background p-2', className)}
    >
      <div className="p-4 pb-6">
        <div className="mb-6 flex items-center gap-2">
          <TokenLogo
            size="xl"
            symbol={vault}
            address={stToken.id}
            underlyingAddress={stToken.underlying.address}
            chain={stToken.chainId}
          />
          <span className="ml-auto inline-flex h-8 items-center rounded-full border border-primary/30 bg-primary/10 px-3 text-sm font-medium text-primary">
            <Trans>Governance upgrade</Trans>
          </span>
        </div>
        <h2 className="text-xl font-semibold leading-snug text-foreground">
          <Trans>Lock {symbol} in {vault}</Trans>
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-legend">
          {shared ? (
            <Trans>
              This DTF is moving to {vault}, the shared vote-lock for Reserve DTFs. You can lock now.
              Your {vault} starts to vote on this DTF when the upgrade executes.
            </Trans>
          ) : (
            <Trans>
              This DTF is moving to its new {vault} vote-lock. You can lock now.
              Your {vault} starts to vote on this DTF when the upgrade executes.
            </Trans>
          )}
        </p>
      </div>
      <Button
        data-testid="upcoming-vote-lock-cta"
        className="h-12 w-full gap-2 rounded-xl"
        onClick={() => {
          trackClick(page, 'upcoming_vote_lock_open', stToken.id, vault, stToken.chainId)
          setOpen(true)
        }}
      >
        <Trans>Lock in {vault}</Trans>
        <ArrowRight size={17} strokeWidth={1.75} />
      </Button>
      {open && (
        <ExternalVoteLockDrawer
          stToken={stToken}
          open={open}
          onOpenChange={setOpen}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  )
}

export default UpcomingVoteLock
