import GasIcon from 'components/icons/GasIcon'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { useZap } from './context/ZapContext'
import ZapRate from './overview/ZapRate'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import ZapDetails from './overview/ZapDetails'

const ZapOperationDetails = () => {
  const [collapsed, setCollapsed] = useState(true)
  const { gasCost } = useZap()

  return (
    <Box>
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation()
          setCollapsed((c) => !c)
        }}
      >
        <ZapRate />
        <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
          <GasIcon />
          <Text>
            Estimated gas cost:{' '}
            <Text sx={{ fontWeight: 700 }}>
              ${gasCost ? formatCurrency(+gasCost, 2) : 0}
            </Text>
          </Text>
          {collapsed ? (
            <ChevronDown fontSize={16} strokeWidth={1.2} />
          ) : (
            <ChevronUp fontSize={16} strokeWidth={1.2} />
          )}
        </Box>
      </Box>
      <Box
        sx={{
          overflow: 'hidden',
          maxHeight: collapsed ? '0px' : '1000px',
          transition: 'max-height 0.4s ease-in-out',
        }}
      >
        <ZapDetails mt={3} />
      </Box>
    </Box>
  )
}

export default ZapOperationDetails
