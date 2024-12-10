import TokenLogo from '@/components/token-logo'
import { Box } from '@/components/ui/box'
import { Card } from '@/components/ui/card'
import { ITokenBasket, iTokenBasketAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { Asterisk, BoxIcon } from 'lucide-react'

const IndexBasketVisual = ({ basket }: { basket: ITokenBasket }) => {
  const MAX_BAR_TOKENS = 4
  const { tokens, percents } = basket
  const emptySpaces =
    tokens.length > MAX_BAR_TOKENS
      ? Math.min(3, tokens.length - MAX_BAR_TOKENS)
      : 0 // Number of empty spaces to show

  return (
    <div className="relative h-20 rounded-lg overflow-hidden">
      {/* Token sections */}
      {tokens.slice(0, MAX_BAR_TOKENS).map((token, index) => (
        <div
          key={token.symbol}
          className="absolute top-0 bottom-0"
          style={{
            left: `${index * (100 / (MAX_BAR_TOKENS + emptySpaces))}%`,
            width: `${100 / (MAX_BAR_TOKENS + emptySpaces)}%`,
            paddingLeft: index === 0 ? '0' : '8px',
          }}
        >
          <div className="relative w-full h-full bg-muted/90 flex items-center justify-center">
            <TokenLogo
              alt={token.name}
              symbol={token.symbol}
              // className="object-cover"
            />
          </div>
        </div>
      ))}

      {/* Empty spaces for additional tokens */}
      {!!emptySpaces &&
        Array.from({ length: emptySpaces }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="absolute top-0 bottom-0"
            style={{
              left: `${(MAX_BAR_TOKENS + index) * (100 / (MAX_BAR_TOKENS + emptySpaces))}%`,
              width: `${100 / (MAX_BAR_TOKENS + emptySpaces)}%`,
              paddingLeft: '8px',
            }}
          >
            <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
              {/* Empty space content */}
            </div>
          </div>
        ))}

      {/* Vertical divider lines */}
      {Array.from({ length: MAX_BAR_TOKENS + emptySpaces - 1 }).map(
        (_, index) => (
          <div
            key={`divider-${index}`}
            className="absolute top-1.5 bottom-1.5 w-px bg-gray-200"
            style={{
              left: `${(index + 1) * (100 / (MAX_BAR_TOKENS + emptySpaces))}%`,
            }}
          />
        )
      )}
    </div>
  )
}

const IndexBasketTokens = () => {
  return <div>list</div>
}

const IndexBasketPreview = () => {
  const basket = useAtomValue(iTokenBasketAtom)

  if (!basket) {
    return <div></div>
  }

  return (
    <div>
      <IndexBasketVisual basket={basket} />
    </div>
  )
}

const IndexBasketOverview = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-24">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <BoxIcon size={20} />
        </div>
        <div className="flex items-center gap-2">
          <Box variant="circle">
            <Asterisk size={12} />
          </Box>
          <span className="text-legend">Governance delay:</span>{' '}
          <span className="font-bold">2 days</span>
        </div>
      </div>
      <h2 className="text-4xl mb-2">What’s in this token?</h2>
      <p className="text-legend">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      </p>
      <IndexBasketPreview />
    </Card>
  )
}

export default IndexBasketOverview
