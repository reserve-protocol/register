import { Trans, t } from '@lingui/macro'
import Main from '@/abis/Main'
import MainLegacy from '@/abis/MainLegacy'
import useContractWrite from '@/hooks/useContractWrite'
import useRToken from '@/hooks/useRToken'
import useWatchTransaction from '@/hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import {
  accountRoleAtom,
  isModuleLegacyAtom,
  rTokenContractsAtom,
  rTokenManagersAtom,
  rTokenStateAtom,
} from '@/state/atoms'
import { Abi } from 'viem'
import RolesView from './roles-view'
import SettingItem from './setting-item'

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
  const contracts = useAtomValue(rTokenContractsAtom)
  const { tradingPaused, issuancePaused } = useAtomValue(rTokenStateAtom)
  let pauseLabel = legacy ? '' : 'Trading'
  let isPaused = tradingPaused
  const hasRole = !!accountRole?.pauser || !!accountRole?.owner

  if (type === PAUSE_TYPES.ISSUANCE) {
    isPaused = issuancePaused
    pauseLabel = 'Issuance'
  }

  const { write, hash, isLoading } = useContractWrite(
    accountRole && contracts && hasRole && rToken?.main
      ? {
          address: rToken.main,
          abi: legacy ? (MainLegacy as Abi) : (Main as Abi),
          functionName: isPaused
            ? `unpause${pauseLabel}`
            : `pause${pauseLabel}`,
        }
      : undefined
  )

  const { isMining } = useWatchTransaction({
    hash,
    label: `${isPaused ? 'Unpause' : 'Pause'} ${pauseLabel.toLowerCase()} ${rToken?.symbol}`,
  })

  return (
    <SettingItem
      className="mt-3"
      title={legacy ? 'Pause' : pauseLabel}
      subtitle={t`Status:`}
      value={isPaused ? t`${pauseLabel} paused` : t`${pauseLabel} not paused`}
      action={
        hasRole
          ? `${isPaused ? 'Unpause' : 'Pause'} ${pauseLabel.toLowerCase()}`
          : ''
      }
      onAction={write}
      loading={isLoading || isMining}
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
    className="mb-3"
  />
)

const PauseActions = () => {
  const { main: isLegacy } = useAtomValue(isModuleLegacyAtom)

  return (
    <div className="flex">
      <div className="h-[114px] border-r border-dashed border-border" />
      <div className="ml-5 flex-grow">
        <span className="text-legend text-xs">
          <Trans>
            The pauser(s) can put the RToken in two states which can be either
            true or false (no set duration):
          </Trans>
        </span>

        <Pausing legacy={isLegacy} type={PAUSE_TYPES.TRADING} />
        {!isLegacy && <Pausing type={PAUSE_TYPES.ISSUANCE} />}
      </div>
    </div>
  )
}

const PauseManager = () => (
  <>
    <Pausers />
    <PauseActions />
  </>
)

export default PauseManager
