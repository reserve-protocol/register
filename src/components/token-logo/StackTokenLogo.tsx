import LegacyTokenLogo from 'components/icons/TokenLogo'
import TokenLogo from '.'
import React from 'react'
import { Box, BoxProps } from 'theme-ui'

interface Props extends BoxProps {
  tokens: { symbol: string; logo?: string; address: string; chain?: number }[]
  size?: number
  reverseStack?: boolean
  overlap?: number
  outsource?: boolean
}

const StackTokenLogo = React.memo(
  ({
    tokens,
    sx = {},
    size,
    reverseStack = false,
    overlap = 0,
    outsource = false,
    ...props
  }: Props) => {
    return (
      <Box
        variant="layout.verticalAlign"
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: reverseStack ? 'row-reverse' : 'row',
          minWidth: 'max-content',
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
                <LegacyTokenLogo
                  width={size}
                  sx={{
                    position: 'relative',
                    left: index ? `${-6 * index}px` : 0,
                  }}
                  symbol={'frax'}
                />
                <LegacyTokenLogo
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
          const first = reverseStack ? index === tokens.length - 1 : index === 0
          const m = first ? 0 : gap

          return (
            <Box
              key={token.address}
              sx={{
                position: 'relative',
                left: `${m}px`,
                marginRight: `${m}px`,
              }}
            >
              {outsource ? (
                <TokenLogo
                  width={size}
                  height={size}
                  symbol={token.symbol}
                  chain={token.chain}
                  address={token.address}
                />
              ) : (
                <LegacyTokenLogo
                  width={size}
                  symbol={token.symbol}
                  src={token.logo}
                />
              )}
            </Box>
          )
        })}
      </Box>
    )
  }
)

export default StackTokenLogo
