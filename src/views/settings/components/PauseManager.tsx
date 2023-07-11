import { Trans, t } from '@lingui/macro'
import Main from 'abis/Main'
import MainLegacy from 'abis/MainLegacy'
import useContractWrite from 'hooks/useContractWrite'
import useRToken from 'hooks/useRToken'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import {
  accountRoleAtom,
  isModuleLegacyAtom,
  rTokenManagersAtom,
  rTokenStateAtom,
} from 'state/atoms'
import { Box, Flex, Text } from 'theme-ui'
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
  let pauseLabel = legacy ? '' : 'Trading'
  let isPaused = tradingPaused // applies for legacy too
  const hasRole = !!accountRole?.pauser || !!accountRole?.owner

  if (type === PAUSE_TYPES.ISSUANCE) {
    isPaused = issuancePaused
    pauseLabel = 'Issuance'
  }

  const { write, hash, isLoading } = useContractWrite({
    address: hasRole && rToken?.main ? rToken.main : undefined,
    abi: legacy ? (MainLegacy as any) : (Main as any), // Loose type infer because of optional abi
    functionName: isPaused ? `unpause${pauseLabel}` : `pause${pauseLabel}`,
  })

  useWatchTransaction({
    hash,
    label: `${isPaused ? 'Unpause' : 'Pause'} ${pauseLabel.toLowerCase()} ${
      rToken?.symbol
    }`,
  })

  return (
    <SettingItem
      mt={3}
      title={legacy ? 'Pause' : pauseLabel}
      subtitle={t`Status:`}
      value={isPaused ? t`${pauseLabel} paused` : t`${pauseLabel} not paused`}
      action={
        hasRole
          ? `${isPaused ? 'Unpause' : 'Pause'} ${pauseLabel.toLowerCase()}`
          : ''
      }
      onAction={write}
      loading={isLoading}
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
