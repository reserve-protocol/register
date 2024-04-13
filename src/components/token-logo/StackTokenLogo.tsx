import TokenLogo from 'components/icons/TokenLogo'
import React from 'react'
import { Box, BoxProps } from 'theme-ui'

interface Props extends BoxProps {
  tokens: { symbol: string; logo: string; address: string }[]
  size?: number
}

const StackTokenLogo = React.memo(
  ({ tokens, sx = {}, size, ...props }: Props) => {
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
                sx={{ width: '28px' }}
                key={token.address}
              >
                <TokenLogo
                  width={size}
                  sx={{
                    position: 'relative',
                    left: index ? `${-6 * index}px` : 0,
                  }}
                  symbol={'frax'}
                />
                <TokenLogo
                  width={size}
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
              key={token.address}
              sx={{
                position: 'relative',
                left: index ? `${-(size ? size / 2 : 6)}px` : 0,
                marginRight: index ? `${-(size ? size / 2 : 6)}px` : 0,
              }}
            >
              <TokenLogo width={size} symbol={token.symbol} src={token.logo} />
            </Box>
          )
        })}
      </Box>
    )
  }
)

export default StackTokenLogo
