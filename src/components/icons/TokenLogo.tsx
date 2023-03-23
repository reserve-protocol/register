import styled from '@emotion/styled'
import React from 'react'
import { Box, BoxProps, Image } from 'theme-ui'

interface Props extends BoxProps {
  symbol?: string
  size?: number | string
  src?: string
}

const Container = styled(Box)`
  display: flex;
  align-items: center;
  position: relative;
`

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
])

const TokenLogo = ({ symbol, src, size = '1em', ...props }: Props) => {
  let imgSrc = src

  if (!imgSrc) {
    imgSrc = IMGS.has(symbol?.toLowerCase() ?? '')
      ? `/svgs/${symbol?.toLowerCase()}.svg`
      : '/svgs/default.svg'
  }

  return (
    <Container
      {...props}
      sx={{
        borderRadius: '50%',
        overflow: 'visible',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        justifyContent: 'center',
        border: '1px solid 0 0 1px 0px white',
        height: size,
        width: size,
      }}
    >
      <Image
        src={imgSrc}
        sx={{ height: '100%' }}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null // prevents looping
          currentTarget.src = '/svgs/default.svg'
        }}
      />
    </Container>
  )
}

export default React.memo(TokenLogo)
