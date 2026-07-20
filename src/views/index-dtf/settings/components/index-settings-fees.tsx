import dtfStakingVaultAbi from '@/abis/dtf-index-staking-vault'
import { indexDTFAtom, indexDTFFeeAtom } from '@/state/dtf/atoms'
import { IndexDTF } from '@/types'
import { formatPercentage, isLoaded } from '@/utils'
import { getFeePercentAdjust, isDisplayablePlatformFee } from '@/utils/fees'
import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import {
  ChartPie,
  Hash,
  Landmark,
  LandPlot,
  TableRowsSplit,
  TrainTrack,
} from 'lucide-react'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'
import { IconWrapper, InfoCard, InfoCardItem } from './settings-info-card'

type Recipient = {
  label: MessageDescriptor
  value: string
  address?: string
  icon: React.ReactNode
  testId?: string
}

// WHY: On the new StakingVault, governance fees are routed to the vault's
// tokenJar() (which converts them into the underlying token) rather than to the
// stToken itself. Without recognizing it, that recipient shows up as an
// unrelated "Other recipient" instead of folding into the Governance Share.
export const getFeeRecipients = (
  indexDTF: IndexDTF | undefined,
  platformFee: number | undefined,
  tokenJar: Address | undefined
): Recipient[] | undefined => {
  if (!indexDTF || platformFee === undefined) return undefined
  // A degenerate/invalid platform fee (>= 100, negative, non-finite) can't yield
  // a real share-of-total split — signal indeterminate so the caller renders
  // "Unavailable" instead of a fabricated allocation (B2).
  if (!isDisplayablePlatformFee(platformFee)) return undefined

  const platformShare: Recipient = {
    label: msg`Fixed Platform Share`,
    value: `${platformFee}%`,
    icon: <IconWrapper Component={TrainTrack} />,
    testId: 'settings-fee-platform',
  }
  const deployerShare: Recipient = {
    label: msg`Deployer Share`,
    value: '0%',
    address: indexDTF.deployer,
    icon: <IconWrapper Component={LandPlot} />,
    testId: 'settings-fee-deployer',
  }
  const governanceShare: Recipient = {
    label: msg`Governance Share`,
    value: '0%',
    icon: <IconWrapper Component={Landmark} />,
    testId: 'settings-fee-governance',
  }
  const externalRecipients: Recipient[] = []
  const PERCENT_ADJUST = getFeePercentAdjust(platformFee)

  const deployer = indexDTF.deployer.toLowerCase()
  const governanceRecipients = new Set(
    [indexDTF.stToken?.id, tokenJar]
      .filter(Boolean)
      .map((address) => address!.toLowerCase())
  )

  for (const recipient of indexDTF.feeRecipients) {
    const address = recipient.address.toLowerCase()
    // Adjust from contract percentage to actual percentage
    const share = formatPercentage(Number(recipient.percentage) / PERCENT_ADJUST)

    if (address === deployer) {
      deployerShare.value = share
    } else if (governanceRecipients.has(address)) {
      governanceShare.value = share
    } else {
      externalRecipients.push({
        label: msg`Other recipient ${externalRecipients.length + 1}`,
        value: share,
        address: recipient.address,
        icon: <IconWrapper Component={Hash} />,
        testId: `settings-fee-other-${externalRecipients.length + 1}`,
      })
    }
  }

  return [platformShare, governanceShare, deployerShare, ...externalRecipients]
}

// TODO: Share distribution pending subgraph work!
const FeesInfo = () => {
  const { t } = useLingui()
  const indexDTF = useAtomValue(indexDTFAtom)
  const platformFee = useAtomValue(indexDTFFeeAtom)

  const { data: tokenJar } = useReadContract({
    abi: dtfStakingVaultAbi,
    address: indexDTF?.stToken?.id,
    functionName: 'tokenJar',
    chainId: indexDTF?.chainId,
    query: {
      enabled: Boolean(indexDTF?.stToken),
    },
  })

  const feeRecipients = useMemo(
    () =>
      getFeeRecipients(
        indexDTF,
        isLoaded(platformFee) ? platformFee : undefined,
        tokenJar
      ),
    [indexDTF, platformFee, tokenJar]
  )

  return (
    <InfoCard
      title={t`Fees & Revenue Distribution`}
      id="fees"
      className="bg-secondary"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 bg-secondary">
        <InfoCardItem
          className="bg-card rounded-3xl"
          border={false}
          icon={<IconWrapper Component={TableRowsSplit} />}
          label={t`Annualized TVL Fee`}
          testId="settings-fee-annualized"
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
          testId="settings-fee-minting"
          value={
            indexDTF ? formatPercentage(indexDTF?.mintingFee * 100) : undefined
          }
        />
      </div>
      <div className="bg-card rounded-3xl mt-1">
        {platformFee === 'unavailable' ||
        (isLoaded(platformFee) && !isDisplayablePlatformFee(platformFee)) ? (
          <InfoCardItem
            label={t`Revenue Distribution`}
            value={t`Unavailable`}
            icon={<IconWrapper Component={TrainTrack} />}
            border={false}
            testId="settings-fee-unavailable"
          />
        ) : (
          feeRecipients?.map((recipient, index) => (
            <InfoCardItem
              key={recipient.address ?? index}
              label={t(recipient.label)}
              value={recipient.value}
              icon={recipient.icon}
              address={recipient.address}
              border={!!index}
              testId={recipient.testId}
            />
          ))
        )}
      </div>
    </InfoCard>
  )
}

export default FeesInfo
