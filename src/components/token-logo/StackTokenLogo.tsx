import LegacyTokenLogo from 'components/icons/TokenLogo'
import TokenLogo from '.'
import React from 'react'
import { cn } from '@/lib/utils'

interface Props {
  tokens: { symbol: string; logo?: string; address: string; chain?: number }[]
  size?: number
  reverseStack?: boolean
  overlap?: number
  outsource?: boolean
  className?: string
}

const StackTokenLogo = React.memo(
  ({
    tokens,
    size,
    reverseStack = false,
    overlap = 0,
    outsource = false,
    className,
  }: Props) => {
    // Create a copy of the array before reversing it
    const orderedTokens = React.useMemo(() => {
      const tokensCopy = [...tokens]
      return reverseStack ? tokensCopy.reverse() : tokensCopy
    }, [tokens, reverseStack])

    return (
      <div
        className={cn(
          'relative flex items-center min-w-max',
          reverseStack ? 'flex-row-reverse' : 'flex-row',
          className
        )}
      >
        {orderedTokens.map((token, index) => {
          if (token.symbol === 'FRAXBP') {
            return (
              <div className="flex items-center w-7" key={token.address}>
                <LegacyTokenLogo
                  width={size}
                  className="relative"
                  style={{ left: index ? `${-6 * index}px` : 0 }}
                  symbol={'frax'}
                />
                <LegacyTokenLogo
                  width={size}
                  className="relative"
                  style={{ left: index ? `${-6 * (index + 1)}px` : 0 }}
                  symbol={'usdc'}
                />
              </div>
            )
          }

          const gap = -(size ? size / 2 : 6) - overlap
          const first = reverseStack ? index === tokens.length - 1 : index === 0
          const m = first ? 0 : gap

          return (
            <div
              key={token.address}
              className="relative"
              style={{ left: `${m}px`, marginRight: `${m}px` }}
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
            </div>
          )
        })}
      </div>
    )
  }
)

export default StackTokenLogo
