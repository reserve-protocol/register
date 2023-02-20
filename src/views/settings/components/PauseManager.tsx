import { t } from '@lingui/macro'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import {
  accountRoleAtom,
  addTransactionAtom,
  rTokenManagersAtom,
  rTokenStatusAtom,
} from 'state/atoms'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import RolesView from './RolesView'
import SettingItem from './SettingItem'

/**
 * View: Settings > Actions for an Rtoken pauser (pause/unpause)
 */
const PauseManager = () => {
  const rToken = useRToken()
  const accountRole = useAtomValue(accountRoleAtom)
  const { pausers } = useAtomValue(rTokenManagersAtom)
  const { paused: isPaused } = useAtomValue(rTokenStatusAtom)
  const addTransaction = useSetAtom(addTransactionAtom)
  const pauseActionLabel = isPaused ? t`Unpause` : t`Pause`
  const [txId, setTx] = useState('')
  const tx = useTransaction(txId)

  useEffect(() => {
    if (
      tx?.status === TRANSACTION_STATUS.CONFIRMED ||
      tx?.status === TRANSACTION_STATUS.REJECTED
    ) {
      setTx('')
    }
  }, [tx?.status])

  const handlePause = () => {
    if (rToken?.main) {
      const id = uuid()
      setTx(id)
      addTransaction([
        {
          id,
          description: isPaused
            ? t`Unpause ${rToken?.symbol}`
            : t`Pause ${rToken?.symbol}`,
          status: TRANSACTION_STATUS.PENDING,
          value: '0',
          call: {
            abi: 'main',
            address: rToken?.main || '',
            method: isPaused ? 'unpause' : 'pause',
            args: [],
          },
        },
      ])
    }
  }

  return (
    <>
      <SettingItem
        title={t`Pause state`}
        subtitle={t`Current status:`}
        value={isPaused ? t`Paused` : t`Unpaused`}
        icon="danger"
        mb={3}
      />
      <SettingItem
        title="RToken pauser"
        subtitle={t`Role held by:`}
        value={<RolesView roles={pausers} />}
        action={accountRole.pauser || accountRole.owner ? pauseActionLabel : ''}
        onAction={handlePause}
        loading={!!txId}
        actionVariant="danger"
      />
    </>
  )
}

export default PauseManager
