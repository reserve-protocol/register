import { Modal } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { X } from 'react-feather'
import { Box, Button, Divider, Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'
import ZapInputUSD from '../input/ZapInputUSD'
import ZapOutputUSD from '../output/ZapOutputUSD'
import ZapDetails from '../overview/ZapDetails'
import ZapConfirm from './ZapConfirm'

const ZapOverview = () => {
  const { tokenIn, tokenOut, amountIn, amountOut } = useZap()

  return (
    <Box
      px={4}
      py={4}
      pt={0}
      sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box variant="layout.verticalAlign" sx={{ gap: '12px' }}>
          <TokenLogo symbol={tokenIn.symbol} width={24} />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Text>You use:</Text>
            <Text sx={{ fontSize: 26, fontWeight: 700 }}>
              {amountIn} {tokenIn.symbol}
            </Text>
            <ZapInputUSD />
          </Box>
        </Box>
        <Box variant="layout.verticalAlign" sx={{ gap: '12px' }}>
          <TokenLogo symbol={tokenOut.symbol} width={24} />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Text>You receive:</Text>
            <Text sx={{ fontSize: 26, fontWeight: 700 }}>
              {amountOut} {tokenOut.symbol}
            </Text>
            <ZapOutputUSD />
          </Box>
        </Box>
      </Box>
      <Divider sx={{ m: 0 }} />
      <ZapDetails />
      <ZapConfirm />
    </Box>
  )
}

const ZapSubmitModal = () => {
  const { setOpenSubmitModal, operation } = useZap()

  return (
    <Modal
      p={0}
      sx={{ border: '3px solid', borderColor: 'borderFocused', minWidth: 420 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
          backgroundColor: 'backgroundNested',
        }}
      >
        <Box variant="layout.verticalAlign" p={4} mb={[3, 0]} pt={4} pb={0}>
          <Text variant="sectionTitle">
            {operation === 'mint' ? 'Review Mint' : 'Review Redeem'}
          </Text>
          <Button
            variant="circle"
            onClick={() => setOpenSubmitModal(false)}
            sx={{ marginLeft: 'auto', backgroundColor: 'transparent' }}
          >
            <X />
          </Button>
        </Box>

        <ZapOverview />
      </Box>
    </Modal>
  )
}

export default ZapSubmitModal
