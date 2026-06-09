import { Skeleton } from '@/components/ui/skeleton'
import EnsName from '@/components/utils/ens-name'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useLingui } from '@lingui/react/macro'
import { atom, useAtomValue } from 'jotai'
import { Image, MousePointerClick, ShieldHalf, UserRoundKey } from 'lucide-react'
import { IconWrapper, InfoCard, InfoCardItem } from './settings-info-card'
import { useMemo } from 'react'

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

const RolesInfo = () => {
  const { t } = useLingui()
  const indexDTF = useAtomValue(indexDTFAtom)
  const guardians = useAtomValue(guardiansAtom)
  const optimisticProposers = useMemo(() => {
    if (indexDTF?.ownerGovernance?.optimistic) return indexDTF?.ownerGovernance.optimistic.proposers

    return []
  }, [indexDTF])

  return (
    <InfoCard title={t`Roles`} id="roles" secondary>
      {!indexDTF && (
        <div className="flex items-center p-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="ml-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24 mt-1" />
          </div>
        </div>
      )}
      {guardians?.map((guardian) => (
        <InfoCardItem
          key={guardian}
          label={t`Guardian`}
          icon={<IconWrapper Component={ShieldHalf} />}
          address={guardian}
          value={<EnsName address={guardian} />}
        />
      ))}
      {optimisticProposers.map((proposer) => (
        <InfoCardItem
          key={proposer}
          label={t`Optimistic proposer`}
          icon={<IconWrapper Component={UserRoundKey} />}
          address={proposer}
          value={<EnsName address={proposer} />}
        />
      ))}
      {indexDTF?.auctionLaunchers?.map((approver) => (
        <InfoCardItem
          key={approver}
          label={t`Auction Launcher`}
          icon={<IconWrapper Component={MousePointerClick} />}
          address={approver}
          value={<EnsName address={approver} />}
        />
      ))}
      {indexDTF?.brandManagers?.map((approver) => (
        <InfoCardItem
          key={approver}
          label={t`Brand Manager`}
          icon={<IconWrapper Component={Image} />}
          address={approver}
          value={<EnsName address={approver} />}
        />
      ))}
    </InfoCard>
  )
}

export default RolesInfo
