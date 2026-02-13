import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ChevronRight from 'components/icons/ChevronRight'
import EarnIcon from 'components/icons/EarnIcon'
import { ListedToken } from 'hooks/useTokenList'
import { useAtomValue } from 'jotai'
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { dtfPoolsAtom } from 'state/pools/atoms'
import { BRIDGED_RTOKENS, ROUTES } from 'utils/constants'
import { getAddress } from 'viem'
import VerticalDivider from './VerticalDivider'
import { trackClick } from '@/hooks/useTrackPage'

interface Props {
  token: ListedToken
  className?: string
}

const EarnButton = ({ token, className }: Props) => {
  const navigate = useNavigate()
  const pools = useAtomValue(dtfPoolsAtom)
  const earnData = pools[getAddress(token.id)]

  const handleEarn = () => {
    const addresses = [token.id]

    if (BRIDGED_RTOKENS[token.chain]?.[token.id]) {
      for (const bridgeToken of BRIDGED_RTOKENS[token.chain]?.[token.id]) {
        addresses.push(bridgeToken.address)
      }
    }

    navigate(`${ROUTES.EARN}?underlying=${addresses.join(',')}`)
  }

  if (!earnData) return null

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <VerticalDivider className="block md:hidden" />
      <Button
        onClick={(e) => {
          e.stopPropagation()
          trackClick('discover', 'earn', token.id, token.symbol, token.chain)
          handleEarn()
        }}
        variant="ghost"
        className="w-full md:w-fit md:pr-4 text-sm md:text-base py-1 px-2.5 md:py-3 md:px-4 rounded-lg"
      >
        <div className="flex items-center gap-1 md:gap-2 text-primary justify-between md:justify-start">
          <div className="flex items-center gap-2 md:gap-1">
            <EarnIcon color="currentColor" />
            <div className="flex items-start md:items-center flex-col md:flex-row gap-1">
              <span>Earn: </span>
              <span className="font-bold ml-0 md:ml-1">
                {earnData.maxApy.toFixed(0)}% APY
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <ChevronRight color="currentColor" />
          </div>
          <div className="block md:hidden">
            <ChevronRight color="currentColor" width={16} height={16} />
          </div>
        </div>
      </Button>
    </div>
  )
}
export default memo(EarnButton)
