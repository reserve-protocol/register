import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { accountRoleAtom, rTokenStatusAtom } from 'state/atoms'
import { RTOKEN_STATUS } from 'utils/constants'
import SettingItem from './SettingItem'

const PauseManager = () => {
  const accountRole = useAtomValue(accountRoleAtom)
  const rTokenStatus = useAtomValue(rTokenStatusAtom)
  const isPaused = rTokenStatus === RTOKEN_STATUS.PAUSED
  const pauseActionLabel = isPaused ? t`Unpause` : t`Pause`
  const [tx, setTx] = useState('')

  const handlePause = () => {}

  // const handleUnpause = () => {
  //   if (rToken?.main) {
  //     const txId = uuid()
  //     setUnpausing(txId)
  //     addTransaction([
  //       {
  //         id: txId,
  //         description: t`Unpause ${rToken?.symbol}`,
  //         status: TRANSACTION_STATUS.PENDING,
  //         value: '0',
  //         call: {
  //           abi: 'main',
  //           address: rToken?.main || '',
  //           method: 'unpause',
  //           args: [],
  //         },
  //       },
  //     ])
  //   }
  // }

  //   <LoadingButton
  //   loading={!!unpausing}
  //   text={t`Unpause`}
  //   onClick={handleUnpause}
  //   variant={!unpausing ? 'primary' : 'accent'}
  //   sx={{ ...smallButton }}
  //   ml="auto"
  // />

  return (
    <>
      <SettingItem
        title={isPaused ? t`RToken is paused` : t`RToken is not paused`}
        subtitle={t`Current status:`}
        value={isPaused ? t`Paused` : t`Unpaused`}
        icon="danger"
        mb={3}
      />
      <SettingItem
        title="RToken pauser"
        subtitle={t`Role held by:`}
        value="0xfb...0344"
        action={accountRole.pauser || accountRole.owner ? pauseActionLabel : ''}
        onAction={handlePause}
        loading={!!tx}
        actionVariant="danger"
      />
    </>
  )
}

export default PauseManager
