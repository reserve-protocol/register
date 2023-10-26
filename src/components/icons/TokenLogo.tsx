import useRToken from 'hooks/useRToken'
import React from 'react'
import { Box, BoxProps, Image } from 'theme-ui'

interface Props extends BoxProps {
  symbol?: string
  width?: number | string
  src?: string
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
])

const TokenLogo = ({ symbol, src, width, sx = {}, ...props }: Props) => {
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
        border: '1px solid 0 0 1px 0px white',
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
    </Box>
  )
}

export default React.memo(TokenLogo)
