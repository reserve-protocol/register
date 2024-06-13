import { useState } from 'react'
import { IconButton } from 'theme-ui'
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
    <IconButton
      sx={{
        cursor: endpoint ? 'pointer' : 'not-allowed',
        width: '34px',
        height: '34px',
        border: '1px solid',
        borderColor: 'borderSecondary',
        borderRadius: '6px',
        position: 'relative',
        opacity: endpoint ? 1 : 0.5,
        ':hover': {
          backgroundColor: endpoint ? 'border' : 'transparent',
        },
      }}
      p={0}
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
    </IconButton>
  )
}

export default RefreshButton
