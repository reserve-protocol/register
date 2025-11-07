import { t } from '@lingui/macro'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { BoxProps } from 'theme-ui'
import { proposedRolesAtom, spell3_4_0UpgradeAtom } from '../atoms'
import { ListChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'
import { spell3_4_0AddressAtom } from './SpellUpgrade3_4_0'

const SpellUpgradePreview3_4_0 = (props: BoxProps) => {
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
      variant="layout.borderBox"
      count={1}
      title={t`Casting 3.4.0 upgrade spell`}
      {...props}
    >
      <ListChangePreview
        onRevert={handleRevert}
        isNew={true}
        value={spell === 'spell1' ? t`Spell 1` : t`Spell 2`}
        mt={3}
      />
    </PreviewBox>
  )
}

export default SpellUpgradePreview3_4_0
