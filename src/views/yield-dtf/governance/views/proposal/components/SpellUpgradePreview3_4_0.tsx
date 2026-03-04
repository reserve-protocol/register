import { t } from '@lingui/macro'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { cn } from '@/lib/utils'
import { proposedRolesAtom, spell3_4_0UpgradeAtom } from '../atoms'
import { ListChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'
import { spell3_4_0AddressAtom } from './SpellUpgrade3_4_0'

interface Props {
  className?: string
}

const SpellUpgradePreview3_4_0 = ({ className }: Props) => {
  const [spell, setSpell] = useAtom(spell3_4_0UpgradeAtom)
  const spellContract = useAtomValue(spell3_4_0AddressAtom)
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
      className={cn('border border-border rounded-xl p-6', className)}
      count={1}
      title={t`Casting 3.4.0 upgrade spell`}
    >
      <ListChangePreview
        onRevert={handleRevert}
        isNew={true}
        value={spell === 'spell1' ? t`Spell 1` : t`Spell 2`}
        className="mt-4"
      />
    </PreviewBox>
  )
}

export default SpellUpgradePreview3_4_0
