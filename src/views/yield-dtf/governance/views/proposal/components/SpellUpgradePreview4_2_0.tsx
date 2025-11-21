import { t } from '@lingui/macro'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { BoxProps } from 'theme-ui'
import { proposedRolesAtom, spell4_2_0UpgradeAtom } from '../atoms'
import { ListChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'
import { spell4_2_0AddressAtom } from './SpellUpgrade4_2_0'

const SpellUpgradePreview4_2_0 = (props: BoxProps) => {
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
      variant="layout.borderBox"
      count={1}
      title={t`Casting 4.2.0 upgrade spell`}
      {...props}
    >
      <ListChangePreview
        onRevert={handleRevert}
        isNew={true}
        value={t`Spell`}
        mt={3}
      />
    </PreviewBox>
  )
}

export default SpellUpgradePreview4_2_0
