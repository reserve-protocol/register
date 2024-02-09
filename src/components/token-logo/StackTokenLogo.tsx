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
            <Box
              variant="layout.verticalAlign"
              sx={{ width: '24px' }}
              key={token.address}
            >
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
          <Box
            sx={{
              position: 'relative',
              left: index ? `${-6}px` : 0,
              marginRight: index ? `${-6}px` : 0,
            }}
          >
            <TokenLogo
              key={token.address}
              symbol={token.symbol}
              src={token.logo}
            />
          </Box>
        )
      })}
    </Box>
  )
})

export default StackTokenLogo
