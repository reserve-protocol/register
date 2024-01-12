import useRToken from 'hooks/useRToken'
import React from 'react'
import { Box, BoxProps, Image } from 'theme-ui'
import Base from './logos/Base'
import ChainLogo from './ChainLogo'

interface Props extends BoxProps {
  symbol?: string
  width?: number | string
  src?: string
  chain?: number
  bordered?: boolean
}

const IMGS = new Set([
  'dai',
  'cdai',
  'rsr',
  'strsr',
  'rsv',
  'tusd',
  'usdt',
  'cusdt',
  'usdc',
  'cusdc',
  'usdp',
  'wbtc',
  'cwbtc',
  'ceth',
  'eth',
  'busd',
  'weth',
  'sadai',
  'sausdc',
  'sausdt',
  'eurt',
  'fusdc',
  'fusdt',
  'fdai',
  'wcUSDCv3',
  'wsteth',
  'reth',
  'stkcvx3crv',
  'stkcvxcrv3crypto',
  'stkcvxeusd3crv-f',
  'stkcvxmim-3lp3crv-f',
  'sdai',
  'mrp-ausdt',
  'mrp-ausdc',
  'mrp-adai',
  'mrp-awbtc',
  'mrp-aweth',
  'mrp-awteth',
  'mrp-asteth',
  'frax',
  'crvusd',
  'crv',
  'cvx',
])

const TokenLogo = ({
  symbol,
  src,
  chain,
  width = 20,
  bordered = false,
  sx = {},
  ...props
}: Props) => {
  let imgSrc = src
  const rToken = useRToken()

  if (!imgSrc) {
    if (rToken?.symbol === symbol) {
      imgSrc = rToken?.logo
    } else if (symbol && IMGS.has(symbol.toLowerCase())) {
      imgSrc = `/svgs/${symbol.toLowerCase()}.svg`
    }
  }

  return (
    <Box
      {...props}
      variant="layout.verticalAlign"
      sx={{
        position: 'relative',
        borderRadius: '50%',
        overflow: 'visible',
        flexShrink: 0,
        width: width,
        justifyContent: 'center',
        borderColor: 'text',
        border: bordered ? '0.5px solid' : 'none',
        ...sx,
      }}
    >
      <Image
        src={imgSrc || '/svgs/defaultLogo.svg'}
        sx={{ height: '100%', width: width }}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null // prevents looping
          currentTarget.src = '/svgs/defaultLogo.svg'
        }}
      />
      {!!chain && (
        <Box
          sx={{
            position: 'absolute',
            right: '-3px',
            flexShrink: 0,
            width: Number(width) / 2,
            bottom: '-10px',
          }}
        >
          <ChainLogo
            chain={chain}
            width={Number(width) / 2}
            height={Number(width) / 2}
          />
        </Box>
      )}
    </Box>
  )
}

export default React.memo(TokenLogo)
