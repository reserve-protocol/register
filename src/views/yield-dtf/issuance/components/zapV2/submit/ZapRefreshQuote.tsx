import { Button } from '@/components/ui/button'
import { ReactNode, useEffect, useState } from 'react'
import { useZap } from '../context/ZapContext'
import { Clock } from 'lucide-react'
import { useZapTx } from '../context/ZapTxContext'

const REFRESH_INTERVAL_SEC = 24

const ZapRefreshQuote = ({ children }: { children: ReactNode }) => {
  const { validatingZap, loadingZap, refreshQuote } = useZap()
  const { onGoingConfirmation } = useZapTx()

  const [counter, setCounter] = useState(REFRESH_INTERVAL_SEC)
  const [showRefresh, setShowRefresh] = useState(false)

  useEffect(() => {
    if (counter > 0) {
      if (loadingZap || validatingZap) {
        setCounter(REFRESH_INTERVAL_SEC)
      }
      const timer = setTimeout(
        () => setCounter((_counter) => _counter - 1),
        1000
      )
      return () => clearTimeout(timer)
    } else {
      setShowRefresh(true)
    }
  }, [counter, setCounter, setShowRefresh, loadingZap, validatingZap])

  const handleRefreshClick = () => {
    setCounter(30)
    setShowRefresh(false)
    refreshQuote()
  }

  useEffect(() => {
    if (onGoingConfirmation) {
      setCounter(0)
    }
  }, [onGoingConfirmation])

  if (onGoingConfirmation) {
    return <>{children}</>
  }

  return (
    <div>
      {showRefresh && !(loadingZap || validatingZap) ? (
        <Button onClick={handleRefreshClick} className="w-full">
          Refresh Quote
        </Button>
      ) : (
        <div>
          {children}
          <div className="flex items-center gap-2 justify-between text-sm">
            <span>Quote expiration</span>
            <div className="flex items-center gap-1 text-primary">
              <Clock size={16} />
              <span className="text-sm font-medium w-10 text-right">
                {`00:${counter.toString().padStart(2, '0')}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ZapRefreshQuote
