import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getFolioRoute, shortenAddress } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { ArrowRightIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Address, erc20Abi } from 'viem'
import { useNavigate } from 'react-router-dom'
import { useReadContracts } from 'wagmi'
import { Top100DTF } from '../types'

const LIMIT_ASSETS = 10

const useBasketTokenMeta = (
  basket: Top100DTF['basket'],
  chainId: number
) => {
  const contracts = useMemo(
    () =>
      basket.slice(0, LIMIT_ASSETS).flatMap((token) => [
        {
          address: token.address as Address,
          abi: erc20Abi,
          functionName: 'symbol' as const,
          chainId,
        },
        {
          address: token.address as Address,
          abi: erc20Abi,
          functionName: 'name' as const,
          chainId,
        },
      ]),
    [basket, chainId]
  )

  const { data } = useReadContracts({
    contracts,
    allowFailure: true,
    query: { enabled: basket.length > 0, staleTime: 300_000 },
  })

  return useMemo(() => {
    const meta: Record<string, { symbol: string; name: string }> = {}
    if (!data) return meta

    const head = basket.slice(0, LIMIT_ASSETS)
    for (let i = 0; i < head.length; i++) {
      const symbol = data[i * 2]?.result as string | undefined
      const name = data[i * 2 + 1]?.result as string | undefined
      if (symbol) {
        meta[head[i].address.toLowerCase()] = {
          symbol,
          name: name || symbol,
        }
      }
    }
    return meta
  }, [data, basket])
}

const Top100BasketHoverCard = ({
  dtf,
  children,
}: {
  dtf: Top100DTF
  children: React.ReactNode
}) => {
  const navigate = useNavigate()
  const head = dtf.basket.slice(0, LIMIT_ASSETS)
  const tokenMeta = useBasketTokenMeta(dtf.basket, dtf.chainId)

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
              tokens={head.map((r) => ({ ...r, chain: dtf.chainId }))}
              overlap={2}
              size={24}
              reverseStack
              outsource
            />
          </div>
          <ScrollArea className="flex flex-col gap-2 px-2 w-full max-h-[250px] overflow-auto">
            {head.map((token) => {
              const meta = tokenMeta[token.address.toLowerCase()]
              const symbol = meta?.symbol || token.symbol
              const name = meta?.name || symbol

              return (
                <div
                  key={token.address}
                  className="flex items-center gap-2 justify-between py-1"
                >
                  <div className="flex items-center gap-1.5">
                    <TokenLogo
                      address={token.address}
                      symbol={symbol}
                      chain={dtf.chainId}
                      size="xl"
                    />
                    <div className="flex font-bold gap-1">
                      {token.weight && (
                        <span className="text-primary">{token.weight}%</span>
                      )}
                      <span className="text-ellipsis truncate no-wrap max-w-[120px]">
                        {name}
                      </span>
                    </div>
                  </div>
                  <div className="text-muted-foreground no-wrap text-ellipsis truncate max-w-[100px]">
                    ${symbol}
                  </div>
                </div>
              )
            })}
          </ScrollArea>
          <Button
            variant="outline-primary"
            onClick={(e) => {
              e.stopPropagation()
              navigate(
                getFolioRoute(
                  dtf.address,
                  dtf.chainId,
                  ROUTES.OVERVIEW + '#basket'
                )
              )
            }}
            className="border-border rounded-xl w-full h-12 text-base font-bold"
          >
            <div className="flex items-center gap-1.5">
              <span>View entire basket</span>
              <ArrowRightIcon className="w-4 h-4" />
            </div>
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export default Top100BasketHoverCard
