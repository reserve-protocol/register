import { folioVersionAtom } from '@/state/dtf/atoms'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import {
  useIndexDtfIdentity,
  useIndexDtfLatestAuction,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import {
  getLaunchBlocker,
  type LaunchBlocker,
  type LaunchMode,
  type RebalanceWindow,
} from '../utils/launch-readiness'
import { getRebalanceTimestamps } from '../utils/transforms'
import useRebalanceCurrentData, {
  type RebalanceCurrentData,
} from './use-rebalance-current-data'

const toWindow = (
  data: RebalanceCurrentData | undefined
): RebalanceWindow | undefined => {
  if (!data) return undefined
  return {
    nonce: data.rebalance.nonce,
    ...getRebalanceTimestamps(data.rebalance, data.folioVersion),
  }
}

// A cached success must never authorize a send: live read errors close the button, a fresh nonce/window re-read gates the click.
const useLaunchPreflight = (mode: LaunchMode) => {
  const identity = useIndexDtfIdentity()
  const versionState = useAtomValue(folioVersionAtom)
  const major = versionState.status === 'ready' ? versionState.major : undefined
  const isSdkVersion = major === 5 || major === 6
  const currentRebalance = useRebalanceCurrentData()
  const latestAuction = useIndexDtfLatestAuction(
    isSdkVersion && identity.address ? identity : undefined
  )

  const revalidate = async (
    expectedNonce: bigint
  ): Promise<LaunchBlocker | undefined> => {
    const [live, latest] = await Promise.all([
      currentRebalance.refetch(),
      isSdkVersion ? latestAuction.refetch() : undefined,
    ])
    if (latest && (latest.isError || latest.data === undefined))
      return 'live-state-unavailable'

    return getLaunchBlocker({
      mode,
      window: live.isError ? undefined : toWindow(live.data),
      expectedNonce,
      latestAuction: latest?.data,
      now: BigInt(Math.floor(Date.now() / 1000)),
    })
  }

  return {
    liveWindow: currentRebalance.isError
      ? undefined
      : toWindow(currentRebalance.data),
    hasLiveStateError:
      currentRebalance.isError || (isSdkVersion && latestAuction.isError),
    revalidate,
  }
}

export const LAUNCH_BLOCKER_MESSAGES: Record<LaunchBlocker, MessageDescriptor> = {
  'live-state-unavailable': msg`Live rebalance state unavailable — try again`,
  'nonce-changed': msg`This rebalance is no longer the current one — reload the page`,
  'window-closed': msg`This rebalance is no longer accepting auctions`,
  restricted: msg`The auction launcher still has priority — community launch is not open yet`,
  cooldown: msg`Community launch opens 2 minutes after the rebalance starts or the last auction ends — try again shortly`,
  'auction-ongoing': msg`An auction is already running for this rebalance`,
  'state-refreshed': msg`Rebalance state just refreshed — try again`,
}

export default useLaunchPreflight
