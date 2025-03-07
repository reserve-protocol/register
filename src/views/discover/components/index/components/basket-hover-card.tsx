import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { Row } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { getFolioRoute } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { LIMIT_ASSETS } from './index-dtf-table'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { useMemo } from 'react'

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
        className="w-80 rounded-3xl border-2 border-secondary"
        sideOffset={-50}
      >
        <div className="flex flex-col gap-2 items-center justify-center">
          <div className="p-2 rounded-xl bg-muted w-fit mr-1.5">
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
          <div className="flex justify-end">
            <Button
              variant="outline"
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
            >
              See entire basket
            </Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
