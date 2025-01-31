import { Asterisk } from 'lucide-react'
import InputWithTitle from '../../components/input-with-title'

const FORMS = [
  {
    title: 'Guardian',
    description:
      'A trusted actor that can veto any proposal prior to execution.',
    icon: <Asterisk size={32} strokeWidth={1.5} />,
    fieldName: 'guardians',
    buttonLabel: 'Add additional guardian',
    inputLabel: 'Address',
    placeholder: '0x...',
  },
  {
    title: 'Brand Manager',
    description:
      'A trusted actor that can manage social links and appearances of the DTF in the Register UI.',
    icon: <Asterisk size={32} strokeWidth={1.5} />,
    fieldName: 'brandManagers',
    buttonLabel: 'Add additional brand manager',
    inputLabel: 'Address',
    placeholder: '0x...',
  },
  {
    title: 'Auction launcher',
    description:
      'A trusted actor responsible for launching auctions that are approved by governance.',
    icon: <Asterisk size={32} strokeWidth={1.5} />,
    fieldName: 'auctionLaunchers',
    buttonLabel: 'Add additional auction launcher',
    inputLabel: 'Address',
    placeholder: '0x...',
  },
]

const RolesForm = () => {
  return (
    <div className="px-2 mb-2">
      <div className="flex flex-col gap-2">
        {FORMS.map((form) => (
          <InputWithTitle key={form.fieldName} {...form} />
        ))}
      </div>
    </div>
  )
}

export default RolesForm
