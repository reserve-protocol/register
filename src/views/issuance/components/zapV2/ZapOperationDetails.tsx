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
        sx={{ cursor: 'pointer', gap: 1 }}
        onClick={(e) => {
          e.stopPropagation()
          setCollapsed((c) => !c)
        }}
        pl={3}
        pr="12px"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: ['column', 'row'],
            alignItems: ['flex-start', 'center'],
            flexGrow: 1,
            justifyContent: 'space-between',
            gap: 2,
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
          </Box>
        </Box>
        {collapsed ? (
          <ChevronDown fontSize={16} strokeWidth={1.2} />
        ) : (
          <ChevronUp fontSize={16} strokeWidth={1.2} />
        )}
      </Box>
      <Box
        sx={{
          overflow: 'hidden',
          maxHeight: collapsed ? '0px' : '1000px',
          transition: collapsed
            ? 'max-height 0.1s ease-in-out'
            : 'max-height 0.4s ease-in-out',
        }}
      >
        <ZapDetails mt={3} px={3} />
      </Box>
    </Box>
  )
}

export default ZapOperationDetails
