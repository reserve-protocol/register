import {
  indexDTFAtom,
  indexDTFFeeAtom,
  indexDTFFeeFloorAtom,
} from '@/state/dtf/atoms'
import { formatPercentage } from '@/utils'
import {
  formatDtfFeePercentage,
  getEffectivePlatformShare,
} from '@/utils/fees'
import { t } from '@lingui/macro'
import { atom, useAtomValue } from 'jotai'
import {
  ChartPie,
  Hash,
  Landmark,
  LandPlot,
  TableRowsSplit,
  TrainTrack,
} from 'lucide-react'
import { IconWrapper, InfoCard, InfoCardItem } from './settings-info-card'
import {
  getDTFSettingsGovernance,
  getGovernanceVoteTokenAddress,
} from '@/views/index-dtf/governance/governance-helpers'

type Recipient = {
  label: string
  value: string
  address?: string
  icon: React.ReactNode
}

const feeRecipientsAtom = atom((get) => {
  const indexDTF = get(indexDTFAtom)
  const platformFee = get(indexDTFFeeAtom)
  const feeFloor = get(indexDTFFeeFloorAtom)
  const governanceTokenAddress = getGovernanceVoteTokenAddress(
    getDTFSettingsGovernance(indexDTF),
    indexDTF?.stToken?.id
  )

  if (!indexDTF || platformFee === undefined) return undefined
  const smallestFee = Math.min(indexDTF.annualizedTvlFee, indexDTF.mintingFee)
  const effectivePlatformShare = getEffectivePlatformShare({
    fee: smallestFee,
    feeFloor,
    platformShare: platformFee,
  })
  const platformShare = {
    label: t`Fixed Platform Share`,
    value: formatPercentage(effectivePlatformShare),
    icon: <IconWrapper Component={TrainTrack} />,
  }
  const deployerShare = {
    label: t`Deployer Share`,
    value: '0%',
    address: indexDTF.deployer,
    icon: <IconWrapper Component={LandPlot} />,
  }
  const governanceShare = {
    label: t`Governance Share`,
    value: '0%',
    icon: <IconWrapper Component={Landmark} />,
  }
  const externalRecipients: Recipient[] = []
  const nonPlatformShare = Math.max(0, 100 - effectivePlatformShare)
  const PERCENT_ADJUST = nonPlatformShare ? 100 / nonPlatformShare : 0
  const toShare = (percentage: string) =>
    PERCENT_ADJUST ? formatPercentage(Number(percentage) / PERCENT_ADJUST) : '0%'

  for (const recipient of indexDTF.feeRecipients) {
    // Deployer share - adjust from contract percentage to actual percentage
    if (recipient.address.toLowerCase() === indexDTF.deployer.toLowerCase()) {
      deployerShare.value = toShare(recipient.percentage)
    } else if (
      recipient.address.toLowerCase() === governanceTokenAddress?.toLowerCase()
    ) {
      governanceShare.value = toShare(recipient.percentage)
    } else {
      externalRecipients.push({
        label: `Other recipient ${externalRecipients.length + 1}`,
        value: toShare(recipient.percentage),
        address: recipient.address,
        icon: <IconWrapper Component={Hash} />,
      })
    }
  }

  return [
    platformShare,
    governanceShare,
    deployerShare,
    ...externalRecipients,
  ] as Recipient[]
})

// TODO: Share distribution pending subgraph work!
const FeesInfo = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const feeFloor = useAtomValue(indexDTFFeeFloorAtom)
  const feeRecipients = useAtomValue(feeRecipientsAtom)

  return (
    <InfoCard title={t`Fees & Revenue Distribution`} id="fees" className="bg-secondary">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 bg-secondary">
        <InfoCardItem
          className="bg-card rounded-3xl"
          border={false}
          icon={<IconWrapper Component={TableRowsSplit} />}
          label={t`Annualized TVL Fee`}
          value={
            indexDTF
              ? formatDtfFeePercentage(indexDTF.annualizedTvlFee, feeFloor)
              : undefined
          }
        />
        <InfoCardItem
          className="bg-card rounded-3xl"
          border={false}
          icon={<IconWrapper Component={ChartPie} />}
          label={t`Minting Fee`}
          value={
            indexDTF
              ? formatDtfFeePercentage(indexDTF.mintingFee, feeFloor)
              : undefined
          }
        />
      </div>
      <div className="bg-card rounded-3xl mt-1">
        {feeRecipients?.map((recipient, index) => (
          <InfoCardItem
            key={recipient.label}
            label={recipient.label}
            value={recipient.value}
            icon={recipient.icon}
            address={recipient.address}
            border={!!index}
          />
        ))}
      </div>
    </InfoCard>
  )
}

export default FeesInfo
