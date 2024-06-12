import { useState } from 'react'
import { IconButton } from 'theme-ui'
import RefreshIcon from './RefreshIcon'

const RefreshButton = () => {
  const [refreshCount, setRefreshCount] = useState(0)

  const handleClick = () => {
    setRefreshCount((prevRefreshCount) => prevRefreshCount + 1)
  }

  return (
    <IconButton
      sx={{
        cursor: 'pointer',
        width: '34px',
        height: '34px',
        border: '1px solid',
        borderColor: 'borderSecondary',
        borderRadius: '6px',
        position: 'relative',
        ':hover': { backgroundColor: 'border' },
      }}
      p={0}
      onClick={handleClick}
    >
      <RefreshIcon id={refreshCount} />
    </IconButton>
  )
}

export default RefreshButton
