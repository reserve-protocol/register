import Button from '@/components/old/button'
import { ReactNode, useEffect, useState } from 'react'
import { Box, Text } from 'theme-ui'
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
    <Box>
      {showRefresh && !(loadingZap || validatingZap) ? (
        <Button onClick={handleRefreshClick} fullWidth>
          Refresh Quote
        </Button>
      ) : (
        <Box>
          {children}
          <Box
            variant="layout.verticalAlign"
            sx={{ gap: 2, justifyContent: 'space-between', fontSize: 14 }}
          >
            <Text>Quote expiration</Text>
            <Box
              variant="layout.verticalAlign"
              sx={{ gap: 1, color: 'primary' }}
            >
              <Clock size={16} />
              <Text
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  width: 40,
                  textAlign: 'right',
                }}
              >
                {`00:${counter.toString().padStart(2, '0')}`}
              </Text>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default ZapRefreshQuote
