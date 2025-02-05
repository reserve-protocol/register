import { formatPercentage } from '@/utils'
import { Asterisk } from 'lucide-react'
import NextButton from '../../components/next-button'
import ToggleGroupWithCustom from '../../components/toggle-group-with-custom'
import RevenueDistributionSettings from './revenue-distribution-settings'
import { useFormContext } from 'react-hook-form'
import { Decimal } from '../../utils/decimals'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    Define how much the Index DTF will charge token holders to mint the DTF and
    to hold the DTF over time. A portion of these fees will be sent directly to
    the platform.
  </div>
)

const FeeDistributionDescription = () => (
  <div className="px-6 pb-6 text-base">
    Define what portion of the revenue goes to the DTF's creator, the vote-lock
    DAO, or any arbitrary address (wallet or smart contract).
  </div>
)

const AnnualizedFeeWarningMessage = () => {
  const { watch } = useFormContext()
  const folioFee = watch('folioFee')
  const diff = new Decimal(folioFee).minus(new Decimal(0.15)).toDisplayString()

  return (
    <span>
      There is a minimum platform fee of 0.15%. This means that 0.15% of the fee
      set above will go to the platform and only {diff}% of the fee will be
      split amongst other recipients.
    </span>
  )
}

const RevenueDistribution = () => {
  const { watch } = useFormContext()
  const folioFee = watch('folioFee')
  const showWarning = Number(folioFee) >= 0.15 && Number(folioFee) <= 0.3

  const toggleForms = [
    {
      title: 'Annualized TVL Fee',
      description: `An optional percentage-based fee charged by the DTF based on the
              total value of the tokens held in the contract. The platform will
              keep 50% of revenue from this fee.`,
      icon: <Asterisk size={32} strokeWidth={1.5} />,
      options: [0.15, 0.3, 0.5, 1, 2],
      optionsFormatter: (option: number) => formatPercentage(option),
      fieldName: 'folioFee',
      customLabel: '%',
      customPlaceholder: '0.00',
      warningMessage: showWarning ? <AnnualizedFeeWarningMessage /> : null,
    },

    {
      title: 'Mint Fee',
      description: `A one-time fee deducted from the tokens a user receives when they
              mint the DTF. The platform will keep the greater of 0.15% or 50% of
              revenue from this fee.`,
      icon: <Asterisk size={32} strokeWidth={1.5} />,
      options: [0.15, 0.3, 0.5, 1, 2],
      optionsFormatter: (option: number) => formatPercentage(option),
      fieldName: 'mintFee',
      customLabel: '%',
      customPlaceholder: '0.00',
    },
  ]

  return (
    <>
      <Description />
      <div className="flex flex-col gap-2 px-2 mb-2">
        {toggleForms.map((form) => (
          <ToggleGroupWithCustom key={form.fieldName} {...form} />
        ))}
      </div>
      <h1 className="text-2xl font-bold text-primary my-4 ml-6">
        Fee Distribution
      </h1>
      <FeeDistributionDescription />
      <RevenueDistributionSettings />
      <NextButton />
    </>
  )
}

export default RevenueDistribution
