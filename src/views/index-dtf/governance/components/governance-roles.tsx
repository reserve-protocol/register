import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import EnsName from '@/components/utils/ens-name'
import { isAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useLingui } from '@lingui/react/macro'
import { atom, useAtomValue } from 'jotai'
import { ArrowUpRight, CopyIcon, ShieldHalf, UserRoundKey } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Trans } from '@lingui/react/macro'
import React from 'react'

const Placeholder = () => (
  <div className="flex items-center justify-between bg-background rounded-3xl p-4">
    <div className="flex items-center gap-3">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Skeleton className="h-6 w-6" />
      <Skeleton className="h-6 w-6" />
    </div>
  </div>
)

const guardiansAtom = atom((get) => {
  const dtf = get(indexDTFAtom)

  if (!dtf) return undefined

  const added = new Set()

  // TODO: Currently we have 2 govs but we handle a single guardian list
  return [
    ...(dtf.ownerGovernance?.timelock.guardians ?? []),
    ...(dtf.tradingGovernance?.timelock.guardians ?? []),
  ].filter((guardian) => {
    if (added.has(guardian)) return false

    added.add(guardian)

    return (
      guardian !== dtf.ownerGovernance?.id &&
      guardian !== dtf.tradingGovernance?.id
    )
  })
})

const optimisticProposersAtom = atom((get) => {
  const dtf = get(indexDTFAtom)

  if (!dtf) return undefined

  return dtf.ownerGovernance?.optimistic?.proposers ?? []
})

const RoleLabel = ({
  icon: Icon,
  children,
}: {
  icon: React.ElementType
  children: React.ReactNode
}) => (
  <span className="inline-flex items-center gap-2.5">
    <Icon size={14} strokeWidth={1.75} className="hidden sm:block" />
    {children}
  </span>
)

const RoleItem = ({
  label,
  address,
}: {
  label: React.ReactNode
  address: string
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const { t } = useLingui()
  const [isCopied, setIsCopied] = React.useState(false)
  const displayText = isCopied ? t`Copied to clipboard!` : t`Copy to clipboard`

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(isAddress(address) || address)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-1.5">
      <span className="text-base text-legend">{label}</span>
      <div className="flex min-w-0 items-center">
        <span className="truncate text-right text-base font-semibold mr-2">
          <EnsName address={address} />
        </span>
        <Tooltip open={isCopied ? true : undefined} delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0 rounded-full px-0"
              onClick={handleCopy}
            >
              <CopyIcon size={12} strokeWidth={1.4} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{displayText}</TooltipContent>
        </Tooltip>
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0 rounded-full px-0"
        >
          <Link
            to={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
            target="_blank"
          >
            <ArrowUpRight size={16} strokeWidth={1.75} />
          </Link>
        </Button>
      </div>
    </div>
  )
}

const GovernanceRoles = () => {
  const guardians = useAtomValue(guardiansAtom)
  const optimisticProposers = useAtomValue(optimisticProposersAtom)

  return (
    <div className="flex flex-col rounded-3xl bg-background pb-3">
      <div className="flex items-center px-6 pt-6 pb-2">
        <h4 className="text-xl font-semibold text-card-foreground">
          <Trans>DTF Roles</Trans>
        </h4>
      </div>
      <div className="pt-2" />
      {(!guardians || !optimisticProposers) && <Placeholder />}
      {!!guardians &&
        guardians.map((guardian, index) => (
          <RoleItem
            key={`guardian-${guardian}`}
            label={
              <RoleLabel icon={ShieldHalf}>
                <Trans>Guardian</Trans> {index + 1}
              </RoleLabel>
            }
            address={guardian}
          />
        ))}
      {!!optimisticProposers &&
        optimisticProposers.map((proposer, index) => (
          <RoleItem
            key={`optimistic-proposer-${proposer}`}
            label={
              <RoleLabel icon={UserRoundKey}>
                <Trans>Optimistic proposer</Trans> {index + 1}
              </RoleLabel>
            }
            address={proposer}
          />
        ))}
    </div>
  )
}

export default GovernanceRoles
