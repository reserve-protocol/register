import { t } from '@lingui/macro'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { cn } from '@/lib/utils'
import { proposedRolesAtom, spellUpgradeAtom } from '../atoms'
import { ListChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'
import { spellAddressAtom } from './SpellUpgrade'

interface Props {
  className?: string
}

const SpellUpgradePreview = ({ className }: Props) => {
  const [spell, setSpell] = useAtom(spellUpgradeAtom)
  const spellContract = useAtomValue(spellAddressAtom)
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

export default SpellUpgradePreview
