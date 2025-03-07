import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { MAKER_ADDRESS } from '@/hooks/useTokensInfo'
import { getFolioRoute } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { ArrowRightIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { LIMIT_ASSETS } from './index-dtf-table'
interface BasketHoverCardProps {
  indexDTF: IndexDTFItem
  children: React.ReactNode
}

export function BasketHoverCard({ indexDTF, children }: BasketHoverCardProps) {
  const navigate = useNavigate()

  const head = useMemo(
    () => indexDTF.basket.slice(0, LIMIT_ASSETS),
    [indexDTF.basket]
  )

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className="w-[330px] rounded-3xl border-2 border-secondary p-2"
        sideOffset={-50}
      >
        <div className="flex flex-col gap-2 items-center justify-center">
          <div className="m-2 p-2 rounded-xl bg-muted w-fit mr-[13px]">
            <StackTokenLogo
              tokens={head.map((r) => ({
                ...r,
                chain: indexDTF.chainId,
              }))}
              overlap={2}
              size={24}
              reverseStack
              outsource
              withBorder
            />
          </div>
          <div className="flex flex-col gap-2 px-2 w-full max-h-[210px] overflow-y-hidden">
            {head
              // maker to the end, the rest don't order
              .sort((a, b) =>
                a.address.toLowerCase() === MAKER_ADDRESS
                  ? 1
                  : b.address.toLowerCase() === MAKER_ADDRESS
                    ? -1
                    : 0
              )
              .map((token) => (
                <div
                  key={token.address}
                  className="flex items-center gap-2 justify-between py-1"
                >
                  <div className="flex items-center gap-1.5">
                    <TokenLogo
                      address={token.address}
                      symbol={token.symbol}
                      chain={indexDTF.chainId}
                      size="xl"
                    />
                    <div className="flex font-bold gap-1">
                      <span className="text-primary">
                        {token.weight || '12.3'}%
                      </span>
                      <span className="text-ellipsis no-wrap max-w-[100px]">
                        {token.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-muted-foreground no-wrap text-ellipsis max-w-[80px]">
                    ${token.symbol}
                  </div>
                </div>
              ))}
          </div>
          <Button
            variant="outline-primary"
            onClick={(e) => {
              e.stopPropagation()
              navigate(
                getFolioRoute(
                  indexDTF.address,
                  indexDTF.chainId,
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
