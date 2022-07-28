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
  top: -1px;
`

const IMGS = new Set(['dai', 'rsdp', 'rsr', 'rsv', 'tusd', 'usdc', 'usdp'])

const TokenLogo = ({ symbol, src, size = '1em', ...props }: Props) => {
  let imgSrc = src

  if (!imgSrc) {
    imgSrc = IMGS.has(symbol?.toLowerCase() ?? '')
      ? `/imgs/${symbol?.toLowerCase()}.png`
      : '/imgs/default.png'
  }

  return (
    <Container {...props}>
      <Image
        src={imgSrc}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null // prevents looping
          currentTarget.src = '/imgs/default.png'
        }}
        style={{
          borderRadius: '50%',
          boxShadow: '0 0 3px 0px white inset, 0 0 3px 0px white',
          height: size,
          width: size,
        }}
      />
    </Container>
  )
}

export default React.memo(TokenLogo)
