import { Button } from 'components'
import { useCallback, useState } from 'react'
import { Zap } from 'react-feather'
import { Box, Text } from 'theme-ui'
import EarnZapSidebar from './EarnZapSidebar'
import { chainIdAtom } from 'state/atoms'
import { useSetAtom } from 'jotai'

type SidebarStatus = 'deposit' | 'withdraw' | 'none'

const PoolZapToEarn = ({ chainId }: { chainId: number }) => {
  const setChain = useSetAtom(chainIdAtom)
  const [sidebar, setSidebar] = useState<SidebarStatus>('none')
  const handleClose = useCallback(() => setSidebar('none'), [setSidebar])

  return (
    <>
      <Box
        variant="layout.verticalAlign"
        py="3"
        px="4"
        sx={{ borderBottom: '1px solid', gap: 2, borderColor: 'border' }}
      >
        <Zap size={16} />
        <Box mr="auto">
          <Text variant="strong">This pool has "1-click earn" enabled</Text>
          <Text variant="legend" sx={{ fontSize: 1 }}>
            This allows you to deposit and earn "without already having the LP
            token in your wallet"
          </Text>
        </Box>
        <Button>
          <Box
            variant="layout.verticalAlign"
            sx={{ gap: 2 }}
            onClick={() => {
              setChain(chainId)
              setSidebar('deposit')
            }}
          >
            <Zap size={16} />
            Deposit
          </Box>
        </Button>
        {/* <Button>
          <Box
            variant="layout.verticalAlign"
            sx={{ gap: 2 }}
            onClick={() => setSidebar('withdraw')}
          >
            <Zap size={16} />
            Withdraw
          </Box>
        </Button> */}
      </Box>
      {sidebar !== 'none' && <EarnZapSidebar onClose={handleClose} />}
    </>
  )
}

export default PoolZapToEarn
