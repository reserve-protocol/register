import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { getFolioRoute } from '@/utils'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculatePercentageChange } from '../utils'

const IndexDTFCard = ({ dtf }: { dtf: IndexDTFItem }) => {
  const LIMIT = 4

  const head = dtf.basket.slice(0, LIMIT)
  const tail = dtf.basket.length - LIMIT
  const percentageChange = calculatePercentageChange(dtf.performance)

  return (
    <Link to={getFolioRoute(dtf.address, dtf.chainId)}>
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <TokenLogo src={dtf?.brand?.icon || undefined} size="xl" />
          <div>
            <span>{percentageChange} </span>
            <span className="text-legend">(7d)</span>
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <h4 className="font-semibold mb-[2px]">{dtf.name}</h4>
            <div className="flex">
              <div>{head.map((t) => t.symbol).join(', ')}</div>
              {tail > 0 && (
                <div className="text-[#0955AC] ml-[6px]">+{tail}</div>
              )}
            </div>
          </div>

          <div className="flex items-end">
            <Button variant="muted" size="icon-rounded">
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default IndexDTFCard
