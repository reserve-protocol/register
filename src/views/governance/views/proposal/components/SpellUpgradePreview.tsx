import { t } from '@lingui/macro'
import { useAtom } from 'jotai'
import { BoxProps } from 'theme-ui'
import { spellUpgradeAtom } from '../atoms'
import { ListChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'

const SpellUpgradePreview = (props: BoxProps) => {
  const [spell, setSpell] = useAtom(spellUpgradeAtom)

  if (spell === 'none') return null

  const handleRevert = () => {
    setSpell('none')
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
