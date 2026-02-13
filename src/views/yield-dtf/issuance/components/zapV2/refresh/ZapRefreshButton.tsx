import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useZap } from '../context/ZapContext'
import RefreshIcon from './RefreshIcon'

const RefreshButton = () => {
  const {
    endpoint,
    zapResult,
    refreshInterval,
    refreshQuote,
    loadingZap,
    validatingZap,
    openSubmitModal,
  } = useZap()
  const [refreshCount, setRefreshCount] = useState(1)
  const isRefreshing = loadingZap || validatingZap

  const handleClick = () => {
    if (endpoint && zapResult && !isRefreshing) {
      refreshQuote()
      setRefreshCount((prevRefreshCount) => prevRefreshCount + 1)
    }
  }

  return (
    <button
      className={cn(
        'w-[34px] h-[34px] border border-secondary rounded-md relative text-foreground p-0',
        'flex items-center justify-center',
        endpoint
          ? 'cursor-pointer opacity-100 hover:bg-muted'
          : 'cursor-not-allowed opacity-50'
      )}
      disabled={!endpoint}
      onClick={handleClick}
    >
      {endpoint && zapResult && !isRefreshing && !openSubmitModal ? (
        <RefreshIcon
          animationDuration={`${refreshInterval}ms`}
          id={refreshCount}
        />
      ) : (
        <RefreshIcon animationDuration="0" id={0} />
      )}
    </button>
  )
}

export default RefreshButton
