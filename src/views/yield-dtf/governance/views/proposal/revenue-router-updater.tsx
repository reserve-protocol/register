import RevenueRouter from '@/abis/RevenueRouter'
import { EUSD_REVENUE_ROUTER_ADDRESS } from '@/utils/addresses'
import { ChainId } from '@/utils/chains'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { rTokenAtom } from '@/state/atoms'
import { useReadContract } from 'wagmi'
import {
  revenueRouterCurrentAtom,
  revenueRouterDraftAtom,
  revenueRouterEnabledAtom,
  revenueRouterReadErrorAtom,
} from './revenue-router-atoms'

export default function RevenueRouterUpdater() {
  const token = useAtomValue(rTokenAtom)
  const enabled = useAtomValue(revenueRouterEnabledAtom)
  const setCurrent = useSetAtom(revenueRouterCurrentAtom)
  const setReadError = useSetAtom(revenueRouterReadErrorAtom)
  const resetCurrent = useResetAtom(revenueRouterCurrentAtom)
  const resetDraft = useResetAtom(revenueRouterDraftAtom)
  const resetError = useResetAtom(revenueRouterReadErrorAtom)
  const { data, isError } = useReadContract({
    address: EUSD_REVENUE_ROUTER_ADDRESS,
    abi: RevenueRouter,
    functionName: 'destinations',
    chainId: ChainId.Mainnet,
    query: { enabled },
  })

  useEffect(
    () => () => {
      resetCurrent()
      resetDraft()
      resetError()
    },
    [token?.address, token?.chainId, resetCurrent, resetDraft, resetError]
  )

  useEffect(() => {
    if (enabled) {
      setCurrent(data)
      setReadError(isError)
    }
  }, [enabled, data, isError, setCurrent, setReadError])

  return null
}
