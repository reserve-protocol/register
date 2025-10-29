import { formatPercentage } from '@/utils'
import ToggleGroupWithCustom from '@/views/index-dtf/deploy/components/toggle-group-with-custom'
import { Decimal } from '@/views/index-dtf/deploy/utils/decimals'
import { Coins, Eclipse, TableColumnsSplit } from 'lucide-react'
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
      There is a minimum platform fee of 0.15%. This means that 0.15% of the fee
      set above will go to the platform and only {diff}% of the fee will be
      split amongst other recipients.
    </span>
  )
}

const FeeDistributionDescription = () => (
  <div className="px-6 pb-6 text-base">
    Define what portion of the revenue goes to the DTF's creator, the vote-lock
    DAO, or any arbitrary address (wallet or smart contract).
  </div>
)

const Description = () => (
  <div className="px-6 pb-6 text-base">
    Index DTF generate revenue by charging fees for minting and holding the DTF.
    Revenue generated from fees can be sent to the DTF's creator, the vote-lock
    DAO, or any arbitrary address (wallet or smart contract). A portion of this
    revenue will automatically be sent to the protocol based on the TVL of the
    DTF. You can see a complete list of the platform fee schedule{' '}
    <a
      href={INDEX_PROTOCOL_DOCS + '#fees-revenue'}
      target="_blank"
      rel="noreferrer"
      className="text-primary"
    >
      here
    </a>
    .
  </div>
)

const ProposeDTFRevenue = () => {
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
          title="Annualized TVL Fee"
          description="A percentage-based fee charged by the DTF based on the total value of the tokens held in the contract. The platform will keep 50% of revenue from this fee. (Min: 0.15%, Max: 10%)"
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
          title="Mint Fee"
          description="A one-time fee deducted from the tokens a user receives when they mint the DTF. The platform will keep 50% of revenue from this fee. (Min: 0.15%, Max: 5%)"
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
      </div>
      <h1 className="text-2xl font-bold text-primary my-4 ml-6">
        Fee Distribution
      </h1>
      <FeeDistributionDescription />
      <ProposeRevenueDistribution />
    </div>
  )
}

export default ProposeDTFRevenue
