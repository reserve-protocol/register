import InputWithTitle from '@/views/index-dtf/deploy/components/input-with-title'
import { Image, MousePointerClick, ShieldHalf } from 'lucide-react'

const FORMS = [
  {
    title: 'Guardian',
    description:
      'A trusted actor that can veto any proposal prior to execution.',
    icon: <ShieldHalf size={14} strokeWidth={1.5} />,
    fieldName: 'guardians',
    buttonLabel: 'Add additional guardian',
    inputLabel: 'Address',
    placeholder: '0x...',
  },
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

const ProposeDTFRoles = () => {
  return (
    <div className="px-2 mb-2">
      <div className="px-4 pb-6 text-base">
        The Reserve Index Protocol provides several roles that can improve the
        safety and experience of DTF holders and governors. These roles are
        mutable and can be changed by governance in the future.
      </div>
      <div className="flex flex-col gap-2">
        {FORMS.map((form) => (
          <InputWithTitle key={form.fieldName} {...form} />
        ))}
      </div>
    </div>
  )
}

export default ProposeDTFRoles
