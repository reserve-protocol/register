import { Skeleton } from '@/components/ui/skeleton'
import EnsName from '@/components/utils/ens-name'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { t } from '@lingui/macro'
import { atom, useAtomValue } from 'jotai'
import {
  Image,
  MousePointerClick,
  ShieldAlert,
  ShieldHalf,
} from 'lucide-react'
import { IconWrapper, InfoCard, InfoCardItem } from './settings-info-card'
import useOptimisticGovernance from '../use-optimistic-governance'
import { getDTFSettingsGovernance } from '@/views/index-dtf/governance/governance-helpers'

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
  const indexDTF = useAtomValue(indexDTFAtom)
  const guardians = useAtomValue(guardiansAtom)
  const { isOptimisticGovernance, optimisticProposers, cancellers } =
    useOptimisticGovernance(indexDTF)
  const governance = getDTFSettingsGovernance(indexDTF)

  const guardianLabel = t`Guardian`
  const optimisticProposerLabel = t`Optimistic Proposer`
  const cancellerLabel = t`Canceller`
  const guardianAddresses = new Set(
    (guardians ?? []).map((address) => address.toLowerCase())
  )

  const filteredCancellers = cancellers.filter(
    (address) =>
      address.toLowerCase() !== governance?.id?.toLowerCase()
  )

  const standaloneOptimisticProposers = optimisticProposers.filter(
    (address) => !guardianAddresses.has(address.toLowerCase())
  )

  const standaloneCancellers = filteredCancellers.filter(
    (address) => !guardianAddresses.has(address.toLowerCase())
  )

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
          label={guardianLabel}
          icon={<IconWrapper Component={ShieldHalf} />}
          address={guardian}
          value={<EnsName address={guardian} />}
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
      {isOptimisticGovernance &&
        standaloneOptimisticProposers.map((address, index) => (
        <InfoCardItem
          key={address}
          label={optimisticProposerLabel}
          icon={<IconWrapper Component={MousePointerClick} />}
          address={address}
          value={<EnsName address={address} />}
          border={!!index}
        />
      ))}
      {isOptimisticGovernance &&
        standaloneCancellers.map((address, index) => (
        <InfoCardItem
          key={address}
          label={cancellerLabel}
          icon={<IconWrapper Component={ShieldAlert} />}
          address={address}
          value={<EnsName address={address} />}
          border={standaloneOptimisticProposers.length > 0 || !!index}
        />
      ))}
    </InfoCard>
  )
}

export default RolesInfo
