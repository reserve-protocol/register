import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatPercentage } from '@/utils'
import { FIXED_PLATFORM_FEE } from '@/utils/constants'
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

type Recipient = {
  label: string
  value: string
  address?: string
  icon: React.ReactNode
}

const feeRecipientsAtom = atom((get) => {
  const indexDTF = get(indexDTFAtom)

  if (!indexDTF) return undefined

  const platformShare = {
    label: t`Fixed Platform Share`,
    value: `${FIXED_PLATFORM_FEE}%`,
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
  const PERCENT_ADJUST = 100 / FIXED_PLATFORM_FEE

  for (const recipient of indexDTF.feeRecipients) {
    // Deployer share
    if (recipient.address.toLowerCase() === indexDTF.deployer.toLowerCase()) {
      deployerShare.value = formatPercentage(
        Number(recipient.percentage) / PERCENT_ADJUST
      )
    } else if (
      recipient.address.toLowerCase() === indexDTF.stToken?.id.toLowerCase()
    ) {
      governanceShare.value = formatPercentage(
        Number(recipient.percentage) / PERCENT_ADJUST
      )
    } else {
      externalRecipients.push({
        label: `Other recipient ${externalRecipients.length + 1}`,
        value: formatPercentage(Number(recipient.percentage) / PERCENT_ADJUST),
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
  const feeRecipients = useAtomValue(feeRecipientsAtom)

  return (
    <InfoCard title={t`Fees & Revenue Distribution`} className="bg-secondary">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 bg-secondary">
        <InfoCardItem
          className="bg-card rounded-3xl"
          border={false}
          icon={<IconWrapper Component={TableRowsSplit} />}
          label={t`Annualized TVL Fee`}
          value={
            indexDTF
              ? formatPercentage(indexDTF?.annualizedTvlFee * 100)
              : undefined
          }
        />
        <InfoCardItem
          className="bg-card rounded-3xl"
          border={false}
          icon={<IconWrapper Component={ChartPie} />}
          label={t`Minting Fee`}
          value={
            indexDTF ? formatPercentage(indexDTF?.mintingFee * 100) : undefined
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
