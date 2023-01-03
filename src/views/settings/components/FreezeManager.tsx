import { t } from '@lingui/macro'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import {
  accountRoleAtom,
  addTransactionAtom,
  rTokenStatusAtom,
} from 'state/atoms'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import SettingItem from './SettingItem'

const FreezeManager = () => {
  const [txId, setTx] = useState('')
  const tx = useTransaction(txId)
  const rToken = useRToken()
  const accountRole = useAtomValue(accountRoleAtom)
  const { frozen: isFrozen } = useAtomValue(rTokenStatusAtom)
  const addTransaction = useSetAtom(addTransactionAtom)

  useEffect(() => {
    if (
      tx?.status === TRANSACTION_STATUS.CONFIRMED ||
      tx?.status === TRANSACTION_STATUS.REJECTED
    ) {
      setTx('')
    }
  }, [tx?.status])

  const handleFreeze = () => {
    if (rToken?.main && !isFrozen) {
      const id = uuid()
      setTx(id)
      addTransaction([
        {
          id,
          description: t`Short Freeze ${rToken.symbol}`,
          status: TRANSACTION_STATUS.PENDING,
          value: '0',
          call: {
            abi: 'main',
            address: rToken.main,
            method: 'freezeShort',
            args: [],
          },
        },
      ])
    }
  }

  const handleLongFreeze = () => {
    if (rToken?.main && !isFrozen) {
      const id = uuid()
      setTx(id)
      addTransaction([
        {
          id,
          description: t`Long Freeze ${rToken.symbol}`,
          status: TRANSACTION_STATUS.PENDING,
          value: '0',
          call: {
            abi: 'main',
            address: rToken.main,
            method: 'freezeLong',
            args: [],
          },
        },
      ])
    }
  }

  const handleUnfreeze = () => {
    if (rToken?.main && isFrozen) {
      const id = uuid()
      setTx(id)
      addTransaction([
        {
          id,
          description: t`Unfreeze ${rToken?.symbol}`,
          status: TRANSACTION_STATUS.PENDING,
          value: '0',
          call: {
            abi: 'main',
            address: rToken.main,
            method: 'unfreeze',
            args: [],
          },
        },
      ])
    }
  }

  return (
    <>
      <SettingItem
        title={isFrozen ? t`RToken is frozen` : t`RToken is not frozen`}
        subtitle={t`Current status:`}
        value={isFrozen ? t`Frozen` : t`Not frozen`}
        icon="freeze"
        mb={3}
        action={isFrozen && accountRole.owner ? t`Unfreeze` : ''}
        onAction={handleUnfreeze}
        actionVariant="danger"
        loading={!!tx}
      />
      <SettingItem
        title={t`Short Freeze`}
        subtitle={t`Role held by:`}
        value="0xfb...0344"
        action={
          !isFrozen && (accountRole.shortFreezer || accountRole.owner)
            ? t`Freeze`
            : ''
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
          !isFrozen && (accountRole.longFreezer || accountRole.owner)
            ? t`Long Freeze`
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
