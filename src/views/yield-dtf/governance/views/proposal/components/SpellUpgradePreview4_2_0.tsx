import { cn } from '@/lib/utils'
import { t } from '@lingui/macro'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { proposedRolesAtom, spell4_2_0UpgradeAtom } from '../atoms'
import { ListChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'
import { spell4_2_0AddressAtom } from './SpellUpgrade4_2_0'

interface Props {
  className?: string
}

const SpellUpgradePreview4_2_0 = ({ className }: Props) => {
  const [spell, setSpell] = useAtom(spell4_2_0UpgradeAtom)
  const spellContract = useAtomValue(spell4_2_0AddressAtom)
  const setProposedRoles = useSetAtom(proposedRolesAtom)

  if (spell === 'none') return null

  const handleRevert = () => {
    setSpell('none')
    setProposedRoles(({ owners, ...rest }) => ({
      ...rest,
      owners: [...owners.filter((owner) => owner !== spellContract)],
    }))
  }

  return (
    <PreviewBox
      count={1}
      title={t`Casting 4.2.0 upgrade spell`}
      className={cn('border border-border rounded-xl p-6', className)}
    >
      <ListChangePreview
        onRevert={handleRevert}
        isNew={true}
        value={t`Spell`}
        className='mt-4'
      />
    </PreviewBox>
  )
}

export default SpellUpgradePreview4_2_0
