import dtfStakingVaultAbi from '@/abis/dtf-index-staking-vault'
import {
  folioVersionAtom,
  indexDTFAtom,
  indexDTFFeeAtom,
} from '@/state/dtf/atoms'
import { IndexDTF } from '@/types'
import { formatPercentage, isLoaded } from '@/utils'
import { getFeePercentAdjust, isDisplayablePlatformFee } from '@/utils/fees'
import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { useLingui } from '@lingui/react/macro'
import {
  useIndexDtfIdentity,
  useIndexDtfImmutableFeeRecipients,
  useIndexDtfSelfFee,
  type IndexDtfFeeRecipient,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import {
  ChartPie,
  Coins,
  Hash,
  Landmark,
  LandPlot,
  Lock,
  TableRowsSplit,
  TrainTrack,
} from 'lucide-react'
import { useMemo } from 'react'
import { Address, formatEther } from 'viem'
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
// Folio 6.0: holders keep `selfFee` of the non-platform fees before the recipient tables split the rest.
type FolioV6Fees = {
  selfFee: number
  immutableRecipients: readonly IndexDtfFeeRecipient[]
}

export const getFeeRecipients = (
  indexDTF: IndexDTF | undefined,
  platformFee: number | undefined,
  tokenJar: Address | undefined,
  v6?: FolioV6Fees
): Recipient[] | undefined => {
  if (!indexDTF || platformFee === undefined) return undefined
  // A fee outside [0, 100) has no real share-of-total split — signal indeterminate, never fabricate.
  if (!isDisplayablePlatformFee(platformFee)) return undefined

  const platformShare: Recipient = {
    label: msg`Fixed Platform Share`,
    value: formatPercentage(platformFee),
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
  const recipientFraction = 1 - (v6?.selfFee ?? 0)
  const PERCENT_ADJUST = getFeePercentAdjust(platformFee) / recipientFraction

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

  if (!v6) {
    return [platformShare, governanceShare, deployerShare, ...externalRecipients]
  }

  const holderShare: Recipient = {
    label: msg`Holder Share`,
    value: formatPercentage((100 - platformFee) * v6.selfFee),
    icon: <IconWrapper Component={Coins} />,
    testId: 'settings-fee-holders',
  }
  const permanentRecipients = v6.immutableRecipients.map(
    ({ recipient, portion }, index): Recipient => ({
      label: msg`Permanent recipient ${index + 1}`,
      value: formatPercentage(
        (Number(formatEther(portion)) * 100) / PERCENT_ADJUST
      ),
      address: recipient,
      icon: <IconWrapper Component={Lock} />,
      testId: `settings-fee-permanent-${index + 1}`,
    })
  )

  return [
    platformShare,
    holderShare,
    governanceShare,
    deployerShare,
    ...externalRecipients,
    ...permanentRecipients,
  ]
}

const useFolioV6Fees = (): { v6?: FolioV6Fees; isLoading: boolean } => {
  const versionState = useAtomValue(folioVersionAtom)
  const identity = useIndexDtfIdentity()
  const isV6 = versionState.status === 'ready' && versionState.major === 6
  const params = isV6 && identity.address ? identity : undefined
  const { data: selfFee } = useIndexDtfSelfFee(params)
  const { data: immutableRecipients } =
    useIndexDtfImmutableFeeRecipients(params)

  if (!isV6) return { isLoading: false }
  if (!selfFee || !immutableRecipients) return { isLoading: true }

  return {
    isLoading: false,
    v6: { selfFee: Number(selfFee.formatted), immutableRecipients },
  }
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

  const { v6, isLoading: isV6Loading } = useFolioV6Fees()

  const feeRecipients = useMemo(
    () =>
      isV6Loading
        ? undefined
        : getFeeRecipients(
            indexDTF,
            isLoaded(platformFee) ? platformFee : undefined,
            tokenJar,
            v6
          ),
    [indexDTF, platformFee, tokenJar, v6, isV6Loading]
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
