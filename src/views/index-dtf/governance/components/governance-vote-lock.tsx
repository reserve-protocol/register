import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Skeleton } from '@/components/ui/skeleton'
import { CurrentDtfVoteLock } from '@/components/vote-lock'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import useIndexDTFList from '@/hooks/useIndexDTFList'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getFolioRoute } from '@/utils'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ChevronDown } from 'lucide-react'
import { ReactNode, useMemo, useState } from 'react'
import { useVoteLockAPR } from '../../overview/hooks/use-staking-vault-apy'
import useGovernedDtfs, { GovernedDtf } from '../hooks/use-governed-dtfs'
import RSRBNBHelp from './rsr-bnb-help'

const AUTO_ACCRUING_REWARD_VAULTS = new Set([
  '0xe744c8157c346b2931807f42552c8cbc0bb6d34f',
])

const Placeholder = () => (
  <div className="bg-background space-y-6 p-2 rounded-3xl">
    <div className="flex px-4 pt-4 items-center justify-between">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>

    <div className="space-y-2 mx-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>

    <div className="mt-6">
      <Skeleton className="h-14 w-full rounded-lg" />
    </div>
  </div>
)

const GovernedDtfsHoverCard = ({
  dtfs,
  chainId,
  voteLockSymbol,
}: {
  dtfs: GovernedDtf[]
  chainId: number
  voteLockSymbol: string
}) => {
  const [open, setOpen] = useState(false)
  const count = dtfs.length

  return (
    <>
      <span className="text-legend"> + </span>
      <HoverCard open={open} onOpenChange={setOpen} openDelay={150}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center gap-0.5 align-baseline transition-colors focus-visible:outline-none focus-visible:text-primary ${
              open ? 'text-primary' : 'text-legend hover:text-primary'
            }`}
          >
            <span>
              {count}{' '}
              {count === 1 ? (
                <Trans>other DTF</Trans>
              ) : (
                <Trans>other DTFs</Trans>
              )}
            </span>
            <ChevronDown
              size={16}
              strokeWidth={2}
              className={`transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>
        </HoverCardTrigger>
        <HoverCardContent align="start" className="w-72 p-1">
          <div className="mb-2 text-xs px-3 pt-3 font-semibold uppercase tracking-wide text-legend">
            <Trans>DTFs governed by {voteLockSymbol}</Trans>
          </div>
          <div>
            {dtfs.map((dtf) => (
              <a
                key={dtf.id}
                href={getFolioRoute(dtf.id, chainId)}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-xl px-3 py-2 transition-colors hover:bg-muted"
              >
                <span className="block text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                  ${dtf.token.symbol}
                </span>
                <span className="block truncate text-xs text-legend transition-colors group-hover:text-primary">
                  {dtf.token.name}
                </span>
              </a>
            ))}
          </div>
        </HoverCardContent>
      </HoverCard>
    </>
  )
}

type RewardToken = {
  address?: string
  name?: string
  symbol?: string
}

const RewardTokensHoverCard = ({
  chainId,
  tokens,
}: {
  chainId: number
  tokens: RewardToken[]
}) => {
  const [open, setOpen] = useState(false)

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={150}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1 rounded-full transition-colors focus-visible:outline-none focus-visible:text-primary ${
            open ? 'text-primary' : 'text-foreground hover:text-primary'
          }`}
        >
          <span className="flex -space-x-2">
            {tokens.map((token) => (
              <span
                key={`${token.address}-${token.symbol}`}
                className="rounded-full border-2 border-background bg-card"
              >
                <TokenLogo
                  size="md"
                  symbol={token.symbol}
                  address={token.address}
                  chain={chainId}
                />
              </span>
            ))}
          </span>
          <ChevronDown
            size={16}
            strokeWidth={2}
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-64 p-1">
        <div className="mb-2 px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-legend">
          <Trans>Reward tokens</Trans>
        </div>
        <div>
          {tokens.map((token) => (
            <div
              key={`${token.address}-${token.symbol}-detail`}
              className="flex items-center gap-2 rounded-xl px-3 py-2"
            >
              <TokenLogo
                size="md"
                symbol={token.symbol}
                address={token.address}
                chain={chainId}
              />
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">
                  ${token.symbol}
                </div>
                {!!token.name && (
                  <div className="truncate text-xs text-legend">
                    {token.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

const RewardFacts = ({
  rewardsIn,
  claiming,
}: {
  rewardsIn: ReactNode
  claiming: ReactNode
}) => (
  <>
    <div className="h-px bg-border" />
    <div className="grid grid-cols-[1fr_auto_1fr] gap-5">
      <div className="flex items-center pt-4 pb-2 justify-between">
        <div className="text-base text-legend">
          <Trans>Rewards in</Trans>
        </div>
        <div className="text-base font-medium">{rewardsIn}</div>
      </div>
      <div className="h-full w-px bg-border" />
      <div className="flex items-center pt-4 pb-2 justify-between">
        <div className="text-base text-legend">
          <Trans>Claiming</Trans>
        </div>
        <div className="text-base font-medium">{claiming}</div>
      </div>
    </div>
  </>
)

const GovernanceVoteLock = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const apr = useVoteLockAPR()
  const { data: governedDtfsData } = useGovernedDtfs(
    indexDTF?.stToken?.id,
    indexDTF?.chainId
  )
  const { data: listedDtfs } = useIndexDTFList()
  const governedDtfs = (governedDtfsData ?? []) as GovernedDtf[]
  const listedDtfAddresses = useMemo(() => {
    if (!listedDtfs || !indexDTF?.chainId) return null

    return new Set(
      listedDtfs
        .filter(
          (dtf) =>
            dtf.chainId === indexDTF.chainId && !isInactiveDTF(dtf.status)
        )
        .map((dtf) => dtf.address.toLowerCase())
    )
  }, [listedDtfs, indexDTF?.chainId])
  const listedGovernedDtfs = listedDtfAddresses
    ? governedDtfs.filter((dtf) => listedDtfAddresses.has(dtf.id.toLowerCase()))
    : governedDtfs

  if (!indexDTF?.stToken) {
    return <Placeholder />
  }

  const rewardTokens = indexDTF.stToken.rewardTokens
  const otherGovernedDtfs = listedGovernedDtfs.filter(
    (dtf) => dtf.id.toLowerCase() !== indexDTF.id.toLowerCase()
  )
  const otherDtfCount = otherGovernedDtfs.length
  const rewardSymbols = rewardTokens
    .map((token) => token.symbol)
    .filter(Boolean)
  const voteLockSymbol = `$${indexDTF.stToken.token.symbol}`
  const voteLockGovernedLabel = `${voteLockSymbol}-governed`
  const underlyingSymbol = `$${indexDTF.stToken.underlying.symbol}`
  const rewardLabel = rewardSymbols.map((symbol) => `$${symbol}`).join(', ')
  const rewardsAccrueAutomatically = AUTO_ACCRUING_REWARD_VAULTS.has(
    indexDTF.stToken.id.toLowerCase()
  )
  const aprLabel = apr && apr >= 0.01 ? `${apr.toFixed(2)}% APR` : ''
  const rewardsInLabel =
    rewardLabel ||
    (rewardsAccrueAutomatically
      ? underlyingSymbol
      : `$${indexDTF.token.symbol}`)
  const rewardsIn =
    rewardTokens.length > 1 ? (
      <RewardTokensHoverCard chainId={chainId} tokens={rewardTokens} />
    ) : (
      rewardsInLabel
    )

  return (
    <div className="rounded-3xl bg-background p-2">
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2 mb-10">
          <TokenLogo
            size="xl"
            symbol={indexDTF.stToken.underlying.symbol}
            address={indexDTF.stToken.underlying.address}
            chain={chainId}
          />
          {!!aprLabel && (
            <div className="rounded-full bg-primary/10 border border-primary px-3 py-1 text-primary text-sm font-semibold ml-auto">
              {aprLabel}
            </div>
          )}
        </div>
        <h4 className="text-xl font-semibold break-words mb-1">
          <Trans>Govern ${indexDTF.token.symbol}</Trans>
          {otherDtfCount > 0 && (
            <GovernedDtfsHoverCard
              dtfs={otherGovernedDtfs}
              chainId={chainId}
              voteLockSymbol={voteLockSymbol}
            />
          )}
        </h4>
        {otherDtfCount > 0 && rewardsAccrueAutomatically ? (
          <div className="space-y-0 text-sm">
            <p className="text-base text-legend max-w-84 mb-4">
              <Trans>
                Vote-lock {underlyingSymbol} in {voteLockSymbol} to govern and
                earn from TVL fees across all {voteLockGovernedLabel} DTFs.
              </Trans>
            </p>
            <RewardFacts
              rewardsIn={rewardsIn}
              claiming={<Trans>Automatic</Trans>}
            />
          </div>
        ) : (
          <div className="space-y-0">
            <p className="text-base text-legend max-w-84 mb-4">
              {otherDtfCount > 0 ? (
                <Trans>
                  Vote-lock {underlyingSymbol} in {voteLockSymbol} to govern and
                  earn from TVL fees across all {voteLockGovernedLabel} DTFs.
                </Trans>
              ) : (
                <Trans>
                  Vote-lock {underlyingSymbol} in {voteLockSymbol} to govern and
                  earn from this DTF&apos;s TVL fee.
                </Trans>
              )}
            </p>
            <RewardFacts
              rewardsIn={rewardsIn}
              claiming={<Trans>Manual</Trans>}
            />
          </div>
        )}
      </div>

      <CurrentDtfVoteLock>
        <Button className="rounded-xl w-full gap-1.5 h-[40px]">
          <div className="border border-card rounded-full">
            <TokenLogo
              size="sm"
              symbol={indexDTF.stToken.underlying.symbol}
              address={indexDTF.stToken.underlying.address}
              chain={chainId}
            />
          </div>
          <span>
            <Trans>Vote-lock ${indexDTF.stToken.underlying.symbol}</Trans>
          </span>
        </Button>
      </CurrentDtfVoteLock>

      <RSRBNBHelp compact className="px-4 py-4" />
    </div>
  )
}

export default GovernanceVoteLock
