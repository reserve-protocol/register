import DecimalDisplay from '@/components/decimal-display'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/stack-token-logo'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { atom, useAtomValue } from 'jotai'
import { rebalanceMetricsAtom, rebalanceTokenMapAtom } from '../atoms'

export function BasketHoverCard({
  tokens,
  children,
}: {
  tokens: Token[]
  children: React.ReactNode
}) {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className="w-[330px] rounded-3xl border-2 border-secondary p-2"
        sideOffset={-50}
      >
        <div className="flex flex-col gap-2 items-center justify-center">
          <div className="m-2 p-2 rounded-xl bg-muted w-fit">
            <StackTokenLogo
              tokens={tokens}
              overlap={2}
              size={24}
              reverseStack
              outsource
            />
          </div>
          <ScrollArea className="flex flex-col gap-2 px-2 w-full max-h-[250px] overflow-auto">
            {tokens.map((token) => (
              <div
                key={token.address}
                className="flex items-center gap-2 justify-between py-1"
              >
                <div className="flex items-center gap-1.5">
                  <TokenLogo
                    address={token.address}
                    symbol={token.symbol}
                    chain={chainId}
                    size="xl"
                  />
                  <div className="flex font-bold gap-1">
                    <span className="text-ellipsis truncate no-wrap max-w-[120px]">
                      {token.name}
                    </span>
                  </div>
                </div>
                <div className="text-muted-foreground no-wrap text-ellipsis truncate max-w-[100px]">
                  ${token.symbol}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

const auctionTokensAtom = atom((get) => {
  const metrics = get(rebalanceMetricsAtom)
  const tokenMap = get(rebalanceTokenMapAtom)
  const chainId = get(chainIdAtom)

  return {
    deficit:
      metrics?.deficitTokens.map((token) => ({
        ...tokenMap[token.toLowerCase()],
        chain: chainId,
      })) ?? [],
    surplus:
      metrics?.surplusTokens.map((token) => ({
        ...tokenMap[token.toLowerCase()],
        chain: chainId,
      })) ?? [],
  }
})

const RebalanceActionOverview = () => {
  const metrics = useAtomValue(rebalanceMetricsAtom)
  const { deficit, surplus } = useAtomValue(auctionTokensAtom)

  return (
    <div className="grid grid-cols-3 border-t border-b border-secondary">
      <div className="flex flex-col p-4 md:p-6 border-r border-secondary">
        <h4 className="text-legend text-sm mb-1">Est. trade value:</h4>
        <span>
          $
          <DecimalDisplay value={metrics?.auctionSize ?? 0} />
        </span>
      </div>
      <div className="flex flex-col p-4 md:p-6 border-r border-secondary">
        <h4 className="text-legend text-sm mb-1">Selling:</h4>
        <BasketHoverCard tokens={surplus}>
          <div>
            <StackTokenLogo
              tokens={surplus.slice(0, 7)}
              overlap={2}
              size={24}
              outsource
              reverseStack
            />
          </div>
        </BasketHoverCard>
        {!surplus.length && <Skeleton className="w-20 h-6" />}
      </div>
      <div className="flex flex-col p-4 md:p-6 border-r border-secondary">
        <h4 className="text-legend text-sm mb-1">Buying:</h4>
        <BasketHoverCard tokens={deficit}>
          <div>
            <StackTokenLogo
              tokens={deficit.slice(0, 7)}
              overlap={2}
              size={24}
              outsource
              reverseStack
            />
          </div>
        </BasketHoverCard>
        {!deficit.length && <Skeleton className="w-20 h-6" />}
      </div>
    </div>
  )
}

export default RebalanceActionOverview
