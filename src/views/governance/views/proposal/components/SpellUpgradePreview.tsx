import { t } from '@lingui/macro'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { BoxProps } from 'theme-ui'
import { proposedRolesAtom, spellUpgradeAtom } from '../atoms'
import { ListChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'
import { spellAddressAtom } from './SpellUpgrade'

const SpellUpgradePreview = (props: BoxProps) => {
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

export default SpellUpgradePreview
