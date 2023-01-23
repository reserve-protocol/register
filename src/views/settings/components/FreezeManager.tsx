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
import RolesView from './RolesView'
import SettingItem from './SettingItem'

/**
 * View: Settings > Display RToken actions for freezers and long freezers
 */
const FreezeManager = ({
  freezers,
  longFreezers,
}: {
  freezers: string[]
  longFreezers: string[]
}) => {
  const [txId, setTx] = useState('')
  const [freezeType, setFreezeType] = useState(0) // 0 = short -- 1 = long
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
      setFreezeType(0)
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
      setFreezeType(1)
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
        title={t`Freeze State`}
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
        value={<RolesView roles={freezers} />}
        action={!isFrozen && accountRole.shortFreezer ? t`Short Freeze` : ''}
        onAction={handleFreeze}
        actionVariant="danger"
        loading={!!tx && !freezeType}
      />
      <SettingItem
        title={t`Long Freeze`}
        mt={3}
        subtitle={t`Role held by:`}
        value={<RolesView roles={longFreezers} />}
        action={
          !isFrozen && (accountRole.longFreezer || accountRole.owner)
            ? t`Long Freeze`
            : ''
        }
        onAction={handleLongFreeze}
        actionVariant="danger"
        loading={!!tx && !!freezeType}
      />
    </>
  )
}

export default FreezeManager
