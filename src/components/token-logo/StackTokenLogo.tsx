import TokenLogo from 'components/icons/TokenLogo'
import React from 'react'
import { Box, BoxProps } from 'theme-ui'

interface Props extends BoxProps {
  tokens: { symbol: string; logo: string; address: string }[]
}

const StackTokenLogo = React.memo(({ tokens, sx = {}, ...props }: Props) => {
  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ position: 'relative', ...sx }}
      {...props}
    >
      {tokens.map((token, index) => {
        if (token.symbol === 'FRAXBP') {
          return (
            <Box variant="layout.verticalAlign" key={token.address}>
              <TokenLogo
                sx={{
                  position: 'relative',
                  left: index ? `${-6 * index}px` : 0,
                }}
                symbol={'frax'}
              />
              <TokenLogo
                sx={{
                  position: 'relative',
                  left: index ? `${-6 * (index + 1)}px` : 0,
                }}
                symbol={'usdc'}
              />
            </Box>
          )
        }

        return (
          <TokenLogo
            key={token.address}
            sx={{ position: 'relative', left: index ? `${-6 * index}px` : 0 }}
            symbol={token.symbol}
            src={token.logo}
          />
        )
      })}
    </Box>
  )
})

export default StackTokenLogo
