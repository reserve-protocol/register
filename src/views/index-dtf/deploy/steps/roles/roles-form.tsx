import { Asterisk } from 'lucide-react'
import InputWithTitle from '../../components/input-with-title'

const FORMS = [
  {
    title: 'Guardian',
    description:
      'How to distribute the revenue from this fee is defines in the revenue distribution section.',
    icon: <Asterisk size={32} strokeWidth={1.5} />,
    fieldName: 'guardianAddress',
    label: 'Address',
    placeholder: '0x...',
  },
  {
    title: 'Voting Quorum',
    description:
      'Amount of time until auctions can be permissionlessly executed, bypassing the auction launcher',
    icon: <Asterisk size={32} strokeWidth={1.5} />,
    fieldName: 'brandManagerAddress',
    label: 'Address',
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
