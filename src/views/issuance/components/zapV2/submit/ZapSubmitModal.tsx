import { Button, Modal } from 'components'
import AsteriskIcon from 'components/icons/AsteriskIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { useState } from 'react'
import { X } from 'react-feather'
import { Box, Divider, Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'
import ZapInputUSD from '../input/ZapInputUSD'
import ZapOutputUSD from '../output/ZapOutputUSD'
import ZapDetails from '../overview/ZapDetails'
import ZapConfirm from './ZapConfirm'
import { ZapTxProvider } from '../context/ZapTxContext'
import Skeleton from 'react-loading-skeleton'
import MintersModal from '../minters-modal'
import { keyframes } from '@emotion/react'

const ZapOverview = () => {
  const [collapsed, setCollapsed] = useState(true)
  const { tokenIn, tokenOut, amountIn, amountOut, loadingZap } = useZap()

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
            {loadingZap ? (
              <Skeleton width={300} height={35} />
            ) : (
              <Text sx={{ fontSize: 26, fontWeight: 700 }}>
                {amountOut} {tokenOut.symbol}
              </Text>
            )}

            <ZapOutputUSD />
          </Box>
        </Box>
      </Box>
      <Box>
        <Box variant="layout.verticalAlign">
          <Divider
            sx={{
              flexGrow: 1,
              borderStyle: 'dashed',
              borderColor: 'darkBorder',
              m: 0,
            }}
          />
          <Button small variant="hover" onClick={() => setCollapsed((c) => !c)}>
            <Box
              variant="layout.verticalAlign"
              sx={{
                color: 'secondaryText',
                minWidth: 92,
                justifyContent: 'space-between',
              }}
            >
              <Text mr="2">{collapsed ? 'Show more' : 'Show less'}</Text>
              <AsteriskIcon />
            </Box>
          </Button>
          <Divider
            sx={{
              flexGrow: 1,
              borderStyle: 'dashed',
              borderColor: 'darkBorder',
              m: 0,
            }}
          />
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
          <ZapDetails hideGasCost />
        </Box>
      </Box>
      <ZapTxProvider>
        <ZapConfirm />
      </ZapTxProvider>
    </Box>
  )
}

const slide = keyframes`
  from {
    left: 50%;
  }
  to {
    left: calc(50% - 150px);
  }
`

const ZapSubmitModal = () => {
  const { setOpenSubmitModal, operation, refreshQuote } = useZap()

  return (
    <Modal
      p={0}
      sx={{
        position: 'relative',
        border: '3px solid',
        borderColor: 'borderFocused',
        minWidth: 440,
        overflow: 'visible',
        animation: `${slide} 0.5s forwards`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
          backgroundColor: 'backgroundNested',
          borderRadius: '8px',
          boxShadow: '4px 5px 35px 4px rgba(0, 0, 0, 0.10)',
        }}
      >
        <Box variant="layout.verticalAlign" p={4} mb={[3, 0]} pt={4} pb={0}>
          <Text variant="title" sx={{ fontWeight: 'bold' }}>
            {`Review ${operation}`}
          </Text>
          <Button
            variant="circle"
            onClick={() => {
              setOpenSubmitModal(false)
              refreshQuote()
            }}
            sx={{ marginLeft: 'auto', backgroundColor: 'transparent' }}
          >
            <X />
          </Button>
        </Box>

        <ZapOverview />
      </Box>
      <MintersModal />
    </Modal>
  )
}

export default ZapSubmitModal
