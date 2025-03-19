import { useFormContext } from 'react-hook-form'
import { GovernanceInputs } from '../schema'
import { Image, MousePointerClick } from 'lucide-react'
import InputWithTitle from '@/views/index-dtf/deploy/components/input-with-title'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    The Reserve Index Protocol provides several roles that can improve the
    safety and experience of DTF holders and governors. These roles are mutable
    and can be changed by governance in the future.
  </div>
)

const FORMS = [
  {
    title: 'Brand Manager',
    description: (
      <span>
        A trusted actor that can manage social links and appearances of the DTF
        in the Register UI. This gives brand manager ability to update things on{' '}
        <a
          href="https://reserve.org"
          target="_blank"
          rel="noreferrer"
          className="text-primary"
        >
          Reserve.org
        </a>{' '}
        but no protocol level controls.
      </span>
    ),
    icon: <Image size={14} strokeWidth={1.5} />,
    fieldName: 'brandManagers',
    buttonLabel: 'Add additional brand manager',
    inputLabel: 'Address',
    placeholder: '0x...',
  },
  {
    title: 'Auction launcher',
    description:
      'A trusted actor responsible for launching auctions that are approved by governance.',
    icon: <MousePointerClick size={14} strokeWidth={1.5} />,
    fieldName: 'auctionLaunchers',
    buttonLabel: 'Add additional auction launcher',
    inputLabel: 'Address',
    placeholder: '0x...',
  },
]

const Roles = () => {
  return (
    <>
      <Description />
      <div className="px-2 mb-2">
        <div className="flex flex-col gap-2">
          {FORMS.map((form) => (
            <InputWithTitle key={form.fieldName} {...form} />
          ))}
        </div>
      </div>
    </>
  )
}

export default Roles
