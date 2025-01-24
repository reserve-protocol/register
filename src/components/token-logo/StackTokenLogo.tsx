import TokenLogo from 'components/icons/TokenLogo'
import React from 'react'
import { Box, BoxProps } from 'theme-ui'

interface Props extends BoxProps {
  tokens: { symbol: string; logo?: string; address: string }[]
  size?: number
  reverseStack?: boolean
  overlap?: number
}

const StackTokenLogo = React.memo(
  ({
    tokens,
    sx = {},
    size,
    reverseStack = false,
    overlap = 0,
    ...props
  }: Props) => {
    return (
      <Box
        variant="layout.verticalAlign"
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: reverseStack ? 'row-reverse' : 'row',
          ...sx,
        }}
        {...props}
      >
        {(reverseStack ? tokens.reverse() : tokens).map((token, index) => {
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

          const gap = -(size ? size / 2 : 6) - overlap
          const m = reverseStack
            ? index === tokens.length - 1
              ? 0
              : gap
            : index === 0
              ? 0
              : gap

          return (
            <Box
              key={token.address}
              sx={{
                position: 'relative',
                left: `${m}px`,
                marginRight: `${m}px`,
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
