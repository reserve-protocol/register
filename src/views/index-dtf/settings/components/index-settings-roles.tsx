import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { t } from '@lingui/macro'
import { atom, useAtomValue } from 'jotai'
import { Image, MousePointerClick, ShieldHalf } from 'lucide-react'
import { IconWrapper, InfoCard, InfoCardItem } from './settings-info-card'

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

  return (
    <InfoCard title={t`Roles`} secondary>
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
          value={shortenAddress(guardian)}
        />
      ))}
      {indexDTF?.auctionLaunchers?.map((approver) => (
        <InfoCardItem
          key={approver}
          label={t`Auction Launcher`}
          icon={<IconWrapper Component={MousePointerClick} />}
          address={approver}
          value={shortenAddress(approver)}
        />
      ))}
      {indexDTF?.brandManagers?.map((approver) => (
        <InfoCardItem
          key={approver}
          label={t`Brand Manager`}
          icon={<IconWrapper Component={Image} />}
          address={approver}
          value={shortenAddress(approver)}
        />
      ))}
    </InfoCard>
  )
}

export default RolesInfo
