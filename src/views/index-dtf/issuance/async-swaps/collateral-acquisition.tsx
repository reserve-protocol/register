import { useAtomValue } from 'jotai'
import { asyncSwapResponseAtom } from './atom'
import { Loader } from 'lucide-react'
import humanizeDuration from 'humanize-duration'
import { useEffect, useState } from 'react'
import { getFolioRoute, getTimerFormat } from '@/utils'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { ROUTES } from '@/utils/constants'

const CollateralAcquisition = ({ dtfAmount }: { dtfAmount: number }) => {
  const chainId = useAtomValue(chainIdAtom)
  const asyncSwapResponse = useAtomValue(asyncSwapResponseAtom)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!asyncSwapResponse?.createdAt) return

    const interval = setInterval(() => {
      const now = new Date()
      const createdAt = new Date(asyncSwapResponse.createdAt)
      const elapsed = now.getTime() - createdAt.getTime()
      setElapsedTime(elapsed / 1000)
    }, 1000)

    return () => clearInterval(interval)
  }, [asyncSwapResponse?.createdAt])

  if (!asyncSwapResponse) return null

  const hasAllCollaterals = asyncSwapResponse.cowswapOrders.every(
    (order) => order.status.type === 'traded' || order.status.type === 'solved'
  )

  if (hasAllCollaterals) {
    return (
      <Link
        to={getFolioRoute(
          asyncSwapResponse.dtf,
          chainId,
          ROUTES.ISSUANCE + '/manual?amountIn=' + dtfAmount
        )}
        className="flex gap-2 items-center justify-between bg-card rounded-2xl"
      >
        <Button size="lg" className="w-full rounded-xl">
          Manual Mint
        </Button>
      </Link>
    )
  }

  return (
    <div className="flex gap-2 items-center justify-between p-4 bg-card rounded-2xl">
      <div className="flex gap-2 items-center text-primary">
        <div className="border rounded-full p-1.5">
          <Loader size={16} strokeWidth={1} className="animate-spin-slow" />
        </div>
        <div className="font-semibold">Acquiring collaterals</div>
      </div>
      <div className="text-muted-foreground">{getTimerFormat(elapsedTime)}</div>
    </div>
  )
}

export default CollateralAcquisition
