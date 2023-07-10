import { Trans, t } from '@lingui/macro'
import Main from 'abis/Main'
import useContractWrite from 'hooks/useContractWrite'
import useRToken from 'hooks/useRToken'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import {
  accountRoleAtom,
  rTokenManagersAtom,
  rTokenStateAtom,
} from 'state/atoms'
import { Box, Flex, Text } from 'theme-ui'
import RolesView from './RolesView'
import SettingItem from './SettingItem'

const ShortFreeze = () => {
  const { freezers } = useAtomValue(rTokenManagersAtom)
  const rToken = useRToken()
  const accountRole = useAtomValue(accountRoleAtom)
  const { frozen: isFrozen } = useAtomValue(rTokenStateAtom)
  const isAvailable =
    !isFrozen && (accountRole?.shortFreezer || accountRole?.owner)

  const { write, hash, isLoading } = useContractWrite({
    address: isAvailable && rToken?.main ? rToken.main : undefined,
    abi: Main,
    functionName: 'freezeShort',
  })
  useWatchTransaction({
    hash,
    label: `Short freeze ${rToken?.symbol}`,
  })

  return (
    <SettingItem
      mt={3}
      title={t`Short Freeze`}
      subtitle={t`Role held by:`}
      value={<RolesView roles={freezers} />}
      action={isAvailable ? t`Short Freeze` : ''}
      onAction={write}
      actionVariant="danger"
      loading={isLoading}
    />
  )
}

const LongFreeze = () => {
  const { longFreezers } = useAtomValue(rTokenManagersAtom)
  const rToken = useRToken()
  const accountRole = useAtomValue(accountRoleAtom)
  const { frozen: isFrozen } = useAtomValue(rTokenStateAtom)
  const isAvailable =
    !isFrozen && (accountRole?.longFreezer || accountRole?.owner)

  const { write, hash, isLoading } = useContractWrite({
    address: isAvailable && rToken?.main ? rToken.main : undefined,
    abi: Main,
    functionName: 'freezeLong',
  })
  useWatchTransaction({
    hash,
    label: `Long freeze ${rToken?.symbol}`,
  })

  return (
    <SettingItem
      title={t`Long Freeze`}
      mt={3}
      subtitle={t`Role held by:`}
      value={<RolesView roles={longFreezers} />}
      action={isAvailable ? t`Long Freeze` : ''}
      onAction={write}
      actionVariant="danger"
      loading={isLoading}
    />
  )
}

/**
 * View: Settings > Display RToken actions for freezers and long freezers
 */
const FreezeManager = () => {
  const rToken = useRToken()
  const accountRole = useAtomValue(accountRoleAtom)
  const { frozen: isFrozen } = useAtomValue(rTokenStateAtom)
  const isAvailable =
    isFrozen && (accountRole?.longFreezer || accountRole?.owner)

  const { write, hash, isLoading } = useContractWrite({
    address: isAvailable && rToken?.main ? rToken.main : undefined,
    abi: Main,
    functionName: 'unfreeze',
  })
  useWatchTransaction({
    hash,
    label: `Unfreeze ${rToken?.symbol}`,
  })

  return (
    <>
      <SettingItem
        title={t`Freeze State`}
        subtitle={t`Current status:`}
        value={isFrozen ? t`Frozen` : t`Not frozen`}
        icon="freeze"
        mb={3}
        action={isAvailable ? t`Unfreeze` : ''}
        onAction={write}
        actionVariant="danger"
        loading={isLoading}
      />
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
              There’s two freezing roles that put the system in the same state
              for different durations:
            </Trans>
          </Text>
          <ShortFreeze />
          <LongFreeze />
        </Box>
      </Flex>
    </>
  )
}

export default FreezeManager
