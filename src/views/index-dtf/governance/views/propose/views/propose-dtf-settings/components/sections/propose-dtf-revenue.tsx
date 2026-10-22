import { formatPercentage, shortenAddress } from '@/utils'
import ToggleGroupWithCustom from '@/views/index-dtf/deploy/components/toggle-group-with-custom'
import { Decimal } from '@/views/index-dtf/deploy/utils/decimals'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Coins, Eclipse, Lock, TableColumnsSplit } from 'lucide-react'
import { formatEther } from 'viem'
import {
  immutableFeeRecipientsAtom,
  isFolioV6Atom,
  mutableFeeFractionAtom,
} from '../../atoms'
import { useFormContext } from 'react-hook-form'
import ProposeRevenueDistribution from './propose-revenue-distribution'
import { INDEX_PROTOCOL_DOCS } from '@/utils/constants'

const AnnualizedFeeWarningMessage = ({
  fieldName,
}: {
  fieldName: 'folioFee' | 'mintFee'
}) => {
  const { watch } = useFormContext()
  const fee = watch(fieldName)
  const diff = new Decimal(fee).minus(new Decimal(0.15)).toDisplayString()

  return (
    <span>
      <Trans>
        There is a minimum platform fee of 0.15%. This means that 0.15% of the
        fee set above will go to the platform and only {diff}% of the fee will
        be split amongst other recipients.
      </Trans>
    </span>
  )
}

const FeeDistributionDescription = () => (
  <div className="px-6 pb-6 text-base">
    <Trans>
      Define what portion of the revenue goes to the DTF's creator, the
      vote-lock DAO, or any arbitrary address (wallet or smart contract).
    </Trans>
  </div>
)

const Description = () => (
  <div className="px-6 pb-6 text-base">
    <Trans>
      Index DTF generate revenue by charging fees for minting and holding the
      DTF. Revenue generated from fees can be sent to the DTF's creator, the
      vote-lock DAO, or any arbitrary address (wallet or smart contract). A
      portion of this revenue will automatically be sent to the protocol based
      on the TVL of the DTF. You can see a complete list of the platform fee
      schedule{' '}
      <a
        href={INDEX_PROTOCOL_DOCS + '#fees-revenue'}
        target="_blank"
        rel="noreferrer"
        className="text-primary"
      >
        here
      </a>
      .
    </Trans>
  </div>
)

const ProposeSelfFee = () => {
  const { t } = useLingui()
  const isV6 = useAtomValue(isFolioV6Atom)

  if (!isV6) return null

  return (
    <ToggleGroupWithCustom
      title={t`Holder share`}
      description={t`Portion of the non-platform fees kept inside the DTF for its holders, taken before the recipients below are paid.`}
      icon={<Coins size={14} strokeWidth={1.5} />}
      options={[0, 10, 25, 50]}
      optionsFormatter={(option: number) => formatPercentage(option)}
      fieldName="selfFee"
      customLabel="%"
      customPlaceholder="0.00"
      inputProps={{ step: 1, min: 0, max: 100 }}
    />
  )
}

// Folio 6.0 immutable recipients are fixed at deployment; the editable split covers only what they leave.
const ImmutableRecipientsNote = () => {
  const recipients = useAtomValue(immutableFeeRecipientsAtom)
  const mutableFraction = useAtomValue(mutableFeeFractionAtom)

  if (!recipients?.length || mutableFraction === undefined) return null

  const remaining = formatPercentage(mutableFraction * 100)

  return (
    <div
      className="mx-2 mb-2 rounded-xl bg-muted/70 p-4 text-sm flex flex-col gap-2"
      data-testid="settings-immutable-recipients"
    >
      <div className="flex items-center gap-2 font-bold">
        <Lock size={14} />
        <Trans>Permanent recipients</Trans>
      </div>
      {recipients.map(({ recipient, portion }) => (
        <div key={recipient} className="flex justify-between">
          <span>{shortenAddress(recipient)}</span>
          <span>{formatPercentage(Number(formatEther(portion)) * 100)}</span>
        </div>
      ))}
      <span className="text-legend">
        <Trans>
          Set at deployment and can't be changed. The split below applies to
          the remaining {remaining} of recipient fees.
        </Trans>
      </span>
    </div>
  )
}

const RecipientPoolNote = () => {
  const isV6 = useAtomValue(isFolioV6Atom)

  if (!isV6) return null

  return (
    <div className="px-6 pb-4 text-sm text-legend" data-testid="settings-recipient-pool-note">
      <Trans>
        On this DTF the shares below split the recipient pool: the holder share
        is kept first, and permanent recipients take their fixed part of what
        remains.
      </Trans>
    </div>
  )
}

const ProposeDTFRevenue = () => {
  const { t } = useLingui()
  const { watch } = useFormContext()
  const folioFee = watch('folioFee')
  const mintFee = watch('mintFee')
  const showWarningFolioFee = Number(folioFee) >= 0.15 && Number(folioFee) < 0.3
  const showWarningMintFee = Number(mintFee) >= 0.15 && Number(mintFee) < 0.3

  return (
    <div className="">
      <Description />
      <div className="flex flex-col gap-2 px-2 mb-2">
        <ToggleGroupWithCustom
          title={t`Annualized TVL Fee`}
          description={t`A percentage-based fee charged by the DTF based on the total value of the tokens held in the contract. The platform will keep 50% of revenue from this fee. (Min: 0.15%, Max: 10%)`}
          icon={<TableColumnsSplit size={14} strokeWidth={1.5} />}
          options={[0.15, 0.3, 0.5, 1, 2]}
          optionsFormatter={(option: number) => formatPercentage(option)}
          fieldName="folioFee"
          customLabel="%"
          customPlaceholder="0.00"
          warningMessage={
            showWarningFolioFee ? (
              <AnnualizedFeeWarningMessage fieldName="folioFee" />
            ) : null
          }
          inputProps={{ step: 0.05, min: 0.15, max: 10 }}
        />
        <ToggleGroupWithCustom
          title={t`Mint Fee`}
          description={t`A one-time fee deducted from the tokens a user receives when they mint the DTF. The platform will keep 50% of revenue from this fee. (Min: 0.15%, Max: 5%)`}
          icon={<Eclipse size={14} strokeWidth={1.5} />}
          options={[0.15, 0.3, 0.5, 1, 2]}
          optionsFormatter={(option: number) => formatPercentage(option)}
          fieldName="mintFee"
          customLabel="%"
          customPlaceholder="0.00"
          warningMessage={
            showWarningMintFee ? (
              <AnnualizedFeeWarningMessage fieldName="mintFee" />
            ) : null
          }
          inputProps={{ step: 0.05, min: 0.15, max: 10 }}
        />
        <ProposeSelfFee />
      </div>
      <h1 className="text-2xl font-bold text-primary my-4 ml-6">
        <Trans>Fee Distribution</Trans>
      </h1>
      <FeeDistributionDescription />
      <RecipientPoolNote />
      <ImmutableRecipientsNote />
      <ProposeRevenueDistribution />
    </div>
  )
}

export default ProposeDTFRevenue
