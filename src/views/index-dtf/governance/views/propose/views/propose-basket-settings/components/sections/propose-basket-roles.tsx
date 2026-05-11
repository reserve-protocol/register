import InputWithTitle from '@/views/index-dtf/deploy/components/input-with-title'
import { useAtomValue } from 'jotai'
import { MousePointerClick, ShieldHalf } from 'lucide-react'
import { optimisticProposerRoleStateAtom } from '../../atoms'

const ProposeBasketRoles = () => {
  const { isSupported } = useAtomValue(optimisticProposerRoleStateAtom)

  return (
    <div className="px-2 mb-2">
      <div className="px-4 pb-6 text-base">
        The basket governance provides a Guardian role that can improve the
        safety of DTF holders and governors. Guardians have the ability to veto 
        any basket proposal prior to execution. This role is mutable and can be changed 
        by governance in the future.
      </div>
      <div className="flex flex-col gap-2">
        <InputWithTitle 
          title="Guardian"
          description="A trusted actor that can veto any basket proposal prior to execution."
          icon={<ShieldHalf size={14} strokeWidth={1.5} />}
          fieldName="guardians"
          buttonLabel="Add additional guardian"
          inputLabel="Address"
          placeholder="0x..."
        />
        {isSupported && (
          <InputWithTitle
            title="Optimistic Proposer"
            description="A trusted actor that can submit optimistic basket proposals for allowlisted actions."
            icon={<MousePointerClick size={14} strokeWidth={1.5} />}
            fieldName="optimisticProposers"
            buttonLabel="Add additional optimistic proposer"
            inputLabel="Address"
            placeholder="0x..."
          />
        )}
      </div>
    </div>
  )
}

export default ProposeBasketRoles
