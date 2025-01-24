import { Asterisk } from 'lucide-react'
import BasicInput from '../../components/basic-input'
import AdditionalRevenueRecipients from './additional-revenue-recipients'
import { useAtomValue } from 'jotai'
import { selectedGovernanceOptionAtom } from '../../atoms'

const SETTINGS = [
  {
    title: 'Platform',
    description:
      'Percentage of fee revenue sent to the protocol; cannot be changed by governance.',
    field: 'fixedPlatformFee',
  },
  {
    title: 'Creator',
    description: 'Percentage of fee revenue sent to the creator of the DTF.',
    field: 'deployerShare',
  },
  {
    title: 'Governance',
    description:
      'Percentage of fee revenue sent to the vote-lock DAO governing the DTF.',
    field: 'governanceShare',
  },
]

const RevenueDistributionSettings = () => {
  const selectedGovOption = useAtomValue(selectedGovernanceOptionAtom)

  const settings = SETTINGS.filter(
    ({ field }) =>
      field !== 'governanceShare' ||
      selectedGovOption !== 'governanceWalletAddress'
  )

  return (
    <div className="flex flex-col gap-2 mx-2 mb-3">
      <div className="flex flex-col gap-2">
        {settings.map(({ title, description, field }) => (
          <div
            className="w-full rounded-xl flex items-center gap-2 justify-between p-4 bg-muted/70"
            key={title}
          >
            <div className="flex items-center gap-2">
              <div className="bg-muted-foreground/10 rounded-full">
                <Asterisk size={32} strokeWidth={1.5} />
              </div>

              <div className="flex flex-col">
                <div className="text-base font-bold">{title}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {description}
                </div>
              </div>
            </div>
            <BasicInput
              className="max-w-32"
              fieldName={field}
              label="%"
              disabled={field === 'fixedPlatformFee'}
              placeholder="0"
              defaultValue={0}
            />
          </div>
        ))}
      </div>
      <AdditionalRevenueRecipients />
    </div>
  )
}

export default RevenueDistributionSettings
