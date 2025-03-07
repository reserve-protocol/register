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
  withBorder?: boolean
  borderColor?: string
}

const StackTokenLogo = React.memo(
  ({
    tokens,
    sx = {},
    size,
    reverseStack = false,
    overlap = 0,
    outsource = false,
    withBorder = false,
    borderColor = 'white',
    ...props
  }: Props) => {
    // Create a copy of the array before reversing it
    const orderedTokens = React.useMemo(() => {
      const tokensCopy = [...tokens]
      return reverseStack ? tokensCopy.reverse() : tokensCopy
    }, [tokens, reverseStack])

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
        {orderedTokens.map((token, index) => {
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
                    border: withBorder ? `1px solid ${borderColor}` : 'none',
                  }}
                  symbol={'frax'}
                />
                <LegacyTokenLogo
                  width={size}
                  sx={{
                    position: 'relative',
                    left: index ? `${-6 * (index + 1)}px` : 0,
                    border: withBorder ? `1px solid ${borderColor}` : 'none',
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
                  className={withBorder ? `border border-${borderColor}` : ''}
                />
              ) : (
                <LegacyTokenLogo
                  width={size}
                  symbol={token.symbol}
                  src={token.logo}
                  sx={{
                    border: withBorder ? `1px solid ${borderColor}` : 'none',
                  }}
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
