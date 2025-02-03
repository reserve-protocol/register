import { formatPercentage } from '@/utils'
import { Asterisk } from 'lucide-react'
import NextButton from '../../components/next-button'
import ToggleGroupWithCustom from '../../components/toggle-group-with-custom'
import RevenueDistributionSettings from './revenue-distribution-settings'

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

const TOGGLE_FORMS = [
  {
    title: 'Annualized TVL Fee',
    description: `A optional percentage-based fee charged by the DTF based on the
            total value of the tokens held in the contract. The platform will
            keep 50% of revenue from this fee.`,
    icon: <Asterisk size={32} strokeWidth={1.5} />,
    options: [0, 0.25, 0.5, 1, 1.5, 2],
    optionsFormatter: (option: number) => formatPercentage(option),
    fieldName: 'folioFee',
    customFieldName: 'customFolioFee',
    customLabel: '%',
    customPlaceholder: '0.00',
  },

  {
    title: 'Mint Fee',
    description: `A one-time fee deducted from the tokens a user receives when they
            mint the DTF. The platform will keep the greater of 0.15% or 50% of
            revenue from this fee.`,
    icon: <Asterisk size={32} strokeWidth={1.5} />,
    options: [0.05, 0.25, 0.5, 1, 1.5, 2],
    optionsFormatter: (option: number) => formatPercentage(option),
    fieldName: 'mintFee',
    customFieldName: 'customMintFee',
    customLabel: '%',
    customPlaceholder: '0.00',
  },
]

const RevenueDistribution = () => {
  return (
    <>
      <Description />
      <div className="flex flex-col gap-2 px-2 mb-2">
        {TOGGLE_FORMS.map((form) => (
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
