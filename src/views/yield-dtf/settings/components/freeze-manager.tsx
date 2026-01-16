import { Trans, t } from '@lingui/macro'
import Main from '@/abis/Main'
import useContractWrite from '@/hooks/useContractWrite'
import useRToken from '@/hooks/useRToken'
import useWatchTransaction from '@/hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import {
  accountRoleAtom,
  rTokenManagersAtom,
  rTokenStateAtom,
} from '@/state/atoms'
import RolesView from './roles-view'
import SettingItem from './setting-item'

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
      className="mt-3"
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
      className="mt-3"
      subtitle={t`Role held by:`}
      value={<RolesView roles={longFreezers} />}
      action={isAvailable ? t`Long Freeze` : ''}
      onAction={write}
      actionVariant="danger"
      loading={isLoading}
    />
  )
}

const FreezeManager = () => {
  const rToken = useRToken()
  const accountRole = useAtomValue(accountRoleAtom)
  const { frozen: isFrozen } = useAtomValue(rTokenStateAtom)
  const isAvailable = isFrozen && accountRole?.owner

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
        className="mb-3"
        action={isAvailable ? t`Unfreeze` : ''}
        onAction={write}
        actionVariant="danger"
        loading={isLoading}
      />
      <div className="flex">
        <div className="h-[114px] border-r border-dashed border-border" />
        <div className="ml-5 flex-grow">
          <span className="text-legend text-xs">
            <Trans>
              There's two freezing roles that put the system in the same state
              for different durations:
            </Trans>
          </span>
          <ShortFreeze />
          <LongFreeze />
        </div>
      </div>
    </>
  )
}

export default FreezeManager
