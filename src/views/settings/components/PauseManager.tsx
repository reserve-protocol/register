import { Trans, t } from '@lingui/macro'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import {
  accountRoleAtom,
  addTransactionAtom,
  isModuleLegacyAtom,
  rTokenManagersAtom,
  rTokenStateAtom,
} from 'state/atoms'
import { useTransactionState } from 'state/chain/hooks/useTransactions'
import { Box, Flex, Text } from 'theme-ui'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import RolesView from './RolesView'
import SettingItem from './SettingItem'

enum PAUSE_TYPES {
  ISSUANCE,
  TRADING,
}

const Pausing = ({
  type,
  legacy = false,
}: {
  type: PAUSE_TYPES
  legacy?: boolean
}) => {
  const rToken = useRToken()
  const accountRole = useAtomValue(accountRoleAtom)
  const { tradingPaused, issuancePaused } = useAtomValue(rTokenStateAtom)
  const addTransaction = useSetAtom(addTransactionAtom)
  const [txId, setTx] = useState('')
  const tx = useTransactionState(txId)

  let isPaused = tradingPaused // applies for legacy too
  let pauseLabel = legacy ? '' : 'Trading'

  if (type === PAUSE_TYPES.ISSUANCE) {
    isPaused = issuancePaused
    pauseLabel = 'Issuance'
  }

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
          description: `${
            isPaused ? 'Unpause' : 'Pause'
          } ${pauseLabel.toLowerCase()} ${rToken.symbol}`,
          status: TRANSACTION_STATUS.PENDING,
          value: '0',
          call: {
            abi: legacy ? '_main' : 'main',
            address: rToken.main,
            method: isPaused ? `unpause${pauseLabel}` : `pause${pauseLabel}`,
            args: [],
          },
        },
      ])
    }
  }

  return (
    <SettingItem
      mt={3}
      title={legacy ? 'Pause' : pauseLabel}
      subtitle={t`Status:`}
      value={isPaused ? t`${pauseLabel} paused` : t`${pauseLabel} not paused`}
      action={
        accountRole?.pauser || accountRole?.owner
          ? `${isPaused ? 'Unpause' : 'Pause'} ${pauseLabel.toLowerCase()}`
          : ''
      }
      onAction={handlePause}
      loading={!!txId}
      actionVariant="danger"
    />
  )
}

const Pausers = () => (
  <SettingItem
    title="Pausing"
    subtitle={t`Role held by:`}
    value={<RolesView roles={useAtomValue(rTokenManagersAtom).pausers} />}
    icon="danger"
    mb={3}
  />
)

const PauseActions = () => {
  const { main: isLegacy } = useAtomValue(isModuleLegacyAtom)

  return (
    <Flex>
      <Box
        sx={{
          height: 114,
          borderRight: '1px dashed',
          borderColor: 'darkBorder',
        }}
      />
      <Box ml={5} sx={{ flexGrow: 1 }}>
        <Text variant="legend" sx={{ fontSize: 1 }}>
          <Trans>
            The pauser(s) can put the RToken in two states which can be either
            true or false (no set duration):
          </Trans>
        </Text>

        <Pausing legacy={isLegacy} type={PAUSE_TYPES.TRADING} />
        {!isLegacy && <Pausing type={PAUSE_TYPES.ISSUANCE} />}
      </Box>
    </Flex>
  )
}

/**
 * View: Settings > Actions for an Rtoken pauser (pause/unpause)
 */
const PauseManager = () => (
  <>
    <Pausers />
    <PauseActions />
  </>
)

export default PauseManager
