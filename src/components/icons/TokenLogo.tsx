import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import React from 'react'
import { rTokenMetaAtom } from 'state/rtoken/atoms/rTokenAtom'
import { Box, BoxProps, Image } from 'theme-ui'
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
  'usdbc',
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
  'mkusd',
  'eusd',
])

// Memoized token image
const TokenImage = React.memo(
  ({
    src = '/svgs/defaultLogo.svg',
    width = 20,
  }: {
    src?: string
    width?: number | string
  }) => {
    return (
      <Image
        src={src}
        sx={{ height: 'auto', width: width }}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null // prevents looping
          currentTarget.src = '/svgs/defaultLogo.svg'
        }}
      />
    )
  }
)

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
  let tokenSymbol = symbol

  if (tokenSymbol?.endsWith('-VAULT')) {
    tokenSymbol = tokenSymbol.replace('-VAULT', '')
  }

  if (!imgSrc) {
    if (rToken?.symbol === symbol) {
      imgSrc = rToken?.logo
    } else if (tokenSymbol && IMGS.has(tokenSymbol.toLowerCase())) {
      imgSrc = `/svgs/${tokenSymbol.toLowerCase()}.svg`
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
      <TokenImage src={imgSrc} width={width} />

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

interface TCurrentRTokenLogo extends BoxProps {
  width?: number
}

export const CurrentRTokenLogo = ({
  width = 20,
  ...props
}: TCurrentRTokenLogo) => {
  const rToken = useAtomValue(rTokenMetaAtom)

  return (
    <Box variant="layout.verticalAlign" {...props}>
      <TokenImage src={rToken?.logo} width={width} />
    </Box>
  )
}

export default TokenLogo
