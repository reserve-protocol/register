import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { accountRoleAtom, rTokenStatusAtom } from 'state/atoms'
import { RTOKEN_STATUS } from 'utils/constants'
import SettingItem from './SettingItem'

const FreezeManager = () => {
  const accountRole = useAtomValue(accountRoleAtom)
  const rTokenStatus = useAtomValue(rTokenStatusAtom)
  const isFrozen = rTokenStatus === RTOKEN_STATUS.FROZEN
  const [tx, setTx] = useState('')
  const freezeActionLabel = isFrozen ? t`Unfreeze` : t`Freeze`
  const longFreezeActionLabel = isFrozen ? t`Unfreeze` : t`Long Freeze`

  const handleFreeze = () => {}

  const handleLongFreeze = () => {}

  return (
    <>
      <SettingItem
        title={isFrozen ? t`RToken is frozen` : t`RToken is not frozen`}
        subtitle={t`Current status:`}
        value={isFrozen ? t`Frozen` : t`Not frozen`}
        icon="freeze"
        mb={3}
      />
      <SettingItem
        title={t`Short Freeze`}
        subtitle={t`Role held by:`}
        value="0xfb...0344"
        action={
          accountRole.shortFreezer || accountRole.owner ? freezeActionLabel : ''
        }
        onAction={handleFreeze}
        actionVariant="danger"
        loading={!!tx}
        mb={3}
      />
      <SettingItem
        title={t`Long Freeze`}
        subtitle={t`Role held by:`}
        value="0xfb...0344"
        action={
          accountRole.longFreezer || accountRole.owner
            ? longFreezeActionLabel
            : ''
        }
        onAction={handleLongFreeze}
        actionVariant="danger"
        loading={!!tx}
      />
    </>
  )
}

export default FreezeManager
